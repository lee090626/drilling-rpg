import React from 'react';
import { DRILLS } from '@/shared/config/drillData';
import { getNextLevelExp, createInitialMasteryState } from '@/shared/lib/masteryUtils';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface DrillCardProps {
  drillId: string;
  isEquipped: boolean;
  equipmentStates: Record<string, any>;
  onEquip?: (id: string, type: 'drill' | 'drone') => void;
}

/**
 * 인벤토리 장비 탭에서 개별 드릴을 표시하는 카드 컴포넌트입니다.
 */
function DrillCard({ drillId, isEquipped, equipmentStates, onEquip }: DrillCardProps) {
  const drill = DRILLS[drillId];
  if (!drill) return null;

  const equipmentState = equipmentStates[drillId] || createInitialMasteryState(drillId, drill.maxSkillSlots);
  const nextExp = getNextLevelExp(equipmentState.level);
  const expPercent = Math.min(100, (equipmentState.exp / nextExp) * 100);
  const unlockedSlots = drill.maxSkillSlots || 0;

  return (
    <div
      className={`p-4 md:p-8 rounded-2xl md:rounded-4xl border-2 transition-all flex flex-col group relative overflow-hidden ${
        isEquipped
          ? 'bg-[#252526] border-[#eab308] shadow-2xl'
          : 'bg-[#252526] border-zinc-800 opacity-60 hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-6 mb-8 text-left">
        <div className="w-28 h-28 md:w-36 md:h-36 bg-zinc-950 rounded-3xl flex items-center justify-center border border-zinc-900 shadow-inner overflow-hidden">
          {drill.image ? (
            <AtlasIcon name={drill.image} size={128} />
          ) : (
            <span className="text-6xl">{drill.icon}</span>
          )}
        </div>
        <div>
          <div
            className={`text-xs font-bold mb-2 tracking-widest ${isEquipped ? 'text-[#eab308]' : 'text-zinc-600'}`}
          >
            {isEquipped ? 'Equipped' : 'Storage'} • {drill.equipmentType}
          </div>
          <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            {drill.name}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {[
          ['ATTACK', drill.basePower],
          ['SPEED', `${drill.cooldownMs}ms`],
          ['Mobility', drill.moveSpeedMult && drill.moveSpeedMult > 1 ? `+${Math.round((drill.moveSpeedMult - 1) * 100)}%` : 'BASIC'],
        ].map(([l, v]) => (
          <div
            key={l as string}
            className="bg-zinc-950 p-4 rounded-2xl text-center border border-zinc-900 shadow-inner"
          >
            <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest">
              {l}
            </div>
            <div className="text-sm md:text-lg font-black text-white">
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* MASTERY & EXP IN INVENTORY */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2 opacity-20 pointer-events-none">
          <div className="flex justify-between items-end">
            <span className="text-xs text-zinc-400 font-bold tracking-widest italic">Drill Mastery (Removed)</span>
            <span className="text-xs text-zinc-500 font-bold tabular-nums">0%</span>
          </div>
          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="h-full bg-[#eab308] rounded-full transition-all duration-500"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900/50">
          <span className="text-xs text-zinc-400 font-bold tracking-widest">Rune Slots</span>
          <div className="flex gap-2">
            {Array.from({ length: drill.maxSkillSlots || 0 }).map((_, i) => {
              const isUnlocked = i < unlockedSlots;
              const hasRune = (equipmentState.slottedRunes || [])[i];
              return (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                    isUnlocked 
                      ? hasRune ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-transparent'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-800 opacity-40'
                  }`}
                >
                  {isUnlocked ? (hasRune ? '⚙️' : '') : '🔒'}
                </div>
              );
            })}
            {!(drill.maxSkillSlots) && (
              <span className="text-sm text-zinc-700 italic">NONE</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        {!isEquipped && (
          <button
            onClick={() => onEquip?.(drillId, 'drill')}
            className="w-full py-6 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-lg tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            Equip
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(DrillCard);
