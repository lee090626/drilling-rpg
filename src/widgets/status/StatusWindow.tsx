import React from 'react';
import Image from 'next/image';
import { PlayerStats } from '@/shared/types/game';
import { DRILLS } from '@/shared/config/drillData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import { MINERALS } from '@/shared/config/mineralData';
import { 
  getNextLevelExp, 
  getMasteryMultiplier, 
  getUnlockedSlotCount,
  createInitialMasteryState,
  createInitialEquipmentState 
} from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { getResearchBonuses } from '@/shared/lib/researchUtils';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface StatusWindowProps {
  stats: PlayerStats;
  onClose: () => void;
  onUnequipRune?: (drillId: string, slotIndex: number) => void;
  onEquipArtifact?: (id: string) => void;
}

function StatusWindow({ stats, onClose, onUnequipRune, onEquipArtifact }: StatusWindowProps) {
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
  
  const equipmentState = stats.equipmentStates[stats.equippedDrillId] || createInitialEquipmentState(stats.equippedDrillId);
  const masteryMult = getMasteryMultiplier(equipmentState.level);
  const nextExp = getNextLevelExp(equipmentState.level);
  const expPercent = Math.min(100, (equipmentState.exp / nextExp) * 100);
  
  const baseAttack = equippedDrill.basePower;
  const masteryBonus = Math.round(baseAttack * (masteryMult - 1));
  
  // Unified Stat Calculations
  const researchBonuses = getResearchBonuses(stats);
  const runePowerBonus = Math.floor(getTotalRuneStat(stats, 'power'));
  const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
  const runeCritRate = getTotalRuneStat(stats, 'critRate');
  const runeCritDmg = getTotalRuneStat(stats, 'critDmg');
  const runeLuck = getTotalRuneStat(stats, 'luck');
  const runeMoveSpeed = getTotalRuneStat(stats, 'moveSpeed');

  const finalPower = stats.power + baseAttack + masteryBonus + runePowerBonus + researchBonuses.power;
  const finalCritRate = runeCritRate;
  const finalCritDmg = 1.5 + runeCritDmg;
  const finalMiningInterval = Math.round(equippedDrill.cooldownMs * (1 - Math.min(0.9, researchBonuses.miningSpeed + runeSpeedBonus)));

  const baseSpeedStat = stats.moveSpeed || 100;
  const baseSpeedMult = (baseSpeedStat / 100) * researchBonuses.moveSpeed;
  const drillSpeedMult = equippedDrill.moveSpeedMult || 1;
  const finalMoveSpeedMult = (baseSpeedMult * drillSpeedMult + (runeMoveSpeed * 0.01)) || 1;

  const finalLuck = runeLuck + (researchBonuses.luck - 1);
  const finalGoldBonus = researchBonuses.goldBonus;

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">👤</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-emerald-400 leading-none">
                Status
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center justify-center gap-2 md:gap-4 bg-zinc-950 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-zinc-800 shadow-inner">
            <div className="flex items-center justify-center">
               <AtlasIcon name="gold" size={32} />
            </div>
            <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-8">
        {/* TOP SECTION: 3 COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* COLUMN 1: COMBAT & MINING */}
        <div className="space-y-4">
          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
            Combat & Mining
          </h3>

          <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col gap-3">
            {[
              { label: 'Total Power', value: finalPower, bonus: runePowerBonus, color: 'text-emerald-400' },
              { label: 'Max HP', value: stats.maxHp, color: 'text-rose-400' },
              { label: 'Crit Rate', value: `${(finalCritRate * 100).toFixed(1)}%`, bonus: runeCritRate > 0 ? `(${(runeCritRate * 100).toFixed(1)}%)` : null, color: 'text-emerald-400' },
              { label: 'Crit Damage', value: `${(finalCritDmg * 100).toFixed(0)}%`, bonus: runeCritDmg > 0 ? `(+${(runeCritDmg * 100).toFixed(0)}%)` : null, color: 'text-emerald-400' },
              { label: 'Mining Speed', value: `${finalMiningInterval}ms`, bonus: runeSpeedBonus > 0 ? `(-${(runeSpeedBonus * 100).toFixed(0)}%)` : null, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="text-[11px] font-bold text-zinc-400 tracking-tight">
                  {stat.label}
                </div>
                <div className={`text-sm font-black ${stat.color} tabular-nums flex items-center gap-1.5`}>
                  {stat.value}
                  {stat.bonus && stat.bonus !== 0 && (
                    <span className="text-[10px] text-blue-400 font-bold">
                      {typeof stat.bonus === 'number' ? `(+${stat.bonus})` : stat.bonus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mt-6 mb-4 border-b border-zinc-800 pb-2">
            Exploration & Utility
          </h3>
          
          <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col gap-3">
            {[
              { label: 'Move Speed', value: `${(finalMoveSpeedMult * 100).toFixed(0)}%`, bonus: runeMoveSpeed > 0 ? `(+${runeMoveSpeed}%)` : null },
              { label: 'Luck (Drop Bonus)', value: `+${(finalLuck * 100).toFixed(0)}%`, bonus: runeLuck > 0 ? `(+${(runeLuck * 100).toFixed(0)}%)` : null },
              { label: 'Gold Bonus', value: `+${((finalGoldBonus - 1) * 100).toFixed(0)}%` },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="text-[11px] font-bold text-zinc-400 tracking-tight">
                  {stat.label}
                </div>
                <div className="text-sm font-black text-[#eab308] tabular-nums flex items-center gap-1.5">
                  {stat.value}
                  {stat.bonus && (
                    <span className="text-[10px] text-blue-400 font-bold">
                      {stat.bonus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: PLAYER DETAILS & RECORDS */}
        <div className="space-y-6 flex flex-col">
          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
            Player Status
          </h3>

          <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 space-y-4">
            {/* HP BAR */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-zinc-400">Health</span>
                <span className="text-sm font-black text-white tabular-nums">
                  {Math.floor(stats.hp)} <span className="text-zinc-500">/ {stats.maxHp}</span>
                </span>
              </div>
              <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[2px]">
                <div
                  className="h-full bg-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* RECORDS */}
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-700/50">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-zinc-400">Max Depth</span>
                 <span className="text-xs font-black text-blue-400">{stats.maxDepthReached || 0}m</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-zinc-400">Dimension</span>
                 <span className="text-xs font-black text-purple-400">Dim {stats.dimension || 0}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-zinc-400">Discovered Minerals</span>
                 <span className="text-xs font-black text-emerald-400">{stats.discoveredMinerals?.length || 0}</span>
               </div>
            </div>
          </div>

          {/* ARTIFACTS SECTION - Taking more space now */}
          <div className="bg-[#252526] p-4 md:p-6 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col min-h-[300px] flex-1">
            <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2 flex justify-between items-center">
              <span>Unlocked Artifacts</span>
              <span className="text-purple-500">{stats.artifacts.length}</span>
            </h4>
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {stats.artifacts.length > 0 ? (
                stats.artifacts.map((artifactId, idx) => {
                  const info = ARTIFACT_DATA[artifactId];
                  const isEquipped = stats.equippedArtifactId === artifactId;
                  
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        isEquipped 
                        ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{info?.icon || '❓'}</span>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs font-black text-white tracking-tight">
                            {info?.name || artifactId}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-medium leading-tight">
                            {info?.description}
                          </span>
                        </div>
                        {isEquipped ? (
                          <span className="text-[9px] bg-purple-600 text-white font-black px-2 py-1 rounded">EQUIPPED</span>
                        ) : (
                          <button 
                            onClick={() => onEquipArtifact?.(artifactId)}
                            className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-1 rounded border border-zinc-700 transition-colors"
                          >
                            EQUIP
                          </button>
                        )}
                      </div>
                      <div className="text-[8px] text-zinc-600 font-bold tracking-widest">
                        Cooldown: {info ? info.cooldownMs / 1000 : 0}s
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 opacity-20 text-[10px] font-bold tracking-widest">
                  Not Discovered
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: EQUIPPED HARDWARE */}
        <div className="space-y-6">
          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
            Equipment
          </h3>

          <div className="bg-[#252526] p-4 md:p-8 rounded-2xl md:rounded-4xl border border-zinc-800 shadow-2xl flex flex-col items-center text-center relative group overflow-hidden">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-2xl md:rounded-3xl flex items-center justify-center border border-zinc-800 shadow-inner transition-transform duration-500 overflow-hidden">
              {equippedDrill.image ? (
                <AtlasIcon name={equippedDrill.image} size={96} />
              ) : (
                <span className="text-4xl md:text-6xl">{equippedDrill.icon}</span>
              )}
            </div>

            <h4 className="text-xl md:text-2xl font-black text-white tracking-tighter mb-2 md:mb-4">
              {equippedDrill.name}
            </h4>

            <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-zinc-800 pt-6">
              <div className="text-center">
                <div className="text-[9px] text-zinc-500 font-bold mb-1">
                  Power
                </div>
                <div className="text-xl font-black text-white flex items-center gap-2 justify-center">
                  {equippedDrill.basePower}
                  {masteryBonus > 0 && (
                    <span className="text-[10px] text-emerald-500">+{masteryBonus}</span>
                  )}
                  {runePowerBonus > 0 && (
                    <span className="text-[10px] text-blue-400">+{runePowerBonus}</span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-zinc-500 font-bold mb-1">
                  Speed
                </div>
                <div className="text-xl font-black text-white">
                  {equippedDrill.cooldownMs}ms
                </div>
              </div>
            </div>

            {/* REMOVED MASTERY & EXP SECTION FROM DRILL */}
            <div className="w-full mt-4 md:mt-6 space-y-4 border-t border-zinc-800/50 pt-4 md:pt-6">
              <div className="text-left">
                <div className="text-[9px] text-zinc-500 font-bold mb-2 tracking-widest flex justify-between items-center">
                  <span>Skill Rune Slots</span>
                  <span className="text-zinc-600 font-black">{equippedDrill.maxSkillSlots || 0} / {equippedDrill.maxSkillSlots || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: equippedDrill.maxSkillSlots || 0 }).map((_, i) => {
                    const isUnlocked = true; // ALL SLOTS UNLOCKED BY DEFAULT OR DRILL PROPERTY
                    const slottedRuneId = (equipmentState.slottedRunes || [])[i];
                    
                    return (
                      <button 
                        key={i} 
                        disabled={!isUnlocked || !slottedRuneId}
                        onClick={() => isUnlocked && slottedRuneId && onUnequipRune?.(stats.equippedDrillId, i)}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl border flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
                          isUnlocked 
                            ? slottedRuneId 
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 active:scale-90 group/rune' 
                              : 'bg-zinc-900 border-zinc-700 text-zinc-600 shadow-inner'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-800 grayscale opacity-40 cursor-not-allowed'
                        }`}
                        title={slottedRuneId ? 'Click to unequip' : ''}
                      >
                        {isUnlocked ? (
                          slottedRuneId ? (
                            (() => {
                              const runeItem = stats.inventoryRunes.find(r => r.id === slottedRuneId);
                              const runeConfig = runeItem ? SKILL_RUNES[runeItem.runeId] : null;
                              return (
                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg md:rounded-xl">
                                  {runeItem && <SkillRuneIcon runeId={runeItem.runeId} rarity={runeItem.rarity as any} size={32} />}
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/rune:opacity-100 transition-opacity z-20">
                                    <span className="text-[10px] text-white font-black">✕</span>
                                  </span>
                                </div>
                              );
                            })()
                          ) : <span className="text-[8px] md:text-[10px] opacity-20">EMPTY</span>
                        ) : (
                          <span className="text-xs md:text-[14px]">🔒</span>
                        )}
                      </button>
                    );
                  })}
                  {!(equippedDrill.maxSkillSlots) && (
                    <span className="text-[9px] md:text-[10px] text-zinc-600 italic">No Slots Available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* BOTTOM SECTION: TILE MASTERY (FULL WIDTH) */}
        <div className="bg-[#1e1e1f] p-4 md:p-8 rounded-2xl md:rounded-4xl border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">⛏️</span>
              <h3 className="text-lg md:text-[22px] font-black text-white tracking-tighter uppercase italic">
                Tile Mastery <span className="text-emerald-500 ml-2">Progress</span>
              </h3>
            </div>
            <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-emerald-400 tracking-widest">
              DISCOVERED: {stats.discoveredMinerals.length}
            </div>
          </div>

          {stats.discoveredMinerals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {stats.discoveredMinerals.map((tileKey, idx) => {
                const mineral = MINERALS.find(m => m.key === tileKey);
                const mastery = (stats.tileMastery && stats.tileMastery[tileKey]) || createInitialMasteryState(tileKey);
                const nextExp = getNextLevelExp(mastery.level);
                const expPercent = Math.min(100, (mastery.exp / nextExp) * 100);
                const masteryMult = getMasteryMultiplier(mastery.level);

                return (
                  <div key={idx} className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 hover:bg-emerald-500/2transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
                        {mineral?.image ? (
                          <AtlasIcon name={mineral.image} size={32} />
                        ) : (
                          <span className="text-lg">{mineral?.icon || '❓'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end gap-1 mb-1">
                          <span className="text-[11px] font-black text-zinc-300 italic truncate uppercase">{mineral?.name || tileKey}</span>
                          <span className="text-[10px] font-black text-emerald-500 shrink-0">LV.{mastery.level}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                          <div 
                            className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000" 
                            style={{ width: `${expPercent}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 pt-3 border-t border-zinc-800/50">
                      <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase">
                        <span className="text-zinc-500">Damage Buff</span>
                        <span className="text-emerald-400">+{((masteryMult - 1) * 100).toFixed(0)}%</span>
                      </div>
                      
                      {/* BREAKTHROUGH BADGES */}
                      <div className="flex justify-between items-center gap-1 mt-1">
                        {[50, 100, 150, 200].map(level => {
                          const isUnlocked = mastery.level >= level;
                          const perkId = `perk_${tileKey}_${level}`;
                          const hasPerk = stats.unlockedMasteryPerks?.includes(perkId);
                          
                          return (
                            <div 
                              key={level}
                              className={`
                                flex-1 flex items-center justify-center h-5 rounded-md border text-[8px] font-bold transition-all
                                ${isUnlocked 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                                }
                              `}
                              title={`${level} Breakthrough: ${tileKey === 'dirt' ? (level === 50 ? 'Speed+' : level === 100 ? 'HP Recov' : level === 150 ? 'Speed++' : 'Global Speed') : 'Locked'}`}
                            >
                              {isUnlocked ? '✨' : level}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center text-[8px] font-bold tabular-nums">
                        <span className="text-zinc-600">EXPERIENCE</span>
                        <span className="text-zinc-400">{mastery.exp} <span className="text-zinc-700">/</span> {nextExp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-zinc-950/50 rounded-3xl border border-dashed border-zinc-800 opacity-30">
              <span className="text-4xl mb-4">🔦</span>
              <span className="text-xs font-black tracking-widest uppercase">Start mining to unlock Tile Mastery!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(StatusWindow, (prev, next) => {
  return prev.stats === next.stats;
});
