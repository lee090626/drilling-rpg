'use client';

import React from 'react';
import { PlayerStats } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';
import { getNextLevelExp, getMasteryMultiplier, getUnlockedSlotCount, createInitialEquipmentState } from '../../shared/lib/masteryUtils';
import { getTotalRuneStat } from '../../shared/lib/runeUtils';

interface StatusWindowProps {
  stats: PlayerStats;
  onClose: () => void;
  onUnequipRune?: (drillId: string, slotIndex: number) => void;
}

export default function StatusWindow({ stats, onClose, onUnequipRune }: StatusWindowProps) {
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
  
  const equipmentState = stats.equipmentStates[stats.equippedDrillId] || createInitialEquipmentState(stats.equippedDrillId);
  const masteryMult = getMasteryMultiplier(equipmentState.level);
  const nextExp = getNextLevelExp(equipmentState.level);
  const expPercent = Math.min(100, (equipmentState.exp / nextExp) * 100);
  
  const baseAttack = equippedDrill.basePower;
  const masteryBonus = Math.round(baseAttack * (masteryMult - 1));
  
  // Rune Bonuses
  const runePowerBonus = Math.floor(getTotalRuneStat(stats, 'attack'));

  const totalPower = stats.attackPower + baseAttack + masteryBonus + runePowerBonus;

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-[#eab308]">
          Status
        </h2>
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6">
          <div className="flex items-center gap-2 md:gap-4 bg-[#252526] px-4 py-1.5 md:px-6 md:py-2 rounded-xl border border-zinc-800">
            <span className="text-base md:text-xl font-black text-white tabular-nums">
              {stats.goldCoins.toLocaleString()}
              <span className="text-[#eab308] text-sm md:text-xl ml-1 md:ml-2">G</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-lg md:text-xl font-black">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-y-auto pr-2 custom-scrollbar pb-6">
        {/* COLUMN 1: BASE METRICS */}
        <div className="space-y-4">
          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2 uppercase">
            Attributes
          </h3>

          {[
            { label: 'Attack', value: totalPower },
            { label: 'Max HP', value: stats.maxHp },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-[#eab308]/50 transition-colors"
            >
              <div className="text-[10px] md:text-[11px] font-bold text-white tracking-tight uppercase">
                {stat.label}
              </div>
              <div className="text-xl md:text-2xl font-black text-[#eab308] tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* COLUMN 2: PLAYER DETAILS */}
        <div className="space-y-6">
          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2 uppercase">
            Player Status
          </h3>

          <div className="bg-[#252526] p-4 md:p-6 rounded-xl md:rounded-2xl border border-zinc-800 space-y-6 md:space-y-8">
            {/* HP BAR */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-zinc-400">
                  Health
                </span>
                <span className="text-sm font-black text-white tabular-nums">
                  {Math.floor(stats.hp)}{' '}
                  <span className="text-zinc-500">/ {stats.maxHp}</span>
                </span>
              </div>
              <div className="h-4 md:h-5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[2px]">
                <div
                  className="h-full bg-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#252526] p-4 md:p-6 rounded-xl md:rounded-2xl border border-zinc-800">
            <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
              Artifacts
            </h4>
            <div className="space-y-2 max-h-[150px] md:max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
              {stats.artifacts.length > 0 ? (
                stats.artifacts.map((art, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-zinc-300 tracking-tight">
                      {art}
                    </span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-20 text-[10px] font-bold tracking-widest">
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: EQUIPPED HARDWARE */}
        <div className="space-y-6">
          <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2 uppercase">
            Equipped Gear
          </h3>

          <div className="bg-[#252526] p-4 md:p-8 rounded-2xl md:rounded-4xl border border-zinc-800 shadow-2xl flex flex-col items-center text-center relative group overflow-hidden">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-2xl md:rounded-3xl flex items-center justify-center text-4xl md:text-6xl mb-4 md:mb-6 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-500 overflow-hidden">
              {equippedDrill.image ? (
                <img
                  src={typeof equippedDrill.image === 'string' ? equippedDrill.image : (equippedDrill.image as any).src || equippedDrill.image}
                  alt={equippedDrill.name}
                  className="w-full h-full object-contain p-2 md:p-4"
                />
              ) : (
                equippedDrill.icon
              )}
            </div>

            <h4 className="text-xl md:text-2xl font-black text-white tracking-tighter mb-2 md:mb-4">
              {equippedDrill.name}
            </h4>

            <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-zinc-800 pt-6">
              <div className="text-center">
                <div className="text-[9px] text-zinc-500 font-bold mb-1">
                  Attack
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

            {/* MASTERY & EXP SECTION */}
            <div className="w-full mt-4 md:mt-6 space-y-4 border-t border-zinc-800/50 pt-4 md:pt-6">
              <div className="text-left space-y-1.5 md:space-y-2">
                <div className="flex justify-between items-end">
                  <div className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
                    Mastery Level
                  </div>
                  <div className="text-xs md:text-sm font-black text-[#eab308]">
                    Lv.{equipmentState.level}
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-[#eab308] rounded-full transition-all duration-1000"
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
                <div className="text-[8px] text-zinc-600 font-bold text-right">
                  {equipmentState.exp} / {nextExp} EXP
                </div>
              </div>

              <div className="text-left">
                <div className="text-[9px] text-zinc-500 font-bold mb-2 tracking-widest flex justify-between items-center uppercase">
                  <span>Skill Rune Slots</span>
                  <span className="text-zinc-600 font-black">{getUnlockedSlotCount(equipmentState.level, equippedDrill.maxSkillSlots)} / {equippedDrill.maxSkillSlots || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: equippedDrill.maxSkillSlots || 0 }).map((_, i) => {
                    const isUnlocked = i < getUnlockedSlotCount(equipmentState.level, equippedDrill.maxSkillSlots);
                    const slottedRuneId = (equipmentState.slottedRunes || [])[i];
                    
                    return (
                      <button 
                        key={i} 
                        disabled={!isUnlocked || !slottedRuneId}
                        onClick={() => isUnlocked && slottedRuneId && onUnequipRune?.(stats.equippedDrillId, i)}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl border flex items-center justify-center transition-all ${
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
                            <div className="relative">
                              <span className="text-sm md:text-base">⚙️</span>
                              <span className="absolute -top-1 -right-1 text-[8px] bg-zinc-950 rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover/rune:opacity-100 transition-opacity">✕</span>
                            </div>
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
    </div>
  );
}
