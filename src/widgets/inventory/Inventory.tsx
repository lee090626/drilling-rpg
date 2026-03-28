'use client';

import React, { useState, useMemo } from 'react';
import { PlayerStats, TileType } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';
import { getNextLevelExp, getUnlockedSlotCount, createInitialEquipmentState } from '../../shared/lib/masteryUtils';

/**
 * 인벤토리 컴포넌트의 Props 인터페이스입니다.
 */
interface InventoryProps {
  /** 플레이어 통계 데이터 */
  stats: PlayerStats;
  /** 인벤토리 창 닫기 콜백 */
  onClose: () => void;
  /** 장비 장착 변경 콜백 (선택 사항) */
  onEquip?: (id: string, type: 'drill' | 'drone') => void;
  /** 스킬룬 장착 실행 콜백 (선택 사항) */
  onEquipRune?: (runeInstanceId: string, slotIndex: number) => void;
}

import { DRONES } from '../../shared/config/droneData';

import { MINERALS } from '../../shared/config/mineralData';

import { SKILL_RUNES } from '../../shared/config/skillRuneData';

/**
 * 플레이어의 소지품(재료, 장비, 스킬젬)을 관리하고 장착할 수 있는 인벤토리 컴포넌트입니다.
 */
export default function Inventory({ stats, onClose, onEquip, onEquipRune }: InventoryProps) {
  // 상태 관리: 선택된 광물 키, 선택된 룬 ID, 현재 활성화된 탭
  const [selectedKey, setSelectedKey] = useState<TileType | null>(null);
  const [selectedRuneId, setSelectedRuneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'equipment' | 'skillrunes'>(
    'ingredients',
  );

  /** 현재 선택된 룬 정보 계산 */
  const selectedRuneInstance = useMemo(
    () => stats.inventoryRunes?.find(g => g.id === selectedRuneId),
    [stats.inventoryRunes, selectedRuneId]
  );
  const selectedRuneConfig = useMemo(
    () => selectedRuneInstance ? SKILL_RUNES[selectedRuneInstance.runeId] : null,
    [selectedRuneInstance]
  );

  /** 젬 등급별 색상 및 시각 효과 정의 */
  const rarityColors: Record<string, string> = {
    Common: 'bg-zinc-900 border-zinc-700 text-zinc-400 shadow-[0_0_10px_rgba(161,161,170,0.1)]',
    Uncommon: 'bg-emerald-950/30 border-emerald-900 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
    Rare: 'bg-blue-950/30 border-blue-900 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
    Epic: 'bg-purple-950/30 border-purple-900 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.15)]',
    Radiant: 'bg-rose-950/30 border-rose-900 text-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.2)]',
    Legendary: 'bg-amber-950/30 border-amber-900/50 text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    Mythic: 'bg-red-950/30 border-red-900/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    Unique: 'bg-cyan-950/30 border-cyan-900/50 text-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.35)]',
  };

  /** 현재 선택된 광물 정보 계산 */
  const selectedMineral = useMemo(
    () => MINERALS.find((m) => m.key === selectedKey),
    [selectedKey],
  );
  /** 현재 장착된 드릴 정보 및 숙련도 데이터 계산 */
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
  const equipmentState = stats.equipmentStates[stats.equippedDrillId] || createInitialEquipmentState(stats.equippedDrillId);
  const unlockedSlots = getUnlockedSlotCount(equipmentState.level, equippedDrill.maxSkillSlots);

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4 md:gap-6">
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-[#eab308]">
          Inventory
        </h2>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none gap-1 p-1 bg-[#252526] rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 md:px-6 lg:px-8 py-1.5 md:py-2 rounded-[10px] text-[9px] md:text-[10px] font-black tracking-widest transition-all ${activeTab === 'ingredients' ? 'bg-[#eab308] text-black shadow-lg shadow-[#eab308]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 md:px-6 lg:px-8 py-1.5 md:py-2 rounded-[10px] text-[9px] md:text-[10px] font-black tracking-widest transition-all ${activeTab === 'equipment' ? 'bg-[#eab308] text-black shadow-lg shadow-[#eab308]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Equipment
            </button>
            <button
              onClick={() => setActiveTab('skillrunes')}
              className={`flex-1 md:px-6 lg:px-8 py-1.5 md:py-2 rounded-[10px] text-[9px] md:text-[10px] font-black tracking-widest transition-all ${activeTab === 'skillrunes' ? 'bg-[#eab308] text-black shadow-lg shadow-[#eab308]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Skill Runes
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-lg md:text-xl font-black">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden pr-0 lg:pr-2">
        {activeTab === 'ingredients' ? (
          <>
            <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
                {MINERALS.map((m) => {
                  const count = (stats.inventory as any)[m.key] || 0;
                  const isSelected = selectedKey === m.key;
                  const hasNone = count === 0;

                  return (
                    <button
                      key={m.key}
                      onClick={() => setSelectedKey(m.key as any)}
                      className={`relative aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-2 md:p-4 group overflow-hidden ${
                        isSelected
                          ? 'bg-[#252526] shadow-2xl scale-[1.02]'
                          : hasNone
                            ? 'bg-[#1a1a1b] border-zinc-900 opacity-20 grayscale'
                            : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                      }`}
                      style={{ borderColor: isSelected ? m.color : undefined }}
                    >
                      {isSelected && (
                         <div className="absolute inset-0 opacity-10" style={{ backgroundColor: m.color }} />
                      )}
                      <div className="w-8 h-8 md:w-10 md:h-10 mb-1.5 md:mb-3 group-hover:scale-110 transition-transform flex items-center justify-center text-2xl md:text-4xl">
                        {m.image ? (
                          <img src={typeof m.image === 'string' ? m.image : m.image.src || m.image} alt={m.name} className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                          m.icon
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`text-[11px] font-black tabular-nums ${isSelected ? 'text-white' : 'text-zinc-400'}`}
                        >
                          x{count.toLocaleString()}
                        </div>
                        <div className="text-[8px] text-zinc-600 font-bold tracking-widest">
                          {m.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-4 md:p-6 lg:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
              {selectedMineral ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-start mb-6">
                    <span className="text-[9px] font-black px-3 py-1.5 rounded-lg border tracking-widest" style={{ 
                      backgroundColor: `${selectedMineral.color}20`,
                      borderColor: selectedMineral.color,
                      color: selectedMineral.color
                    }}>
                      {selectedMineral.rarity}
                    </span>
                  </div>

                  <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-950 rounded-2xl md:rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-5xl md:text-7xl mx-auto mb-4 md:mb-8 overflow-hidden">
                    {selectedMineral.image ? (
                      <img src={typeof selectedMineral.image === 'string' ? selectedMineral.image : selectedMineral.image.src || selectedMineral.image} alt={selectedMineral.name} className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-xl" />
                    ) : (
                      selectedMineral.icon
                    )}
                  </div>

                  <h3 className="text-xl md:text-3xl font-black text-white text-center mb-2 md:mb-4 tracking-tighter">
                    {selectedMineral.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-zinc-500 text-center leading-relaxed mb-4 md:mb-8 px-4">
                    {selectedMineral.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                      <div className="text-[9px] text-zinc-600 font-black mb-1 tracking-widest text-center">
                        Quantity
                      </div>
                      <div className="text-4xl font-black text-[#eab308] text-center tabular-nums">
                        {(stats.inventory as any)[selectedMineral.key] || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <div className="text-5xl mb-6">📦</div>
                  <p className="text-xs font-bold text-zinc-500 tracking-widest">
                    Select an item
                  </p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'equipment' ? (
          <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-0 md:pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 pb-20">
              {stats.ownedDrillIds?.map((drillId) => {
                const drill = DRILLS[drillId];
                if (!drill) return null;
                const isEquipped = stats.equippedDrillId === drillId;

                return (
                  <div
                    key={drillId}
                    className={`p-4 md:p-8 rounded-2xl md:rounded-4xl border-2 transition-all flex flex-col group relative overflow-hidden ${
                      isEquipped
                        ? 'bg-[#252526] border-[#eab308] shadow-2xl'
                        : 'bg-[#252526] border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-6 mb-8 text-left">
                      <div className="w-20 h-20 bg-zinc-950 rounded-2xl flex items-center justify-center text-5xl border border-zinc-900 shadow-inner overflow-hidden">
                        {drill.image ? (
                          <img
                            src={typeof drill.image === 'string' ? drill.image : drill.image.src || drill.image}
                            alt={drill.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          drill.icon
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-[9px] font-bold mb-1 tracking-widest ${isEquipped ? 'text-[#eab308]' : 'text-zinc-600'}`}
                        >
                          {isEquipped ? 'Equipped' : 'Storage'} • {drill.equipmentType}
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tighter">
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
                              className="bg-zinc-950 p-3 rounded-xl text-center border border-zinc-900 shadow-inner"
                            >
                              <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest">
                                {l}
                              </div>
                              <div className="text-xs font-black text-white">
                                {v}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* MASTERY & EXP IN INVENTORY */}
                        <div className="space-y-4 mb-6">
                          {(() => {
                            const equipmentState = stats.equipmentStates[drillId] || createInitialEquipmentState(drillId);
                            const nextExp = getNextLevelExp(equipmentState.level);
                            const expPercent = Math.min(100, (equipmentState.exp / nextExp) * 100);
                            const unlockedSlots = getUnlockedSlotCount(equipmentState.level, drill.maxSkillSlots);

                            return (
                              <>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-end">
                                    <span className="text-[8px] text-zinc-500 font-bold tracking-widest">Mastery Lv.{equipmentState.level}</span>
                                    <span className="text-[8px] text-zinc-600 font-bold tabular-nums">{Math.floor(expPercent)}%</span>
                                  </div>
                                  <div className="h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                                    <div 
                                      className="h-full bg-[#eab308] rounded-full transition-all duration-500"
                                      style={{ width: `${expPercent}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-between items-center bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900/50">
                                  <span className="text-[8px] text-zinc-500 font-bold tracking-widest">Rune Slots</span>
                                  <div className="flex gap-1">
                                    {Array.from({ length: drill.maxSkillSlots || 0 }).map((_, i) => {
                                      const isUnlocked = i < unlockedSlots;
                                      const hasRune = (equipmentState.slottedRunes || [])[i];
                                      return (
                                        <div 
                                          key={i} 
                                          className={`w-5 h-5 rounded-lg border flex items-center justify-center text-[10px] ${
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
                                      <span className="text-[8px] text-zinc-700 italic">NONE</span>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                    <div className="mt-auto">
                      {!isEquipped && (
                        <button
                          onClick={() => onEquip?.(drillId, 'drill')}
                          className="w-full py-4 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-[10px] tracking-widest rounded-xl shadow-xl active:scale-95 transition-all"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 드론 목록 추가 */}
              {stats.ownedDroneIds?.map((droneId) => {
                const drone = DRONES[droneId];
                if (!drone) return null;
                const isEquipped = stats.equippedDroneId === droneId;

                return (
                  <div
                    key={droneId}
                    className={`p-4 md:p-8 rounded-2xl md:rounded-4xl border-2 transition-all flex flex-col group relative overflow-hidden ${
                      isEquipped
                        ? 'bg-[#252526] border-[#eab308] shadow-2xl'
                        : 'bg-[#252526] border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-6 mb-8 text-left">
                      <div className="w-20 h-20 bg-zinc-950 rounded-2xl flex items-center justify-center text-5xl border border-zinc-900 shadow-inner overflow-hidden">
                        {drone.icon}
                      </div>
                      <div>
                        <div
                          className={`text-[9px] font-bold mb-1 tracking-widest ${isEquipped ? 'text-[#eab308]' : 'text-zinc-600'}`}
                        >
                          {isEquipped ? 'Equipped' : 'Storage'} • DRONE
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tighter">
                          {drone.name}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      <div className="bg-zinc-950 p-3 rounded-xl text-center border border-zinc-900 shadow-inner">
                        <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest">MINERIAL ASSIST</div>
                        <div className="text-xs font-black text-white">{drone.basePower}</div>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl text-center border border-zinc-900 shadow-inner">
                        <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest">SPEED</div>
                        <div className="text-xs font-black text-white">{drone.cooldownMs}ms</div>
                      </div>
                      {drone.specialEffect && (
                         <div className="bg-zinc-950 p-3 rounded-xl text-center border border-zinc-900 shadow-inner">
                           <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest">EFFECT</div>
                           <div className="text-xs font-black text-emerald-400 capitalize">{drone.specialEffect}</div>
                         </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      {!isEquipped && (
                        <button
                          onClick={() => onEquip?.(droneId, 'drone')}
                          className="w-full py-4 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-[10px] tracking-widest rounded-xl shadow-xl active:scale-95 transition-all"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
                {stats.inventoryRunes && stats.inventoryRunes.length > 0 ? (
                  stats.inventoryRunes.map((rune) => (
                    <button
                      key={rune.id}
                      onClick={() => setSelectedRuneId(rune.id === selectedRuneId ? null : rune.id)}
                      className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden ${rarityColors[rune.rarity] || 'bg-zinc-900 border-zinc-700 text-zinc-500'} hover:-translate-y-1 ${selectedRuneId === rune.id ? 'ring-2 ring-[#eab308] scale-[1.02]' : ''}`}
                    >
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        ⚙️
                      </div>
                      <div className="flex flex-col items-center gap-1 w-full text-center">
                        <div className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-black/40 border border-white/5">
                          {rune.rarity}
                        </div>
                        <div className="text-[10px] font-black text-white mt-1 truncate w-full px-1">
                          {SKILL_RUNES[rune.runeId]?.name || 'Unknown'}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center text-center opacity-20">
                    <div className="text-5xl mb-6">🪨</div>
                    <p className="text-xs font-bold text-zinc-500 tracking-widest">No Runes Owned</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-4 md:p-6 lg:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
              {selectedRuneConfig && selectedRuneInstance ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-start mb-6">
                    <span className="text-[9px] font-black px-3 py-1.5 rounded-lg border tracking-widest bg-zinc-950 border-zinc-800 text-zinc-400">
                      {selectedRuneInstance.rarity} MODULE
                    </span>
                  </div>

                  <div className="w-32 h-32 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-7xl mx-auto mb-8">
                    ⚙️
                  </div>

                  <h3 className="text-2xl font-black text-white text-center mb-4 tracking-tighter">
                    {selectedRuneConfig.name}
                  </h3>
                  <p className="text-sm text-zinc-400 text-center leading-relaxed mb-8 px-4 font-medium">
                    {selectedRuneConfig.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                       <div className="text-[10px] text-zinc-600 font-black mb-3 tracking-widest text-center uppercase">Module Status</div>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center text-[10px] font-bold">
                           <span className="text-zinc-500">TYPE</span>
                           <span className="text-blue-400 uppercase">{selectedRuneConfig.effectType}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-bold">
                           <span className="text-zinc-500">RARITY</span>
                           <span className="text-amber-400 uppercase">{selectedRuneInstance.rarity}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <div className="text-5xl mb-6">⚙️</div>
                  <p className="text-xs font-bold text-zinc-500 tracking-widest">
                    Select a Module
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* SLOT SELECTION OVERLAY */}
      {selectedRuneId && selectedRuneConfig && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-300">
          <div className="bg-[#1a1a1b] border-2 border-[#eab308] rounded-2xl md:rounded-4xl p-6 md:p-10 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter text-center">Module Integration</h3>
            <p className="text-zinc-500 text-xs text-center mb-8 font-medium italic">Select target socket for {selectedRuneConfig.name}</p>
            
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
                      setSelectedRuneId(null);
                    }}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center transition-all group ${
                      isUnlocked
                        ? 'bg-zinc-900 border-zinc-700 hover:border-[#eab308] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:-translate-y-1'
                        : 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      currentRuneItem ? (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl mb-1 flex items-center justify-center">⚙️</span>
                          <span className="text-[8px] font-bold text-zinc-400">Lv.{currentRuneItem.rarity.charAt(0)}</span>
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity">
                            <span className="text-[10px] font-black text-[#eab308] tracking-widest">REPLACE</span>
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
              onClick={() => setSelectedRuneId(null)}
              className="w-full py-4 bg-zinc-800 text-white rounded-xl font-bold tracking-widest hover:bg-zinc-700 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
