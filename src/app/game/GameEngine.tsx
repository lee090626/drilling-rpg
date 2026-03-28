'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createInitialWorld, GameWorld } from '../../entities/world/model';
import { inputSystem } from '../../features/input/inputSystem';
import { physicsSystem } from '../../features/movement/physicsSystem';
import { miningSystem } from '../../features/mining/miningSystem';
import { interactionSystem } from '../../features/interaction/interactionSystem';
import { renderSystem } from '../../features/render/renderSystem';
import { effectSystem } from '../../features/effects/effectSystem';
import { refinerySystem } from '../../features/refinery/refinerySystem';
import { fetchBaseLayout, fetchEntities } from '../../shared/lib/dataLoader';
import { saveManager, SaveData } from '../../shared/lib/saveManager';

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

// Hooks
import { useGameUI } from './hooks/useGameUI';
import { useGameActions } from './hooks/useGameActions';
import MobileController from '../../features/input/ui/MobileController';

/** 
 * 게임 내 단축키 매핑 정보 (모달 창 제어) 
 */
const SHORTCUTS: Record<string, keyof GameWorld['ui']> = {
  'i': 'isInventoryOpen',      // 인벤토리
  'c': 'isStatusOpen',         // 상태창
  'b': 'isEncyclopediaOpen',   // 도감
  'v': 'isElevatorOpen',       // 엘리베이터
  'r': 'isLaboratoryOpen',     // 연구소
  's': 'isSettingsOpen'        // 설정
};

/**
 * 게임의 핵심 엔진 컴포넌트입니다.
 * ECS 시스템 실행, 리소스 로딩, 저장 데이터 관리, 단축키 처리 및 전체 UI 레이아웃을 담당합니다.
 */
