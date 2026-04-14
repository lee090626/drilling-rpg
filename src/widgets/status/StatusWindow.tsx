import React, { useCallback } from 'react';
import Image from 'next/image';
import { PlayerStats } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import { MINERALS } from '@/shared/config/mineralData';
import {
  getNextLevelExp,
  getMasteryMultiplier,
  getUnlockedSlotCount,
  createInitialMasteryState,
  createInitialEquipmentState,
} from '@/shared/lib/masteryUtils';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';
import { createPortal } from 'react-dom';
import { AtlasIconName } from '@/shared/config/atlasMap';
import { useStatusStats } from './useStatusStats';
import TileMasteryCard from './TileMasteryCard';
import StatTooltip from './StatTooltip';

interface StatusWindowProps {
  stats: PlayerStats;
  onClose: () => void;
  onUnequipRune?: (drillId: string, slotIndex: number) => void;
  onEquipArtifact?: (id: string) => void;
}

function StatusWindow({ stats, onClose, onUnequipRune, onEquipArtifact }: StatusWindowProps) {
  const [hoveredTooltip, setHoveredTooltip] = React.useState<{
    type: 'perk' | 'stat';
    id: string;
    name: string;
    desc: string;
    details?: { label: string; value: string | number; color?: string }[];
    x: number;
    y: number;
  } | null>(null);

  const {
    equipped,
    finalPower,
    finalDefense,
    finalMaxHp,
    finalCritRate,
    finalCritDmg,
    finalMiningInterval,
    finalMoveSpeedMult,
    finalLuck,
    runePowerBonus,
    statBreakdowns,
  } = useStatusStats(stats);

  const handleStatHover = (e: React.MouseEvent, id: string, name: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const details = statBreakdowns[id];
    if (details) {
      setHoveredTooltip({
        type: 'stat',
        id,
        name,
        desc: '',
        details,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleHoverPerk = useCallback(
    (e: React.MouseEvent, perkId: string, name: string, desc: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredTooltip({
        type: 'perk',
        id: perkId,
        name,
        desc,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    },
    [],
  );

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
              <AtlasIcon name="GoldIcon" size={32} />
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
                {
                  id: 'power',
                  label: 'Total Power',
                  value: finalPower,
                  color: 'text-rose-400',
                },
                {
                  id: 'defense',
                  label: 'Defense',
                  value: finalDefense,
                  color: 'text-blue-400',
                },
                { id: 'hp', label: 'Max HP', value: finalMaxHp, color: 'text-emerald-400' },
                {
                  id: 'critRate',
                  label: 'Crit Rate',
                  value: `${(finalCritRate * 100).toFixed(1)}%`,
                  color: 'text-amber-400',
                },
                {
                  id: 'critDmg',
                  label: 'Crit Damage',
                  value: `${(finalCritDmg * 100).toFixed(0)}%`,
                  color: 'text-amber-500',
                },
                {
                  id: 'miningSpeed',
                  label: 'Mining Speed',
                  value: `${finalMiningInterval}ms`,
                  color: 'text-cyan-400',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center group ${stat.id ? 'cursor-help' : ''}`}
                  onMouseEnter={(e) => stat.id && handleStatHover(e, stat.id, stat.label)}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <div className="text-[11px] font-bold text-zinc-400 tracking-tight group-hover:text-zinc-200 transition-colors">
                    {stat.label}
                  </div>
                  <div
                    className={`text-sm font-black ${stat.color} tabular-nums flex items-center gap-1.5`}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mt-6 mb-4 border-b border-zinc-800 pb-2">
              Exploration
            </h3>

            <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col gap-3">
              {[
                {
                  id: 'moveSpeed',
                  label: 'Move Speed',
                  value: `${(finalMoveSpeedMult * 100).toFixed(0)}%`,
                },
                {
                  id: 'luck',
                  label: 'Luck (Drop Bonus)',
                  value: `+${finalLuck}`,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center group ${stat.id ? 'cursor-help' : ''}`}
                  onMouseEnter={(e) => stat.id && handleStatHover(e, stat.id, stat.label)}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <div className="text-[11px] font-bold text-zinc-400 tracking-tight group-hover:text-zinc-200 transition-colors">
                    {stat.label}
                  </div>
                  <div className="text-sm font-black text-[#eab308] tabular-nums flex items-center gap-1.5">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: HP & RECORDS */}
          <div className="space-y-6 flex flex-col">
            <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
              Player Vitality
            </h3>

            <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 space-y-4">
              {/* HP BAR */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-zinc-400">Survival Gauge</span>
                  <span className="text-sm font-black text-white tabular-nums">
                    {Math.floor(stats.hp)} <span className="text-zinc-500">/ {finalMaxHp}</span>
                  </span>
                </div>
                <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-[2px] shadow-inner">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    style={{ width: `${(stats.hp / finalMaxHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* RECORDS */}
              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400">Max Depth</span>
                  <span className="text-xs font-black text-blue-400">
                    {stats.maxDepthReached || 0}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400">Current Orbit</span>
                  <span className="text-xs font-black text-purple-400">
                    Circle {stats.dimension || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* ARTIFACTS SECTION */}
            <div className="bg-[#252526] p-4 md:p-6 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col min-h-[300px] flex-1">
              <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span>Unique Artifacts</span>
                <span className="text-purple-500 font-black">{stats.unlockedResearchIds.filter(id => id.startsWith('relic_')).length}</span>
              </h4>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {stats.unlockedResearchIds.filter((id) => id.startsWith('relic_')).length > 0 ? (
                  stats.unlockedResearchIds
                    .filter((id) => id.startsWith('relic_'))
                    .map((artifactId, idx) => {
                      const info = ARTIFACT_DATA[artifactId];
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💍</span>
                            <div className="flex flex-col flex-1">
                              <span className="text-xs font-black text-white tracking-tight">
                                {info?.name || artifactId}
                              </span>
                              <span className="text-[9px] text-emerald-400 font-bold leading-tight">
                                Ancient Passive
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-10 opacity-20 text-[10px] font-bold tracking-widest">
                    Search deeper for artifacts
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: EQUIPPED HARDWARE (4-SLOT GRID) */}
          <div className="space-y-6">
            <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
              Gear Loadout
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {(['drill', 'helmet', 'armor', 'boots'] as const).map((part) => {
                const item = equipped[part];
                return (
                  <div key={part} className="bg-[#252526] p-4 rounded-2xl border border-zinc-800 flex flex-col items-center text-center shadow-xl group">
                    <div className="w-14 h-14 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 mb-2 shadow-inner group-hover:border-emerald-500/30 transition-colors overflow-hidden">
                      {item?.image ? (
                        <AtlasIcon name={item.image as AtlasIconName} size={48} />
                      ) : (
                        <span className="text-3xl">{item?.icon || '🚫'}</span>
                      )}
                    </div>
                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{part}</div>
                    <div className="text-[10px] font-black text-white truncate w-full">{item?.name || 'Barehanded'}</div>
                  </div>
                );
              })}
            </div>

            {/* DRILL RUNE SLOTS (Focused on Primary Weapon) */}
            <div className="bg-[#252526] p-6 rounded-2xl border border-zinc-800 shadow-2xl">
              <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
                Weapon Rune Slots
              </h4>
              <div className="flex flex-wrap gap-2">
               {equipped.drill ? (
                 (() => {
                   const drillState = stats.equipmentStates[equipped.drill.id] || createInitialMasteryState(equipped.drill.id, equipped.drill.maxSkillSlots);
                   return Array.from({ length: equipped.drill.maxSkillSlots || 0 }).map((_, i) => {
                     const slottedRuneId = (drillState.slottedRunes || [])[i];
                     return (
                       <button
                         key={i}
                         disabled={!slottedRuneId}
                         onClick={() => slottedRuneId && onUnequipRune?.(equipped.drill!.id, i)}
                         className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all focus:outline-none ${
                           slottedRuneId 
                             ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 hover:bg-rose-500/20 hover:border-rose-500/40 group/rune' 
                             : 'bg-zinc-950 border-zinc-800 text-zinc-700'
                         }`}
                       >
                         {slottedRuneId ? (
                           <div className="relative">
                             <span className="group-hover/rune:opacity-0 transition-opacity">⚙️</span>
                             <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/rune:opacity-100 text-rose-500 font-bold text-[10px]">✕</span>
                           </div>
                         ) : '🔒'}
                       </button>
                     );
                   });
                 })()
               ) : (
                 <div className="text-[10px] font-bold text-zinc-600 italic">Equip a drill to use runes</div>
               )}
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
              <h3 className="text-lg md:text-[22px] font-black text-white tracking-tighter">
                Tile Mastery <span className="text-emerald-500 ml-2">Progress</span>
              </h3>
            </div>
            <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-emerald-400 tracking-widest">
              DISCOVERED: {stats.discoveredMinerals.length}
            </div>
          </div>

          {stats.discoveredMinerals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stats.discoveredMinerals
                .filter((tileKey) => MINERALS.some((m) => m.key === tileKey))
                .sort((a, b) => {
                  const idxA = MINERALS.findIndex((m) => m.key === a);
                  const idxB = MINERALS.findIndex((m) => m.key === b);
                  return idxA - idxB;
                })
                .map((tileKey) => (
                  <TileMasteryCard
                    key={tileKey}
                    tileKey={tileKey}
                    mastery={
                      (stats.tileMastery && stats.tileMastery[tileKey]) ||
                      createInitialMasteryState(tileKey)
                    }
                    unlockedPerks={stats.unlockedMasteryPerks}
                    hoveredTooltipId={hoveredTooltip?.id}
                    onHoverPerk={handleHoverPerk}
                    onLeavePerk={() => setHoveredTooltip(null)}
                  />
                ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-zinc-950/50 rounded-3xl border border-dashed border-zinc-800 opacity-30">
              <span className="text-4xl mb-4">🔦</span>
              <span className="text-xs font-black tracking-widest">
                Start mining to unlock Tile Mastery!
              </span>
            </div>
          )}
        </div>
      </div>

      <StatTooltip tooltip={hoveredTooltip} />
    </div>
  );
}

export default React.memo(StatusWindow, (prev, next) => {
  return prev.stats === next.stats;
});
