import React from 'react';
import { GameWorld } from '@/entities/world/model';
import MobileController from '@/features/input/ui/MobileController';
import Hud from '@/widgets/hud/ui/Hud';
import Shop from '@/widgets/shop/Shop';
import Inventory from '@/widgets/inventory/Inventory';
import Crafting from '@/widgets/crafting/Crafting';
import StatusWindow from '@/widgets/status/StatusWindow';
import Settings from '@/widgets/settings/Settings';
import Elevator from '@/widgets/elevator/Elevator';
import Encyclopedia from '@/widgets/encyclopedia/Encyclopedia';

import Laboratory from '@/widgets/laboratory/Laboratory';
import GuideWindow from '@/widgets/guide/GuideWindow';
import ToastContainer from '@/shared/ui/ToastContainer';
import { useGameStore } from '@/shared/lib/store';

interface GameOverlayProps {
  worldRef: React.MutableRefObject<GameWorld>;
  stats: any;
  interpolatedState: React.MutableRefObject<{ x: number, y: number, camX: number, camY: number, shake: number, hp: number }>;
  uiActions: any; // return of useGameUI
  gameActions: any; // return of useGameActions
  visibleEntitiesCount: number;
  sendToWorker: (type: string, payload?: any) => void;
}

export default function GameOverlay({
  worldRef,
  stats,
  interpolatedState,
  uiActions,
  gameActions,
  visibleEntitiesCount,
  sendToWorker
}: GameOverlayProps) {
  const world = worldRef.current;
  const { ui, player } = world;
  const showInteractionPrompt = useGameStore((state) => state.ui.showInteractionPrompt);
  const activeInteractionType = useGameStore((state) => state.ui.activeInteractionType);
  const currentStats = stats || player.stats;

  const { toggleModal, handleClose } = uiActions;
  const {
    handleUpgrade, handleCraft, handleSell, handleSummonRune, handleSynthesizeRunes,
    handleEquipDrill, handleEquipDrone, handleEquipRune, handleUnequipRune,
    handleSelectCheckpoint, handleResetGame, handleExportSave,
    handleImportSave, handleStartSmelting, handleCollectSmelting, handleUnlockResearch,
    handleUseArtifact, handleEquipArtifact, handleTravelDimension, handleRespawn
  } = gameActions;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="pointer-events-auto w-full h-full">
        <Hud 
          stats={currentStats} 
          pos={{ x: interpolatedState.current.x, y: interpolatedState.current.y }}
          onOpenStatus={() => toggleModal('isStatusOpen')}
          onOpenInventory={() => toggleModal('isInventoryOpen')}
          onOpenEncyclopedia={() => toggleModal('isEncyclopediaOpen')} 
          onOpenElevator={() => toggleModal('isElevatorOpen')}
          onOpenSettings={() => toggleModal('isSettingsOpen')}
          onOpenGuide={() => toggleModal('isGuideOpen')}
        />
      </div>

      {currentStats.hp > 0 && world.ui.isMobile && (
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

      {ui.isShopOpen && <Overlay key="shop" onClose={() => handleClose('isShopOpen')}><Shop stats={currentStats} onClose={() => handleClose('isShopOpen')} onUpgrade={handleUpgrade} onSell={handleSell} onSummonRune={handleSummonRune} onSynthesizeRunes={handleSynthesizeRunes} /></Overlay>}
      {ui.isStatusOpen && <Overlay key="status" onClose={() => handleClose('isStatusOpen')}><StatusWindow stats={currentStats} onClose={() => handleClose('isStatusOpen')} onUnequipRune={handleUnequipRune} onEquipArtifact={handleEquipArtifact} /></Overlay>}
      {ui.isInventoryOpen && <Overlay key="inventory" onClose={() => handleClose('isInventoryOpen')}><Inventory stats={currentStats} onClose={() => handleClose('isInventoryOpen')} onEquip={(id, type) => { if (type === 'drill') handleEquipDrill(id); else handleEquipDrone(id); }} onEquipRune={handleEquipRune} /></Overlay>}
      {ui.isCraftingOpen && <Overlay key="crafting" onClose={() => handleClose('isCraftingOpen')}><Crafting stats={currentStats} onClose={() => handleClose('isCraftingOpen')} onCraft={handleCraft} /></Overlay>}
      {ui.isElevatorOpen && <Overlay key="elevator" onClose={() => handleClose('isElevatorOpen')}><Elevator stats={currentStats} onClose={() => handleClose('isElevatorOpen')} onSelectCheckpoint={handleSelectCheckpoint} /></Overlay>}
      {ui.isEncyclopediaOpen && <Overlay key="encyclopedia" onClose={() => handleClose('isEncyclopediaOpen')}><Encyclopedia stats={currentStats} onClose={() => handleClose('isEncyclopediaOpen')} /></Overlay>}
      {/* [삭제됨] RefineryWindow — 용광로 시스템 제거됨 */}
      {ui.isSettingsOpen && <Overlay key="settings" onClose={() => handleClose('isSettingsOpen')}><Settings onClose={() => handleClose('isSettingsOpen')} onReset={handleResetGame} onExport={handleExportSave} onImport={() => {
        const code = prompt('Enter save code:');
        if (code) handleImportSave(code);
      }} /></Overlay>}
      {world.ui.isLaboratoryOpen && <Overlay key="laboratory" onClose={() => handleClose('isLaboratoryOpen')}><Laboratory stats={currentStats} onUnlockResearch={handleUnlockResearch} onClose={() => handleClose('isLaboratoryOpen')} /></Overlay>}
      {world.ui.isGuideOpen && <Overlay key="guide" onClose={() => handleClose('isGuideOpen')}><GuideWindow onClose={() => handleClose('isGuideOpen')} /></Overlay>}
      
      {/* Death Overlay */}
      {currentStats.hp <= 0 && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-xl animate-in fade-in duration-700">
           <div className="text-center space-y-8 p-12 bg-zinc-950/80 border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-900/40 max-w-md w-full pointer-events-auto">
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
                  DEPTH: <span className="text-white">{currentStats.depth}m</span>
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
      
      <ToastContainer />

      {/* Interaction Prompt Overlay */}
      {showInteractionPrompt && activeInteractionType && (
        <div className="absolute left-1/2 bottom-32 md:bottom-40 lg:bottom-44 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-none">
            <div className="flex items-center px-10 justify-center w-15 h-10 bg-emerald-500 text-black font-black rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <span className="text-base">Space</span>
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
