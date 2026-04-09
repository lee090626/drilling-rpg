'use client';

import React, { useState, useMemo } from 'react';
import { PlayerStats, TileType } from '@/shared/types/game';
import { DRILLS } from '@/shared/config/drillData';
import { getNextLevelExp, getUnlockedSlotCount, createInitialMasteryState } from '@/shared/lib/masteryUtils';
import { DRONES } from '@/shared/config/droneData';
import { MINERALS } from '@/shared/config/mineralData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

/**
 * 인벤토리 컴포넌트의 Props 인터페이스입니다.
 */
interface InventoryProps {
  stats: PlayerStats;
  onClose: () => void;
  onEquip?: (id: string, type: 'drill' | 'drone') => void;
  onEquipRune?: (runeInstanceId: string, slotIndex: number) => void;
}

/**
 * 플레이어의 소지품(재료, 장비, 스킬젬)을 관리하고 장착할 수 있는 인벤토리 컴포넌트입니다.
 */
function Inventory({ stats, onClose, onEquip, onEquipRune }: InventoryProps) {
  // 상태 관리: 선택된 광물 키, 선택된 룬 ID, 현재 활성화된 탭
  const [selectedKey, setSelectedKey] = useState<TileType | null>(null);
  const [selectedRuneId, setSelectedRuneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'equipment' | 'skillrunes'>(
    'ingredients',
  );
  const [isEquippingRune, setIsEquippingRune] = useState(false);

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
  const equipmentState = stats.equipmentStates[stats.equippedDrillId] || createInitialMasteryState(stats.equippedDrillId, equippedDrill.maxSkillSlots);
  const unlockedSlots = equippedDrill.maxSkillSlots || 0; // Decoupled from mastery level

  /** 모든 드릴에 현재 장착 중인 룬 인스턴스 ID 목록 */
  const equippedRuneIds = new Set<string>();
  Object.values(stats.equipmentStates).forEach((eqState: any) => {
    if (eqState?.slottedRunes) {
      eqState.slottedRunes.forEach((id: string | null) => {
        if (id) equippedRuneIds.add(id);
      });
    }
  });

  /** 장착되지 않은 룬만 필터 (인벤토리 표시용) */
  const availableRunes = (stats.inventoryRunes || []).filter(r => !equippedRuneIds.has(r.id));

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">📦</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-cyan-400 leading-none">
                Inventory
              </h2>
            </div>
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${activeTab === 'ingredients' ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${activeTab === 'equipment' ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Equiment
            </button>
            <button
              onClick={() => setActiveTab('skillrunes')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${activeTab === 'skillrunes' ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Runes
            </button>
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
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
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
                      className={`relative aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-2 md:p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
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
                      <div className="w-14 h-14 md:w-18 md:h-18 mb-2 md:mb-4 group-hover:scale-105 transition-transform flex items-center justify-center">
                        {m.image ? (
                          <AtlasIcon name={m.image} size={64} />
                        ) : (
                          <span className="text-3xl md:text-5xl">{m.icon}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`text-sm md:text-base font-black tabular-nums ${isSelected ? 'text-white' : 'text-zinc-400'}`}
                        >
                          x{count.toLocaleString()}
                        </div>
                        <div className="text-[10px] md:text-xs text-zinc-600 font-bold tracking-widest">
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
                  <div className="flex justify-start mb-8">
                    <span className="text-xs font-black px-4 py-2 rounded-lg border tracking-widest uppercase" style={{ 
                      backgroundColor: `${selectedMineral.color}20`,
                      borderColor: selectedMineral.color,
                      color: selectedMineral.color
                    }}>
                      Mineral
                    </span>
                  </div>

                  <div className="w-40 h-40 md:w-56 md:h-56 bg-zinc-950 rounded-3xl md:rounded-4xl shadow-inner border border-zinc-800 flex items-center justify-center mx-auto mb-6 md:mb-10 overflow-hidden">
                    {selectedMineral.image ? (
                      <AtlasIcon name={selectedMineral.image} size={160} />
                    ) : (
                      <span className="text-7xl md:text-9xl">{selectedMineral.icon}</span>
                    )}
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black text-white text-center mb-4 md:mb-6 tracking-tighter">
                    {selectedMineral.name}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-400 text-center leading-relaxed mb-6 md:mb-12 px-4 italic">
                    {selectedMineral.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-900">
                      <div className="text-xs text-zinc-500 font-black mb-4 tracking-widest text-center uppercase">
                        Stock Quantity
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-6xl md:text-8xl font-black text-[#eab308] text-center tabular-nums">
                          {(stats.inventory as any)[selectedMineral.key] || 0}
                        </div>
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
                          {(() => {
                            const equipmentState = stats.equipmentStates[drillId] || createInitialMasteryState(drillId, drill.maxSkillSlots);
                            const nextExp = getNextLevelExp(equipmentState.level);
                            const expPercent = Math.min(100, (equipmentState.exp / nextExp) * 100);
                            const unlockedSlots = drill.maxSkillSlots || 0; // Decoupled

                            return (
                              <>
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
                              </>
                            );
                          })()}
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
                          className={`text-xs font-bold mb-2 tracking-widest ${isEquipped ? 'text-[#eab308]' : 'text-zinc-600'}`}
                        >
                          {isEquipped ? 'Equipped' : 'Storage'} • DRONE
                        </div>
                        <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                          {drone.name}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      <div className="bg-zinc-950 p-4 rounded-xl text-center border border-zinc-900 shadow-inner">
                        <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest uppercase">Mineral Assist</div>
                        <div className="text-sm md:text-xl font-black text-white">{drone.basePower}</div>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-xl text-center border border-zinc-900 shadow-inner">
                        <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest uppercase">SPEED</div>
                        <div className="text-sm md:text-xl font-black text-white">{drone.cooldownMs}ms</div>
                      </div>
                      {drone.specialEffect && (
                         <div className="bg-zinc-950 p-4 rounded-xl text-center border border-zinc-900 shadow-inner">
                           <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest uppercase">EFFECT</div>
                           <div className="text-sm md:text-xl font-black text-emerald-400 capitalize">{drone.specialEffect}</div>
                         </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      {!isEquipped && (
                          <button
                            onClick={() => onEquip?.(droneId, 'drone')}
                            className="w-full py-6 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-lg tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
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
                {availableRunes.length > 0 ? (
                  availableRunes.map((rune) => (
                    <button
                      key={rune.id}
                      onClick={() => {
                        setSelectedRuneId(rune.id === selectedRuneId ? null : rune.id);
                        setIsEquippingRune(false);
                      }}
                      className={`relative aspect-square rounded-2xl transition-all flex flex-col items-center justify-center p-0 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${selectedRuneId === rune.id ? 'ring-2 ring-[#eab308] scale-[1.02] z-10' : ''}`}
                    >
                      <SkillRuneIcon runeId={rune.runeId} rarity={rune.rarity as any} size={80} />
                      <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 pointer-events-none">
                        <div className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-white/50">
                          {rune.rarity}
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
                  <div className="flex justify-start mb-8">
                  </div>

                  <div className="w-44 h-44 md:w-64 md:h-64 bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 flex items-center justify-center mx-auto mb-10 overflow-hidden relative group">
                    <SkillRuneIcon 
                      runeId={selectedRuneInstance.runeId} 
                      rarity={selectedRuneInstance.rarity as any} 
                      size={200} 
                    />
                  </div>

                  <h3 className="text-4xl md:text-5xl font-black text-white text-center mb-6 tracking-tighter">
                    {selectedRuneConfig.name}
                  </h3>

                  <div className="mt-auto space-y-4">
                    <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
                       <div className="space-y-4">
                         <div className="flex justify-between items-center text-xs md:text-sm font-bold">
                           <span className="text-zinc-500">Type</span>
                           <span className="text-blue-400 tracking-widest">{selectedRuneConfig.effectType}</span>
                         </div>
                       </div>
                    </div>

                    <button
                      onClick={() => setIsEquippingRune(true)}
                      className="w-full py-6 bg-cyan-400 text-black hover:bg-cyan-300 text-center font-black text-sm md:text-base tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                    >
                      Equip Rune
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <AtlasIcon name="attack_rune" size={96} />
                  <p className="text-xs font-bold text-zinc-500 tracking-widest mt-6">
                    Select a Rune
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* SLOT SELECTION OVERLAY */}
      {isEquippingRune && selectedRuneId && selectedRuneConfig && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-300">
          <div className="bg-[#1a1a1b] border-2 border-[#eab308] rounded-2xl md:rounded-4xl p-6 md:p-10 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter text-center">Equip Rune</h3>
            <p className="text-zinc-500 text-xs text-center mb-8 font-medium">Select target socket for {selectedRuneConfig.name}</p>
            
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
                      setIsEquippingRune(false);
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
              onClick={() => setIsEquippingRune(false)}
              className="w-full py-4 bg-zinc-800 text-white rounded-xl font-bold tracking-widest hover:bg-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Inventory, (prev, next) => {
  return prev.stats === next.stats;
});
