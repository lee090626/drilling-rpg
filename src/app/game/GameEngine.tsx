'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createInitialWorld, GameWorld } from '../../entities/world/model';
import { fetchBaseLayout, fetchEntities } from '../../shared/lib/dataLoader';
import { saveManager, SaveData } from '../../shared/lib/saveManager';
import { MINERALS } from '../../shared/config/mineralData';

// Widgets
import Hud from '../../widgets/hud/ui/Hud';
import Shop from '../../widgets/shop/Shop';
import Inventory from '../../widgets/inventory/Inventory';
import Crafting from '../../widgets/crafting/Crafting';
import StatusWindow from '../../widgets/status/StatusWindow';
import Settings from '../../widgets/settings/Settings';
import Elevator from '../../widgets/elevator/Elevator';
import Encyclopedia from '../../widgets/encyclopedia/Encyclopedia';
import RefineryWindow from '../../widgets/refinery/RefineryWindow';
import Laboratory from '../../widgets/laboratory/Laboratory';
import GuideWindow from '../../widgets/guide/GuideWindow';

// Hooks
import { useGameUI } from './hooks/useGameUI';
import { useGameActions } from './hooks/useGameActions';
import MobileController from '../../features/input/ui/MobileController';

const SHORTCUTS: Record<string, keyof GameWorld['ui']> = {
  'i': 'isInventoryOpen',
  'c': 'isStatusOpen',
  'b': 'isEncyclopediaOpen',
  'v': 'isElevatorOpen',
  'r': 'isLaboratoryOpen',
  'h': 'isGuideOpen',
  's': 'isSettingsOpen'
};

interface GameSyncData {
  stats: any;
  pos: { x: number; y: number };
  visualPos: { x: number; y: number };
  shake: number;
}

/** 
 * 전역 워커 관리 (Singleton)
 * 리렌더링이나 Strict Mode에 관계없이 워커 인스턴스를 하나만 유지합니다.
 */
let globalWorker: Worker | null = null;

