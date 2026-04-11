import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { DRILLS } from '@/shared/config/drillData';
import { createInitialMasteryState } from '@/shared/lib/masteryUtils';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';

interface RuneEquipOverlayProps {
  stats: PlayerStats;
  selectedRuneId: string;
  runeName: string;
  onEquipRune?: (runeInstanceId: string, slotIndex: number) => void;
  onClose: () => void;
}

/**
 * 룬 장착 시 슬롯 선택을 위한 모달 오버레이 컴포넌트입니다.
 */
function RuneEquipOverlay({ stats, selectedRuneId, runeName, onEquipRune, onClose }: RuneEquipOverlayProps) {
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
  const equipmentState = stats.equipmentStates[stats.equippedDrillId] || createInitialMasteryState(stats.equippedDrillId, equippedDrill.maxSkillSlots);
  const unlockedSlots = equippedDrill.maxSkillSlots || 0;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-300">
      <div className="bg-[#1a1a1b] border-2 border-[#eab308] rounded-2xl md:rounded-4xl p-6 md:p-10 max-w-lg w-full shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-2 tracking-tighter text-center">Equip Rune</h3>
        <p className="text-zinc-500 text-xs text-center mb-8 font-medium">Select target socket for {runeName}</p>
        
        <div className="flex justify-center gap-4 mb-10">
          {Array.from({ length: equippedDrill.maxSkillSlots || 0 }).map((_, i) => {
            const isUnlocked = i < unlockedSlots;
            const currentRuneInstanceId = (equipmentState.slottedRunes || [])[i];
            const currentRuneItem = stats.inventoryRunes?.find(g => g.id === currentRuneInstanceId);
            
            return (
              <button
                key={i}
                disabled={!isUnlocked}
                onClick={() => {
                  onEquipRune?.(selectedRuneId, i);
                  onClose();
                }}
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308]/50 ${
                  isUnlocked
                    ? 'bg-zinc-900 border-zinc-700 hover:border-[#eab308] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                    : 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  currentRuneItem ? (
                    <div className="flex flex-col items-center w-full h-full">
                      <SkillRuneIcon runeId={currentRuneItem.runeId} rarity={currentRuneItem.rarity as any} size={70} />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity z-20">
                        <span className="text-[10px] font-black text-[#eab308] tracking-widest uppercase">Replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black text-[#eab308] tracking-widest">EQUIP</span>
                    </div>
                  )
                ) : (
                  <span className="text-2xl grayscale">🔒</span>
                )}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-4 bg-zinc-800 text-white rounded-xl font-bold tracking-widest hover:bg-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

export default React.memo(RuneEquipOverlay);
