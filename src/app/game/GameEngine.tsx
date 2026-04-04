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

  const updateUi = useCallback(() => {
    setUiVersion(v => v + 1);
  }, []);

  const sendToWorker = useCallback((type: string, payload?: any, transfer?: Transferable[]) => {
    if (globalWorker) {
      globalWorker.postMessage({ type, payload }, transfer || []);
    }
  }, []);

  const loadAssetsAndTransfer = useCallback(async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const assetsToLoad = [
      { name: 'player', url: `${basePath}/Player.png` },
      { name: 'tileset', url: `${basePath}/BaseTileset.png` },
    ];

    try {
      const bitmaps: Record<string, ImageBitmap> = {};
      const transferList: Transferable[] = [];

      await Promise.all(assetsToLoad.map(async (asset) => {
        const response = await fetch(asset.url);
        const blob = await response.blob();
        if (asset.name === 'tileset') {
          const b1 = await createImageBitmap(blob);
          const b2 = await createImageBitmap(blob);
          bitmaps['tileset'] = b1;
          bitmaps['baseTileset'] = b2;
          transferList.push(b1, b2);
        } else {
          const b = await createImageBitmap(blob);
          bitmaps[asset.name] = b;
          transferList.push(b);
        }
      }));

      const [layout, entities] = await Promise.all([fetchBaseLayout(), fetchEntities()]);
      const entityBitmaps: Record<string, ImageBitmap> = {};
      await Promise.all(entities.map(async (ent) => {
        if (ent.imagePath) {
          const url = ent.imagePath.startsWith('/') ? `${basePath}${ent.imagePath}` : `${basePath}/${ent.imagePath}`;
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const b = await createImageBitmap(blob);
            entityBitmaps[ent.imagePath] = b;
            transferList.push(b);
          } catch(e) {}
        }
      }));

      const tileBitmaps: Record<string, ImageBitmap> = {};
      const itemBitmaps: Record<string, ImageBitmap> = {};
      await Promise.all(MINERALS.map(async (m) => {
        if (m.tileImage) {
          const url = typeof m.tileImage === 'string' ? m.tileImage : m.tileImage.src;
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const b = await createImageBitmap(blob);
            tileBitmaps[m.key] = b;
            transferList.push(b);
          } catch(e) {}
        }
        if (m.image) {
          const url = typeof m.image === 'string' ? m.image : m.image.src;
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const b = await createImageBitmap(blob);
            itemBitmaps[m.key] = b;
            transferList.push(b);
          } catch(e) {}
        }
      }));

      sendToWorker('ASSETS', { bitmaps, entityBitmaps, tileBitmaps, itemBitmaps, layout, entities }, transferList);
    } catch (err) {
      console.error("Asset transfer failed:", err);
    }
  }, [sendToWorker]);

  const { closeAllModals, toggleModal, handleClose, handleOpen, isAnyModalOpen } = useGameUI(worldRef, updateUi);
  const { handleUpgrade, handleCraft, handleSell, handleExtractRune, handleSynthesizeRunes, handleEquipDrill, handleEquipDrone, handleEquipRune, handleUnequipRune, handleSelectCheckpoint, handleResetGame, handleRegenerateWorld, handleExportSave, handleImportSave, handleStartSmelting, handleCollectSmelting, handleUnlockResearch, handleUseArtifact, handleEquipArtifact, handleTravelDimension } = useGameActions(worldRef, updateUi, sendToWorker);

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
        if (!isEngineReady) {
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
    worker.postMessage({ 
      type: 'INIT', 
      payload: { seed: saved?.stats.mapSeed || 12345, saveData: saved } 
    });

    loadAssetsAndTransfer();

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

  if (!isClient) return <div className="text-white p-20 font-mono">INITIALIZING ENGINE...</div>;

  const world = worldRef.current;
  const { ui, player } = world;

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className={`w-full h-full block relative z-0 transition-opacity duration-1000 ${isEngineReady ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Loading Overlay (AdSense Bot Visibility Layer) */}
      {!isEngineReady && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-10 space-y-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl animate-bounce">
              <span className="text-4xl font-black italic">D</span>
            </div>
            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              Drilling <span className="text-cyan-500">RPG</span>
            </h2>
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-[0.3em]">Dimension Neural Syncing...</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs text-[10px] text-zinc-500 font-mono uppercase tracking-widest pt-12">
            <div className="p-3 border border-white/5 rounded-xl bg-white/5">WASD to Move</div>
            <div className="p-3 border border-white/5 rounded-xl bg-white/5">Space to Mine</div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-10 pointer-events-none">
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