export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const hasTransferredRef = useRef(false);
  const worldRef = useRef<GameWorld>(createInitialWorld(12345));
  
  const [syncData, setSyncData] = useState<GameSyncData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [uiVersion, setUiVersion] = useState(0); 
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isEngineReady, setIsEngineReady] = useState(false);
  const isReadyRef = useRef(false);

  // isEngineReady 상태와 Ref를 동기화하여 타임아웃에서 참조 가능하게 함
  useEffect(() => {
    isReadyRef.current = isEngineReady;
  }, [isEngineReady]);

  const updateUi = useCallback(() => {
    setUiVersion(v => v + 1);
  }, []);

  const sendToWorker = useCallback((type: string, payload?: any, transfer?: Transferable[]) => {
    if (globalWorker) {
      globalWorker.postMessage({ type, payload }, transfer || []);
    }
  }, []);

  const loadImageBitmap = useCallback((url: string): Promise<ImageBitmap> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => createImageBitmap(img).then(resolve).catch(reject);
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  const loadAssetsAndTransfer = useCallback(async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const assetsPath = `${basePath}/assets`;

    try {
      // 1. Load Manifest
      const manifestRes = await fetch(`${assetsPath}/manifest.json`);
      if (!manifestRes.ok) throw new Error('Failed to load atlas manifest');
      const manifest = await manifestRes.json();

      const atlasData: any[] = [];
      const transferList: Transferable[] = [];

      // 2. Load each Atlas
      await Promise.all(manifest.atlasFiles.map(async (jsonFile: string) => {
        const jsonRes = await fetch(`${assetsPath}/${jsonFile}`);
        const jsonData = await jsonRes.json();
        
        // Find corresponding image file (atlas-X.webp)
        const webpFile = jsonFile.replace('.json', '.webp');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = `${assetsPath}/${webpFile}`;
        });
        
        const bitmap = await createImageBitmap(img);
        atlasData.push({ json: jsonData, bitmap });
        transferList.push(bitmap);
      }));

      // 3. Load other static data
      const [layout, entities] = await Promise.all([fetchBaseLayout(), fetchEntities()]);

      // 4. Send to Worker
      sendToWorker('ASSETS_ATLAS', { atlasData, layout, entities }, transferList);
      console.log(`[Main] Sent ${atlasData.length} atlases to worker.`);
    } catch (err) {
      console.error("Asset transfer failed:", err);
      // Fallback: If atlas fails, engine ready anyway to prevent stuck loading
      setIsEngineReady(true);
    }
  }, [sendToWorker]);

  const { closeAllModals, toggleModal, handleClose, handleOpen, isAnyModalOpen } = useGameUI(worldRef, updateUi);
  const { handleUpgrade, handleCraft, handleSell, handleExtractRune, handleSynthesizeRunes, handleEquipDrill, handleEquipDrone, handleEquipRune, handleUnequipRune, handleSelectCheckpoint, handleResetGame, handleRegenerateWorld, handleExportSave, handleImportSave, handleStartSmelting, handleCollectSmelting, handleUnlockResearch, handleUseArtifact, handleEquipArtifact, handleTravelDimension, handleRespawn } = useGameActions(worldRef, updateUi, sendToWorker);

  // 1. 워커 엔진 초기화 (최초 1회)
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    if (!globalWorker) {
      globalWorker = new Worker(new URL('./worker/game.worker.ts', import.meta.url));
      console.log('[Main] Worker Singleton Created.');
    }

    const worker = globalWorker;
    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'SYNC' && payload) {
        // 데이터가 들어오면 엔진이 준비된 것으로 간주 (백업 로직)
        if (!isReadyRef.current) {
          console.log('[Main] Received FIRST SYNC. Setting engine ready.');
          setIsEngineReady(true);
        }
        
        // 기존 속성별 동기화 방식으로 복구
        worldRef.current.player.stats = payload.stats;
        worldRef.current.player.pos = payload.pos;
        worldRef.current.player.visualPos = payload.visualPos;
        worldRef.current.shake = payload.shake;
        setSyncData(payload);
      } else if (type === 'ENGINE_READY') {
        setIsEngineReady(true);
        console.log('[Main] Engine is ready to render!');
      } else if (type === 'SAVE') {
        saveManager.save(payload);
      } else if (type === 'EXPORT_DATA') {
        const exported = saveManager.export(payload);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(exported);
          alert('Save code copied to clipboard!');
        }
      } else if (type === 'PORTAL_TRIGGERED') {
        const nextDim = payload.nextDim;
        if (confirm(`Dimension ${nextDim}으로 이동하시겠습니까?\n새로운 세계에서 모험이 시작됩니다!`)) {
          handleTravelDimension();
        }
      } else if (type === 'DIMENSION_TRAVEL_COMPLETE') {
        alert(`Dimension ${payload.dimension}에 도착했습니다!`);
      }
    };

    const saved = saveManager.load();
    console.log('[Main] Sending INIT to worker...');
    worker.postMessage({ 
      type: 'INIT', 
      payload: { seed: saved?.stats.mapSeed || 12345, saveData: saved } 
    });

    loadAssetsAndTransfer();

    // 5초 타임아웃: 엔진이 응답하지 않으면 강제로 로딩 화면 해제
    const timeoutId = setTimeout(() => {
      if (!isReadyRef.current) {
        console.warn('[Main] Engine initialization timeout (5s). Forcing start...');
        setIsEngineReady(true);
      }
    }, 5000);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        if (isAnyModalOpen()) closeAllModals();
        else handleOpen('isSettingsOpen');
        return;
      }
      const target = SHORTCUTS[key];
      if (target) {
        if (isAnyModalOpen()) {
          if (worldRef.current.ui[target]) handleClose(target);
        } else handleOpen(target);
        return;
      }
      if (isAnyModalOpen()) return;
      sendToWorker('INPUT', { keys: { [key]: true } });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      sendToWorker('INPUT', { keys: { [e.key.toLowerCase()]: false } });
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      sendToWorker('RESIZE', { width, height });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [loadAssetsAndTransfer, sendToWorker]);

  // 2. 캔버스 엘리먼트 유효성 감지 및 제어권 전송 (재마운트 대응)
  useEffect(() => {
    if (!globalWorker || !canvasRef.current) return;

    try {
      const offscreen = canvasRef.current.transferControlToOffscreen();
      globalWorker.postMessage({ type: 'SET_CANVAS', payload: { offscreen } }, [offscreen]);
      console.log('[Main] Canvas control transferred.');
    } catch (e) {
      // 이미 전송된 경우 등의 오류 무시
    }
  }, [isClient]);

  if (!isClient) return <div className="fixed inset-0 bg-zinc-950" />;

  const world = worldRef.current;
  const { ui, player } = world;

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className="w-full h-full block relative z-0 opacity-100"
      />

      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="pointer-events-auto w-full h-full">
          <Hud 
            stats={player.stats} 
            pos={player.pos}
            onOpenStatus={() => toggleModal('isStatusOpen')}
            onOpenInventory={() => toggleModal('isInventoryOpen')}
            onOpenEncyclopedia={() => toggleModal('isEncyclopediaOpen')} 
            onOpenElevator={() => toggleModal('isElevatorOpen')}
            onOpenSettings={() => toggleModal('isSettingsOpen')}
            onOpenGuide={() => toggleModal('isGuideOpen')}
          />
        </div>

        {player.stats.hp > 0 && world.ui.isMobile && (
          <MobileController 
            onJoystickMove={(data) => {
              worldRef.current.mobileJoystick = data;
            }}
            onActionPress={() => {
              worldRef.current.keys[' '] = true;
              setTimeout(() => {
                worldRef.current.keys[' '] = false;
              }, 100);
            }}
          />
        )}
      </div>

      {/* Modals ... */}
      {ui.isShopOpen && <Overlay key="shop" onClose={() => handleClose('isShopOpen')}><Shop stats={{ ...worldRef.current.player.stats }} onClose={() => handleClose('isShopOpen')} onUpgrade={handleUpgrade} onSell={handleSell} onExtractRune={handleExtractRune} onSynthesizeRunes={handleSynthesizeRunes} /></Overlay>}
      {ui.isStatusOpen && <Overlay key="status" onClose={() => handleClose('isStatusOpen')}><StatusWindow stats={player.stats} onClose={() => handleClose('isStatusOpen')} onUnequipRune={handleUnequipRune} onEquipArtifact={handleEquipArtifact} /></Overlay>}
      {ui.isInventoryOpen && <Overlay key="inventory" onClose={() => handleClose('isInventoryOpen')}><Inventory stats={player.stats} onClose={() => handleClose('isInventoryOpen')} onEquip={(id, type) => { if (type === 'drill') handleEquipDrill(id); else handleEquipDrone(id); }} onEquipRune={handleEquipRune} /></Overlay>}
      {ui.isCraftingOpen && <Overlay key="crafting" onClose={() => handleClose('isCraftingOpen')}><Crafting stats={player.stats} onClose={() => handleClose('isCraftingOpen')} onCraft={handleCraft} /></Overlay>}
      {ui.isElevatorOpen && <Overlay key="elevator" onClose={() => handleClose('isElevatorOpen')}><Elevator stats={player.stats} onClose={() => handleClose('isElevatorOpen')} onSelectCheckpoint={handleSelectCheckpoint} /></Overlay>}
      {ui.isEncyclopediaOpen && <Overlay key="encyclopedia" onClose={() => handleClose('isEncyclopediaOpen')}><Encyclopedia stats={player.stats} onClose={() => handleClose('isEncyclopediaOpen')} /></Overlay>}
      {ui.isRefineryOpen && <Overlay key="refinery" onClose={() => handleClose('isRefineryOpen')}><RefineryWindow stats={player.stats} onClose={() => handleClose('isRefineryOpen')} onStartSmelting={handleStartSmelting} onCollectSmelting={handleCollectSmelting} /></Overlay>}
      {ui.isSettingsOpen && <Overlay key="settings" onClose={() => handleClose('isSettingsOpen')}><Settings onClose={() => handleClose('isSettingsOpen')} onReset={handleResetGame} onRegenerateWorld={handleRegenerateWorld} onExport={handleExportSave} onImport={() => {
        const code = prompt('Enter save code:');
        if (code) handleImportSave(code);
      }} /></Overlay>}
      {world.ui.isLaboratoryOpen && <Overlay key="laboratory" onClose={() => handleClose('isLaboratoryOpen')}><Laboratory stats={player.stats} onUnlockResearch={handleUnlockResearch} onClose={() => handleClose('isLaboratoryOpen')} /></Overlay>}
      {world.ui.isGuideOpen && <Overlay key="guide" onClose={() => handleClose('isGuideOpen')}><GuideWindow onClose={() => handleClose('isGuideOpen')} /></Overlay>}
      
      {/* Death Overlay */}
      {player.stats.hp <= 0 && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-xl animate-in fade-in duration-700">
           <div className="text-center space-y-8 p-12 bg-zinc-950/80 border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-900/40 max-w-md w-full">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-red-500 tracking-tighter uppercase italic drop-shadow-sm">
                  Driller Down
                </h2>
                <p className="text-zinc-400 font-medium tracking-widest text-xs uppercase">
                  Structural integrity compromised
                </p>
              </div>
              
              <div className="py-4">
                <div className="text-4xl font-mono text-zinc-500">
                  DEPTH: <span className="text-white">{player.stats.depth}m</span>
                </div>
              </div>

              <button 
                onClick={handleRespawn}
                className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest text-sm"
              >
                Request Respawn
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-6 lg:p-12 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto">
      <div className="w-full max-w-[1280px] h-full lg:h-auto lg:aspect-video max-h-[95vh] lg:max-h-[85vh] relative pointer-events-auto flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
