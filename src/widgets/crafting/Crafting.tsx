'use client';

import React, { useState } from 'react';
import { PlayerStats } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';
import { DRONES } from '../../shared/config/droneData';
import { MINERALS } from '../../shared/config/mineralData';
import { formatNumber } from '../../shared/lib/numberUtils';

/**
 * 제작 시스템 컴포넌트의 Props 인터페이스입니다.
 */
interface CraftingProps {
  /** 플레이어 통계 데이터 */
  stats: PlayerStats;
  /** 아이템 제작 실행 콜백 */
  onCraft: (requirements: any, result: any) => void;
  /** 제작 창 닫기 콜백 */
  onClose: () => void;
}

/**
 * 플레이어가 수집한 광물을 사용하여 새로운 드릴 장비를 제작할 수 있는 기지(Forge) 컴포넌트입니다.
 */
export default function Crafting({ stats, onCraft, onClose }: CraftingProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'drill' | 'drone'>('drill');
  const [droneFilter, setDroneFilter] = useState<'all' | 'mining' | 'support'>('all');

  const drillRecipes = Object.values(DRILLS)
    .filter((drill) => drill.price) // 가격 정보가 있는(제작 가능한) 아이템만 필터링
    .map((drill) => ({
      name: drill.name,
      icon: drill.icon,
      requirements: drill.price || {},
      result: {
        drillId: drill.id,
      },
      description: drill.description,
      id: drill.id,
      power: drill.basePower,
      cooldownMs: drill.cooldownMs,
      specialEffect: drill.specialEffect,
      maxSkillSlots: drill.maxSkillSlots,
      image: drill.image,
      type: 'drill'
    }));

  const droneRecipes = Object.values(DRONES)
    .filter((drone) => drone.price && (droneFilter === 'all' || drone.category === droneFilter))
    .map((drone) => ({
      name: drone.name,
      icon: drone.icon,
      category: drone.category,
      requirements: drone.price || {},
      result: {
        droneId: drone.id,
      },
      description: drone.description,
      id: drone.id,
      power: drone.basePower,
      cooldownMs: drone.cooldownMs,
      specialEffect: drone.specialEffect,
      smeltSpeedMult: drone.smeltSpeedMult,
      smeltSlotBonus: drone.smeltSlotBonus,
      maxSkillSlots: 0,
      image: null,
      type: 'drone'
    }));

  const recipes = [...drillRecipes, ...droneRecipes];

  /** 해당 레시피를 제작할 수 있는지 확인하는 함수 */
  const canCraft = (rcp: any) => {
    // 이미 보유한 장비는 다시 제작할 수 없음
    if (rcp.type === 'drill' && stats.ownedDrillIds?.includes(rcp.id)) return false;
    if (rcp.type === 'drone' && stats.ownedDroneIds?.includes(rcp.id)) return false;
    // 모든 재료 조건을 충족하는지 확인
    return Object.entries(rcp.requirements).every(([key, val]) => {
      const currentVal =
        (stats as any)[key] !== undefined
          ? (stats as any)[key]
          : (stats.inventory as any)[key] || 0;
      return currentVal >= (val as number);
    });
  };

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 px-4 py-3 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-rose-500 tracking-tighter mix-blend-screen">
            BlackSmith Forge
          </h2>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all active:scale-90"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        
        {/* 중간 열: 제작 가능한 아이템 목록(Blueprints) */}
        <div className="flex-1 flex flex-col h-auto lg:h-full overflow-hidden min-h-0">
          <div className="bg-zinc-900 p-2 rounded-2xl md:rounded-[2.5rem] flex flex-col h-full overflow-hidden shadow-xl border border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-2 px-4 md:px-6">
              <h2 className="text-[14px] md:text-[16px] font-black text-zinc-500 tracking-widest uppercase">
                Blueprints
              </h2>
              <div className="flex bg-zinc-950 p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('drill')}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-[14px] font-black tracking-widest transition-all ${
                    activeTab === 'drill'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Drills
                </button>
                <button
                  onClick={() => setActiveTab('drone')}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-[14px] font-black tracking-widest transition-all ${
                    activeTab === 'drone'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Drones
                </button>
              </div>
            </div>

            {/* 드론 세부 필터 */}
            {activeTab === 'drone' && (
              <div className="flex gap-2 bg-zinc-950/50 p-1 rounded-lg self-end scale-90 origin-right px-4 md:px-6 mb-2">
                {(['all', 'mining', 'support'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDroneFilter(f)}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-black tracking-widest uppercase transition-all ${
                      droneFilter === f
                        ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto px-2 md:px-4 custom-scrollbar flex-1 pb-10 min-h-0 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 md:gap-5">
                {(activeTab === 'drill' ? drillRecipes : droneRecipes).map((rcp) => {
                  const active = selectedRecipe?.name === rcp.name;

                  return (
                    <button
                      key={rcp.name}
                      onClick={() => setSelectedRecipe(rcp)}
                      className={`relative p-3 md:p-4 rounded-2xl md:rounded-4xl border transition-all flex items-center gap-4 md:gap-6 text-left group overflow-hidden ${
                        active
                          ? 'bg-zinc-800 border-amber-400/50 shadow-[0_20px_40px_-15px_rgba(251,191,36,0.15)] scale-[1.02]'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl transition-all shrink-0 overflow-hidden`}
                      >
                        {rcp.image ? (
                          <img
                            src={typeof rcp.image === 'string' ? rcp.image : rcp.image?.src || rcp.image}
                            alt={rcp.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          rcp.icon
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`font-black text-lg md:text-2xl tracking-tighter mb-0.5 md:mb-1.5 ${
                            active ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {rcp.name}
                        </div>
                      </div>
                      {active && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      {/* 오른쪽 열: 선택된 아이템의 상세 정보 및 제작 버튼 */}
      <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col h-auto lg:h-full overflow-y-auto custom-scrollbar shrink-0 min-h-0 mt-4 lg:mt-0">
          {selectedRecipe ? (
            <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-[3rem] h-full flex flex-col overflow-hidden shadow-2xl relative">

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex flex-col">
                <div className="flex items-center gap-6">
                  <div className="w-25 h-25 rounded-3xl flex items-center justify-center text-5xl overflow-hidden shadow-inner p-0">
                    {selectedRecipe.image ? (
                      <img
                        src={typeof selectedRecipe.image === 'string' ? selectedRecipe.image : selectedRecipe.image.src || selectedRecipe.image}
                        alt={selectedRecipe.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      selectedRecipe.icon
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-1 leading-tight">
                      {selectedRecipe.name}
                    </h3>
                  </div>
                </div>

                {/* 능력치 카드 프레임 */}
                <div className="w-full space-y-4 mb-4">
                  <div className="bg-zinc-950 px-4 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-4xl border border-zinc-800 flex items-center justify-around group/stat hover:border-amber-400/20 transition-all active:scale-[0.99] shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-400/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity pointer-events-none" />
                    
                    {selectedRecipe.type === 'drone' && selectedRecipe.category === 'support' ? (
                      <>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter leading-none">
                            {selectedRecipe.smeltSpeedMult ? `+${Math.round((1 - selectedRecipe.smeltSpeedMult) * 100)}%` : '0%'}
                          </span>
                          <span className="text-[9px] md:text-[11px] text-amber-400 font-bold tracking-widest uppercase">Smelt Speed</span>
                        </div>
                        <div className="w-px h-8 bg-zinc-800/50 rounded-full" />
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter leading-none">
                            +{selectedRecipe.smeltSlotBonus || 0}
                          </span>
                          <span className="text-[9px] md:text-[11px] text-emerald-400 font-bold tracking-widest uppercase">Extra Slots</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{selectedRecipe.power}</span>
                          <span className="text-[9px] md:text-[11px] text-[#e95104] font-bold tracking-widest uppercase">Attack</span>
                        </div>
                        <div className="w-px h-8 bg-zinc-800/50 rounded-full" />
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{selectedRecipe.cooldownMs}</span>
                          <span className="text-[9px] md:text-[11px] text-[#4876ba] font-bold tracking-widest uppercase">Speed</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-3 pt-4 border-t border-zinc-800">
                  <p className="text-[14px] font-black text-[#a68ddb] tracking-widest mb-2">
                    Requirements
                  </p>
                  <div className="space-y-3">
                    {Object.entries(selectedRecipe.requirements).map(
                      ([key, val]) => {
                        const currentVal =
                          (stats as any)[key] !== undefined
                            ? (stats as any)[key]
                            : (stats.inventory as any)[key] || 0;
                        const met = currentVal >= (val as number);
                        const mineral = MINERALS.find(m => m.key === key);
                        
                        return (
                          <div
                            key={key}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm">
                                {mineral?.image ? <img src={typeof mineral.image === 'string' ? mineral.image : mineral.image.src || mineral.image} alt={mineral?.name} className="w-full h-full object-contain drop-shadow-sm" /> : mineral?.icon || '📦'}
                              </div>
                              <span className="text-[#c7c3d0] font-black text-sm md:text-[18px] tracking-wider truncate max-w-[80px] md:max-w-none">
                                {key}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span
                                className={`font-black text-[10px] md:text-sm tabular-nums ${met ? 'text-amber-400' : 'text-rose-500'}`}
                              >
                                {formatNumber(currentVal)} / {formatNumber(val as number)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 md:pt-10 mt-auto relative z-10">
                <button
                  disabled={!canCraft(selectedRecipe)}
                  onClick={() =>
                    onCraft(selectedRecipe.requirements, selectedRecipe.result)
                  }
                  className={`w-full py-4 md:py-5 rounded-2xl md:rounded-4xl text-[10px] md:text-[11px] font-black tracking-widest border transition-all active:scale-95 shadow-2xl ${
                    canCraft(selectedRecipe)
                      ? 'bg-amber-400 text-black border-amber-400 hover:brightness-110'
                      : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  {(selectedRecipe.type === 'drill' && stats.ownedDrillIds?.includes(selectedRecipe.id)) ||
                   (selectedRecipe.type === 'drone' && stats.ownedDroneIds?.includes(selectedRecipe.id))
                    ? 'Owned'
                    : 'Crafting'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[3rem] h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 text-amber-400/50 border border-zinc-800">
                <span className="text-2xl font-black">?</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                Awaiting Selection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