export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 게임의 전체 상태(WorldState)를 관리하는 Ref */
  const worldRef = useRef<GameWorld>(createInitialWorld(12345));
  
  const [isClient, setIsClient] = useState(false);
  const [uiVersion, setUiVersion] = useState(0); // UI 강제 업데이트를 위한 버전 상태
  const [windowSize, setWindowSize] = useState({ width: 1280, height: 720 });

  /** World 데이터 변경 시 React UI를 갱신하기 위한 콜백 */
  const updateUi = useCallback(() => {
    setUiVersion(v => v + 1);
  }, []);

  // UI 제어 관련 헬퍼 훅
  const {
    closeAllModals,
    toggleModal,
    handleClose,
    handleOpen,
    isAnyModalOpen
  } = useGameUI(worldRef, updateUi);

  // 게임 내 행동(업그레이드, 판매, 제작 등) 관련 훅
  const {
    handleUpgrade,
    handleCraft,
    handleSell,
    handleExtractRune,
    handleSynthesizeRunes,
    handleEquipDrill,
    handleEquipDrone,
    handleEquipRune,
    handleUnequipRune,
    handleSelectCheckpoint,
    handleResetGame,
    handleRegenerateWorld,
    handleExportSave,
    handleImportSave,
    handleStartSmelting,
    handleCollectSmelting,
    handleUnlockResearch
  } = useGameActions(worldRef, updateUi);


  /**
   * 게임에 필요한 이미지 및 JSON 에셋을 비동기로 로드합니다.
   */
  const loadAssets = useCallback(async () => {
    const world = worldRef.current;
    
    // 불필요한 네트워크 요청 방지를 위한 로드 확인
    if (world.assets.tileset && world.baseLayout && world.baseLayout.length > 0) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // 이미지 리소스 로드
    const playerImg = new Image(); playerImg.src = `${basePath}/Player.png`;
    playerImg.onload = () => world.assets.player = playerImg;

    const tilesetImg = new Image(); tilesetImg.src = `${basePath}/NewTileset.png`;
    tilesetImg.onload = () => world.assets.tileset = tilesetImg;

    const baseTilesetImg = new Image(); baseTilesetImg.src = `${basePath}/BaseTileset.png`;
    baseTilesetImg.onload = () => world.assets.baseTileset = baseTilesetImg;

    // 기지 구성(JSON) 및 엔티티 데이터 로드
    try {
      const [layout, ents] = await Promise.all([
        fetchBaseLayout(),
        fetchEntities()
      ]);
      
      world.baseLayout = layout;
      world.entities = ents;

      // 엔티티별 이미지 에셋 로드
      ents.forEach(entity => {
        if (entity.imagePath && !world.assets.entities[entity.imagePath]) {
          const img = new Image();
          img.src = entity.imagePath.startsWith('/') ? `${basePath}${entity.imagePath}` : `${basePath}/${entity.imagePath}`;
          img.onload = () => {
            world.assets.entities[entity.imagePath!] = img;
          };
        }
      });
    } catch (err) {
      console.error("Failed to load game assets:", err);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);

    // 로컬 스토리지에서 저장 데이터 불러오기
    const saved = saveManager.load();
    
    // 모바일 여부 감지
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    worldRef.current.ui.isMobile = isMobile;

    if (saved) {
      const world = worldRef.current;
      
      // 구버전 세이브 데이터 마이그레이션 (호환성 보장)
      if (!saved.stats.ownedDroneIds) saved.stats.ownedDroneIds = [];
      if (!saved.stats.activeSmeltingJobs) saved.stats.activeSmeltingJobs = [];
      if (!saved.stats.refinerySlots) saved.stats.refinerySlots = 1;
      if (!saved.stats.equippedDroneId) saved.stats.equippedDroneId = null;

      world.player.stats = saved.stats;
      world.player.pos = saved.position;
      world.player.visualPos = { ...saved.position };
      // 저장된 데이터를 타일맵에 직렬화 해제하여 적용
      world.tileMap.deserialize(saved.tileMap, saved.stats.mapSeed, saved.stats.dimension);
    }

    loadAssets();

    // 전역 이벤트 리스너: 키보드 입력 및 화면 크기 변화 처리
    const handleKeyDown = (e: KeyboardEvent) => {
      const { ui } = worldRef.current;
      const key = e.key.toLowerCase();

      // ESC: 열린 모달 닫기 또는 설정창 열기
      if (e.key === 'Escape') {
        if (isAnyModalOpen()) {
          closeAllModals();
        } else {
          handleOpen('isSettingsOpen');
        }
        return;
      }

      // 지정된 단축키 처리
      const target = SHORTCUTS[key];
      if (target) {
        if (isAnyModalOpen()) {
          if (ui[target]) handleClose(target);
        } else {
          handleOpen(target);
        }
        return;
      }

      if (isAnyModalOpen()) return; // 모달이 하나라도 열려 있으면 인게임 조작 무시
      worldRef.current.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      worldRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
    
    handleResize();

    // 개발용: 시작 시 타일 개수 로그 출력 (생성 로직 확인)
    setTimeout(() => {
      const counts: Record<string, number> = {};
      const map = worldRef.current.tileMap;
      for (let y=0; y<100; y++) {
        for(let x=0; x<30; x++) {
          const t = map.getTile(x, y);
          if (t && t.type !== 'empty') {
            counts[t.type] = (counts[t.type] || 0) + 1;
          }
        }
      }
      console.log("CLIENT TILE COUNTS (0-100):", counts);
    }, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [loadAssets, updateUi, handleOpen, handleClose, closeAllModals, isAnyModalOpen]);

  // 게임 메인 루프 (RequestAnimationFrame)
  useEffect(() => {
    if (!isClient) return;

    let frameId: number;
    const loop = (now: number) => {
      const world = worldRef.current;
      const canvas = canvasRef.current;

      // ECS 시스템 실행 단계
      try {
        const deltaTime = now - (world.timestamp.lastLoop || now);
        world.timestamp.lastLoop = now;

        // 조작, 물리, 채굴, 상호작용, 이펙트 시스템 실행
        inputSystem(world);
        physicsSystem(world, now);
        miningSystem(world, now);
        interactionSystem(world);
        effectSystem(world, deltaTime);
        refinerySystem(world, now);
        
        // 렌더링 시스템
        if (canvas) {
          renderSystem(world, canvas);
        }

        // UI 동기화 (성능과 반응성 사이의 균형을 위해 주기적으로 실행)
        if (now - world.timestamp.lastUiUpdate > 500) {
          world.timestamp.lastUiUpdate = now;
          updateUi();
        }

        frameId = requestAnimationFrame(loop);
      } catch (err: any) {
        console.error('GAME LOOP CRASH:', err);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isClient, updateUi]);

  // 주기적인 자동 저장 (10초마다)
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      const world = worldRef.current;
      const saveData: SaveData = {
        version: 1,
        timestamp: Date.now(),
        stats: world.player.stats,
        position: world.player.pos,
        tileMap: world.tileMap.serialize(),
      };
      saveManager.save(saveData);
      console.log('Game Auto-saved');
    }, 10000);
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) return <div className="text-white p-20 font-mono">INITIALIZING ENGINE...</div>;

  const world = worldRef.current;
  const { ui, player } = world;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className="w-full h-full block relative z-0"
      />

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
          />
        </div>

        {/* Mobile Controller (Joystick) */}
        {player.stats.hp > 0 && world.ui.isMobile && (
          <MobileController 
            onJoystickMove={(data) => {
              worldRef.current.mobileJoystick = data;
            }}
            onActionPress={() => {
              // 스페이스바(상호작용) 효과 시뮬레이션
              worldRef.current.keys[' '] = true;
              setTimeout(() => {
                worldRef.current.keys[' '] = false;
              }, 100);
            }}
          />
        )}
      </div>

      {/* Modals */}
      {ui.isShopOpen && (
        <Overlay key="shop" onClose={() => handleClose('isShopOpen')}>
          <Shop 
            stats={{ ...worldRef.current.player.stats }}
            onClose={() => handleClose('isShopOpen')}
            onUpgrade={handleUpgrade}
            onSell={handleSell}
            onExtractRune={handleExtractRune}
            onSynthesizeRunes={handleSynthesizeRunes}
          />
        </Overlay>
      )}

      {ui.isStatusOpen && (
        <Overlay key="status" onClose={() => handleClose('isStatusOpen')}>
          <StatusWindow 
            stats={player.stats} 
            onClose={() => handleClose('isStatusOpen')} 
            onUnequipRune={handleUnequipRune}
          />
        </Overlay>
      )}

      {ui.isInventoryOpen && (
        <Overlay key="inventory" onClose={() => handleClose('isInventoryOpen')}>
          <Inventory 
            stats={player.stats} 
            onClose={() => handleClose('isInventoryOpen')}
            onEquip={(id, type) => {
              if (type === 'drill') handleEquipDrill(id);
              else handleEquipDrone(id);
            }}
            onEquipRune={handleEquipRune}
          />
        </Overlay>
      )}

      {ui.isCraftingOpen && (
        <Overlay key="crafting" onClose={() => handleClose('isCraftingOpen')}>
          <Crafting 
            stats={player.stats} 
            onClose={() => handleClose('isCraftingOpen')}
            onCraft={handleCraft}
          />
        </Overlay>
      )}

      {ui.isElevatorOpen && (
        <Overlay key="elevator" onClose={() => handleClose('isElevatorOpen')}>
          <Elevator 
            stats={player.stats} 
            onClose={() => handleClose('isElevatorOpen')}
            onSelectCheckpoint={handleSelectCheckpoint}
          />
        </Overlay>
      )}

      {ui.isEncyclopediaOpen && (
        <Overlay key="encyclopedia" onClose={() => handleClose('isEncyclopediaOpen')}>
          <Encyclopedia stats={player.stats} onClose={() => handleClose('isEncyclopediaOpen')} />
        </Overlay>
      )}

      {ui.isRefineryOpen && (
        <Overlay key="refinery" onClose={() => handleClose('isRefineryOpen')}>
          <RefineryWindow 
            stats={player.stats} 
            onClose={() => handleClose('isRefineryOpen')}
            onStartSmelting={handleStartSmelting}
            onCollectSmelting={handleCollectSmelting}
          />
        </Overlay>
      )}

      {ui.isSettingsOpen && (
        <Overlay key="settings" onClose={() => handleClose('isSettingsOpen')}>
          <Settings 
            onClose={() => handleClose('isSettingsOpen')} 
            onReset={handleResetGame}
            onRegenerateWorld={handleRegenerateWorld}
            onExport={handleExportSave}
            onImport={() => {
              const code = prompt('Enter save code:');
              if (code) handleImportSave(code);
            }}
          />
        </Overlay>
      )}

          {worldRef.current.ui.isLaboratoryOpen && (
            <Overlay key="laboratory" onClose={() => handleClose('isLaboratoryOpen')}>
              <Laboratory 
                stats={player.stats} 
                onUnlockResearch={handleUnlockResearch}
                onClose={() => handleClose('isLaboratoryOpen')}
              />
            </Overlay>
          )}

          {/* Add other widgets similarly... */}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-6 lg:p-12 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto">
      <div 
        className="w-full max-w-[1280px] h-full lg:h-auto lg:aspect-video max-h-[95vh] lg:max-h-[85vh] relative pointer-events-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
