'use client';

import React, { useState, useMemo } from 'react';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERALS } from '@/shared/config/mineralData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import EquipmentCard from './EquipmentCard';
import { ARTIFACT_DATA, ARTIFACT_LIST } from '@/shared/config/artifactData';
import RuneEquipOverlay from './RuneEquipOverlay';
import { atlasMap } from '@/shared/config/atlasMap';

/**
 * 인벤토리 컴포넌트의 Props 인터페이스입니다.
 */
interface InventoryProps {
  stats: PlayerStats;
  onClose: () => void;
  onEquip?: (id: string, part: EquipmentPart) => void;
  onEquipRune?: (runeInstanceId: string, slotIndex: number) => void;
}

type InventoryTab = 'ingredients' | 'equipment' | 'skillrunes' | 'effects';

/**
 * 플레이어의 소지품(재료, 장비, 스킬젬)을 관리하고 장착할 수 있는 인벤토리 컴포넌트입니다.
 */
function Inventory({ stats, onClose, onEquip, onEquipRune }: InventoryProps) {
  // 상태 관리: 선택된 광물 키, 선택된 룬 ID, 현재 활성화된 탭
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedRuneId, setSelectedRuneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InventoryTab>('ingredients');
  const [isEquippingRune, setIsEquippingRune] = useState(false);
  const [selectedPart, setSelectedPart] = useState<EquipmentPart>('Drill');

  /** 현재 선택된 아이템 정보 계산 (아이템 탭/효과 탭 혼용) */
  const selectedMineral = useMemo(
    () => (selectedKey ? MINERALS.find((m) => m.key === selectedKey) : null),
    [selectedKey],
  );

  const selectedArtifact = useMemo(
    () => (selectedKey ? ARTIFACT_DATA[selectedKey] : null),
    [selectedKey],
  );

  const selectedRuneInstance = useMemo(
    () => stats.inventoryRunes?.find((g) => g.id === selectedRuneId),
    [stats.inventoryRunes, selectedRuneId],
  );
  const selectedRuneConfig = useMemo(
    () => (selectedRuneInstance ? SKILL_RUNES[selectedRuneInstance.runeId] : null),
    [selectedRuneInstance],
  );

  /** 젬 등급별 색상 및 시각 효과 정의 (유물 등에도 재활용) */
  const rarityColors: Record<string, string> = {
    Common: 'bg-zinc-900 border-zinc-700 text-zinc-400 shadow-[0_0_10px_rgba(161,161,170,0.1)]',
    Uncommon:
      'bg-emerald-950/30 border-emerald-900 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
    Rare: 'bg-blue-950/30 border-blue-900 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
    Epic: 'bg-purple-950/30 border-purple-900 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.15)]',
    Radiant: 'bg-rose-950/30 border-rose-900 text-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.2)]',
    Legendary:
      'bg-amber-950/30 border-amber-900/50 text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    Mythic: 'bg-red-950/30 border-red-900/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]',
    Unique:
      'bg-cyan-950/30 border-cyan-900/50 text-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.35)]',
  };

  /** 현재 선택된 부위의 보유 장비 목록 필터링 */
  const visibleEquipments = useMemo(() => {
    return (stats.ownedEquipmentIds || [])
      .filter((id) => {
        const eq = EQUIPMENTS[id];
        return eq && eq.part === selectedPart;
      })
      .sort((a, b) => (EQUIPMENTS[a]?.circle || 0) - (EQUIPMENTS[b]?.circle || 0));
  }, [stats.ownedEquipmentIds, selectedPart]);

  /** 특정 장비가 장착 중인지 확인하는 함수 */
  const isCurrentlyEquipped = (id: string, part: EquipmentPart) => {
    const { equipment } = stats;
    switch (part) {
      case 'Drill': return equipment.drillId === id;
      case 'Helmet': return equipment.helmetId === id;
      case 'Armor': return equipment.armorId === id;
      case 'Boots': return equipment.bootsId === id;
      default: return false;
    }
  };

  /** 모든 장비에 현재 장착 중인 룬 인스턴스 ID 목록 (드릴 전용) */
  const equippedRuneIds = new Set<string>();
  Object.values(stats.equipmentStates).forEach((eqState: any) => {
    if (eqState?.slottedRunes) {
      eqState.slottedRunes.forEach((id: string | null) => {
        if (id) equippedRuneIds.add(id);
      });
    }
  });

  /** 장착되지 않은 룬만 필터 (인벤토리 표시용) */
  const availableRunes = (stats.inventoryRunes || []).filter((r) => !equippedRuneIds.has(r.id));

  /** 효과 아이템 (정수 & 성유물) 필터링 (보유한 것만 표시) */
  const ownedArtifacts = useMemo(() => {
    return ARTIFACT_LIST.filter((item) => (stats.collectionHistory?.[item.id] || 0) > 0);
  }, [stats.collectionHistory]);

  /** 보유한 광물만 필터링 (미획득 광물 비공개 요청 반영) */
  const ownedMinerals = useMemo(() => {
    return MINERALS.filter((m) => ((stats.inventory as any)[m.key] || 0) > 0);
  }, [stats.inventory]);

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

          <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto scrollbar-none overflow-x-auto">
            <button
              onClick={() => { setActiveTab('ingredients'); setSelectedKey(null); }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${activeTab === 'ingredients' ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Items
            </button>
            <button
              onClick={() => { setActiveTab('effects'); setSelectedKey(null); }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${activeTab === 'effects' ? 'bg-zinc-800 text-orange-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Effects
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${activeTab === 'equipment' ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Equipment
            </button>
            <button
              onClick={() => setActiveTab('skillrunes')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${activeTab === 'skillrunes' ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Runes
            </button>
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
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden pr-0 lg:pr-2">
        {activeTab === 'ingredients' ? (
          <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 md:gap-4 pb-10">
              {ownedMinerals.map((m) => {
                const count = (stats.inventory as any)[m.key] || 0;
                const isSelected = selectedKey === m.key;

                return (
                  <div
                    key={m.key}
                    className={`relative aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-2 md:p-4 group overflow-hidden bg-[#252526] border-zinc-800 hover:border-zinc-700`}
                  >
                    <div className="w-14 h-14 md:w-18 md:h-18 mb-2 md:mb-4 group-hover:scale-105 transition-transform flex items-center justify-center">
                      {m.image ? (
                        <AtlasIcon name={m.image} size={64} />
                      ) : (
                        <span className="text-3xl md:text-5xl">{m.icon}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-[10px] md:text-sm font-bold tabular-nums text-zinc-400">
                        x{count.toLocaleString()}
                      </div>
                      <div className="text-[10px] md:text-xs text-zinc-600 font-bold tracking-widest text-center truncate w-full px-1">
                        {m.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'effects' ? (
          <>
            <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
                {ownedArtifacts.length > 0 ? (
                  ownedArtifacts.map((item) => {
                    const count = stats.collectionHistory?.[item.id] || 0;
                    const isSelected = selectedKey === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedKey(item.id)}
                        className={`relative aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-2 md:p-4 group overflow-hidden focus:outline-none ${
                          isSelected
                            ? 'bg-[#252526] border-orange-400 shadow-2xl scale-[1.02]'
                            : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-14 h-14 md:w-18 md:h-18 mb-2 md:mb-4 flex items-center justify-center">
                          <AtlasIcon name={item.image as any} size={64} />
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`text-[10px] md:text-sm font-bold tabular-nums ${isSelected ? 'text-white' : 'text-orange-400'}`}>
                            x{count.toLocaleString()}
                          </div>
                          <div className="text-[10px] md:text-xs text-zinc-600 font-bold tracking-widest text-center truncate w-full px-1">
                            {item.name}
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center text-center opacity-20">
                    <div className="text-5xl mb-6">📦</div>
                    <p className="text-xs font-bold text-zinc-500 tracking-widest">
                      No Items Found
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-4 md:p-6 lg:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
              {selectedArtifact ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* 이미지 영역 */}
                  <div className="w-40 h-40 md:w-56 md:h-56 bg-zinc-950 rounded-3xl md:rounded-4xl shadow-inner border border-zinc-800 flex items-center justify-center mx-auto mb-8 md:mb-12 overflow-hidden relative">
                    <AtlasIcon name={(selectedArtifact.image && (selectedArtifact.image in atlasMap)) ? selectedArtifact.image as any : 'GoldIcon'} size={160} />
                    <div className="absolute inset-0 shadow-[inset_0_0_60px_#f9731633] rounded-3xl md:rounded-4xl pointer-events-none" />
                  </div>

                  {/* 이름 */}
                  <h3 className="text-2xl md:text-4xl font-black text-white text-center mb-8 tracking-tighter">
                    {selectedArtifact.name}
                  </h3>
                  
                  {/* 핵심 효과 설명 */}
                  <div className="mt-4 bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
                    
                    {/* 동적 능력치 보너스 표시 */}
                    {selectedArtifact.bonus && (
                      <div className="text-[10px] text-orange-500 font-black tracking-[0.2em] mb-2">
                        {(() => {
                          const statMap: Record<string, string> = {
                            power: 'Attack Power',
                            maxHp: 'Max HP',
                            moveSpeed: 'Move Speed',
                            luck: 'Luck',
                            critRate: 'Crit Rate',
                            critDamage: 'Crit Damage',
                            defense: 'Defense',
                            miningSpeed: 'Mining Speed'
                          };
                          const stacks = stats.collectionHistory?.[selectedArtifact.id] || 0;
                          const totalValue = selectedArtifact.bonus.value * stacks;
                          const isPercent = Math.abs(selectedArtifact.bonus.value) < 1 && !['maxHp', 'defense'].includes(selectedArtifact.bonus.stat);
                          const formattedValue = isPercent ? `${(totalValue * 100).toFixed(1)}%` : totalValue.toLocaleString();
                          
                          return `${statMap[selectedArtifact.bonus.stat] || selectedArtifact.bonus.stat} +${formattedValue}`;
                        })()}
                      </div>
                    )}

                    <div className="text-lg md:text-xl text-white font-black leading-tight">
                      {selectedArtifact.effectDescription}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <div className="text-5xl mb-6">📦</div>
                  <p className="text-xs font-bold text-zinc-500 tracking-widest">Select an Item</p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'equipment' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Part selection tabs */}
            <div className="flex gap-2 mb-6 px-1 flex-wrap">
              {(['Drill', 'Helmet', 'Armor', 'Boots'] as EquipmentPart[]).map((part) => (
                <button
                  key={part}
                  onClick={() => setSelectedPart(part)}
                  className={`px-4 py-2 rounded-xl text-[10px] md:text-sm font-black tracking-widest border transition-all ${
                    selectedPart === part
                      ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg scale-105'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-0 md:pr-4">
              {visibleEquipments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 pb-20">
                  {visibleEquipments.map((id) => (
                    <EquipmentCard
                      key={id}
                      equipmentId={id}
                      isEquipped={isCurrentlyEquipped(id, selectedPart)}
                      onEquip={onEquip}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-20">
                  <div className="text-5xl mb-6">🛡️</div>
                  <p className="text-sm font-bold text-zinc-500 tracking-widest">
                    No {selectedPart} Owned
                  </p>
                </div>
              )}
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
                      className={`relative aspect-square rounded-2xl transition-all flex flex-col items-center justify-center p-0 overflow-hidden group focus:outline-none ${selectedRuneId === rune.id ? 'ring-2 ring-[#eab308] scale-[1.02] z-10' : ''}`}
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
                    <p className="text-xs font-bold text-zinc-500 tracking-widest">
                      No Runes Owned
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-4 md:p-6 lg:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
              {selectedRuneConfig && selectedRuneInstance ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="w-44 h-44 md:w-64 md:h-64 bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 flex items-center justify-center mx-auto mb-10 overflow-hidden relative group">
                    <SkillRuneIcon
                      runeId={selectedRuneInstance.runeId}
                      rarity={selectedRuneInstance.rarity as any}
                      size={200}
                    />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white text-center mb-4 tracking-tighter">
                    {selectedRuneConfig.name}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-400 text-center leading-relaxed mb-8 px-4 font-medium">
                    {selectedRuneConfig.description}
                  </p>
                  <div className="mt-auto space-y-4">
                    <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
                      <div className="flex justify-between items-center text-xs md:text-sm font-bold">
                        <span className="text-zinc-500">Type</span>
                        <span className="text-blue-400 tracking-widest">
                          {selectedRuneConfig.effectType}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEquippingRune(true)}
                      className="w-full py-6 bg-cyan-400 text-black hover:bg-cyan-300 text-center font-black text-sm md:text-base tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none"
                    >
                      Imprint Rune
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <AtlasIcon name="AttackRune" size={96} />
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
        <RuneEquipOverlay
          stats={stats}
          selectedRuneId={selectedRuneId}
          runeName={selectedRuneConfig.name}
          onEquipRune={onEquipRune}
          onClose={() => {
            setSelectedRuneId(null);
            setIsEquippingRune(false);
          }}
        />
      )}
    </div>
  );
}

export default React.memo(Inventory, (prev, next) => {
  return prev.stats === next.stats;
});
