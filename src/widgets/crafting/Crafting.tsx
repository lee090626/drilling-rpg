'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayerStats } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';
import { DRONES } from '../../shared/config/droneData';
import { MINERALS } from '../../shared/config/mineralData';
import { formatNumber } from '../../shared/lib/numberUtils';
import GoldIconImg from '@/src/shared/assets/ui/icons/MoneyIcon.webp';

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
function Crafting({ stats, onCraft, onClose }: CraftingProps) {
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
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-rose-500/5 to-transparent pointer-events-none" />

      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6 relative z-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-rose-500/20 shadow-inner">
              ⚒️
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-rose-500 leading-none">
                Forge
              </h2>
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1 opacity-60">Heavy Forge</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
          <div className="flex items-center justify-center gap-3 md:gap-4 bg-black/40 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-3xl border border-white/5 shadow-inner">
            <div className="w-6 h-6 md:w-8 md:h-8 relative">
               <Image src={GoldIconImg} alt="Gold" fill className="object-contain" />
            </div>
            <span className="text-sm md:text-2xl font-black text-white tabular-nums tracking-tighter flex items-baseline gap-2">
              {stats.goldCoins.toLocaleString()}
              <span className="text-rose-500 text-[10px] md:text-xs uppercase tracking-widest font-black opacity-60">Gold</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-90 shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        
        {/* 중간 열: 제작 가능한 아이템 목록(Blueprints) */}
        <div className="flex-1 flex flex-col h-auto lg:h-full overflow-hidden min-h-0 relative z-10">
          <div className="bg-zinc-900/60 backdrop-blur-xl p-2 rounded-3xl md:rounded-[3rem] flex flex-col h-full overflow-hidden shadow-2xl border border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-4 px-6 md:px-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <h2 className="text-[14px] md:text-[16px] font-black text-white tracking-widest uppercase opacity-60">
                  Blueprints
                </h2>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl md:rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('drill')}
                  className={`flex-1 sm:flex-none px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-rose-400/50 ${
                    activeTab === 'drill'
                      ? 'bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Drills
                </button>
                <button
                  onClick={() => setActiveTab('drone')}
                  className={`flex-1 sm:flex-none px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-rose-400/50 ${
                    activeTab === 'drone'
                      ? 'bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Drones
                </button>
              </div>
            </div>

            {/* 드론 세부 필터 */}
            {activeTab === 'drone' && (
              <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl self-end scale-90 origin-right px-4 md:px-6 mb-4 mr-4 md:mr-8 border border-white/5 shadow-inner">
                {(['all', 'mining', 'support'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDroneFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                      droneFilter === f
                        ? 'bg-zinc-800 text-amber-400 border border-white/10 shadow-lg'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto px-4 md:px-8 custom-scrollbar flex-1 pb-12 min-h-0 pt-2">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {(activeTab === 'drill' ? drillRecipes : droneRecipes).map((rcp) => {
                  const active = selectedRecipe?.name === rcp.name;
                  const craftable = canCraft(rcp);
                  const owned = (rcp.type === 'drill' && stats.ownedDrillIds?.includes(rcp.id)) ||
                                (rcp.type === 'drone' && stats.ownedDroneIds?.includes(rcp.id));

                  return (
                    <button
                      key={rcp.name}
                      onClick={() => setSelectedRecipe(rcp)}
                      className={`relative p-4 md:p-6 rounded-4xl border transition-all flex items-center gap-6 md:gap-8 text-left group overflow-hidden focus:outline-none focus:ring-4 focus:ring-rose-500/20 ${
                        active
                          ? 'bg-zinc-800 border-rose-500/50 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20'
                          : 'bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center text-4xl transition-all shrink-0 overflow-hidden shadow-inner group-hover:border-rose-500/30`}
                      >
                        {rcp.image ? (
                          <img
                            src={typeof rcp.image === 'string' ? rcp.image : rcp.image?.src || rcp.image}
                            alt={rcp.name}
                            className={`w-full h-full object-contain p-2 ${owned ? 'opacity-40 grayscale' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}
                          />
                        ) : (
                          <span className={`${owned ? 'opacity-40 grayscale' : ''}`}>{rcp.icon}</span>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <div className={`text-xl md:text-2xl font-black tracking-tighter leading-tight ${active ? 'text-white' : 'text-zinc-300'}`}>
                              {rcp.name}
                           </div>
                           {owned && (
                             <div className="px-2 py-0.5 bg-zinc-800 rounded-md border border-white/5">
                               <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Owned</span>
                             </div>
                           )}
                        </div>
                        <div className="flex gap-2">
                           <div className={`h-1.5 w-16 bg-black/40 rounded-full overflow-hidden border border-white/5`}>
                              <div 
                                className={`h-full bg-rose-500 transition-all duration-1000 ${craftable ? 'opacity-100' : 'opacity-20'}`}
                                style={{ width: craftable ? '100%' : '20%' }}
                              />
                           </div>
                        </div>
                      </div>
                      
                      {active && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 열: 선택된 아이템의 상세 정보 및 제작 버튼 */}
        <div className="w-full lg:w-[320px] xl:w-[420px] flex flex-col h-auto lg:h-full shrink-0 min-h-0 mt-4 lg:mt-0 relative z-10">
          {selectedRecipe ? (
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[3rem] h-full flex flex-col overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-linear-to-b from-rose-500/5 to-transparent pointer-events-none" />

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex flex-col relative z-10">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2.5rem] bg-black/40 border border-white/5 flex items-center justify-center p-4 shadow-inner relative group/preview mb-6">
                    <div className="absolute inset-0 bg-rose-500/10 blur-3xl opacity-50 group-hover/preview:opacity-100 transition-opacity" />
                    {selectedRecipe.image ? (
                      <img
                        src={typeof selectedRecipe.image === 'string' ? selectedRecipe.image : selectedRecipe.image.src || selectedRecipe.image}
                        alt={selectedRecipe.name}
                        className="w-full h-full object-contain relative z-10"
                      />
                    ) : (
                      <span className="text-6xl relative z-10">{selectedRecipe.icon}</span>
                    )}
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-2 leading-tight uppercase">
                    {selectedRecipe.name}
                  </h3>
                </div>

                {/* 능력치 카드 프레임 */}
                <div className="w-full space-y-4 mb-8">
                  <div className="bg-black/40 px-6 py-6 rounded-3xl border border-white/5 flex items-center justify-around group/stat hover:border-rose-500/20 transition-all shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-rose-500/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity pointer-events-none" />
                    
                    {selectedRecipe.type === 'drone' && selectedRecipe.category === 'support' ? (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none">
                            {selectedRecipe.smeltSpeedMult ? `+${Math.round((1 - selectedRecipe.smeltSpeedMult) * 100)}%` : '0%'}
                          </span>
                          <span className="text-[10px] text-sky-400 font-black tracking-widest uppercase">Smelt Speed</span>
                        </div>
                        <div className="w-px h-10 bg-white/5 rounded-full" />
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none">
                            +{selectedRecipe.smeltSlotBonus || 0}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">Extra Slots</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                             <span className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{selectedRecipe.power}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-black tracking-widest">Power</span>
                        </div>
                        <div className="w-px h-10 bg-white/5 rounded-full" />
                        <div className="flex flex-col items-center gap-1">
                           <div className="flex items-center gap-2">
                             <span className="text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{selectedRecipe.cooldownMs}</span>
                           </div>
                          <span className="text-[10px] text-zinc-500 font-black tracking-widest">Speed</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-black text-rose-500/80 tracking-widest">Requirements</span>
                    <span className="text-[14px] text-zinc-600 font-bold tracking-widest">Materials needed</span>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(selectedRecipe.requirements).map(
                      ([key, val]) => {
                        const currentVal =
                          (stats as any)[key] !== undefined
                            ? (stats as any)[key]
                            : (stats.inventory as any)[key] || 0;
                        const met = currentVal >= (val as number);
                        const mineral = MINERALS.find(m => m.key === key);
                        const progress = Math.min(100, (currentVal / (val as number)) * 100);
                        
                        return (
                          <div key={key} className="group/req">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center p-1.5 shadow-inner">
                                  {key === 'goldCoins' ? (
                                    <Image src={GoldIconImg} alt="Gold" width={24} height={24} className="object-contain" />
                                  ) : mineral?.image ? (
                                    <img src={typeof mineral.image === 'string' ? mineral.image : mineral.image.src || mineral.image} alt={key} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-sm">{mineral?.icon || '📦'}</span>
                                  )}
                                </div>
                                <span className="text-zinc-300 font-black text-sm tracking-tight capitalize group-hover/req:text-rose-400 transition-colors">
                                  {key === 'goldCoins' ? 'Gold' : key}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                 <span className={`font-black text-xs tabular-nums ${met ? 'text-emerald-400' : 'text-rose-500'}`}>
                                    {formatNumber(currentVal)}
                                 </span>
                                 <span className="text-zinc-700 text-[10px] font-bold">/</span>
                                 <span className="text-zinc-500 text-xs font-black tabular-nums">
                                    {formatNumber(val as number)}
                                 </span>
                              </div>
                            </div>
                            <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                               <div 
                                 className={`h-full transition-all duration-1000 ${met ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                 style={{ width: `${progress}%` }}
                               />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-auto relative z-10">
                <button
                  disabled={!canCraft(selectedRecipe)}
                  onClick={() =>
                    onCraft(selectedRecipe.requirements, selectedRecipe.result)
                  }
                  className={`w-full py-5 rounded-3xl text-sm md:text-base font-black tracking-[0.2em] uppercase border transition-all active:scale-95 shadow-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/40 ${
                    canCraft(selectedRecipe)
                      ? 'bg-linear-to-br from-rose-500 to-rose-700 text-white border-rose-400 shadow-[0_12px_24px_rgba(244,63,94,0.3)] hover:brightness-110 active:translate-y-1'
                      : 'bg-zinc-800 text-zinc-600 border-white/5 cursor-not-allowed grayscale'
                  }`}
                >
                  {(selectedRecipe.type === 'drill' && stats.ownedDrillIds?.includes(selectedRecipe.id)) ||
                   (selectedRecipe.type === 'drone' && stats.ownedDroneIds?.includes(selectedRecipe.id))
                    ? 'Already Owned'
                    : 'System Craft'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-12 rounded-4xl h-full flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="w-24 h-24 bg-black/40 rounded-4xl flex items-center justify-center mb-8 text-rose-500/20 border border-white/5 shadow-inner">
                <span className="text-5xl font-black">?</span>
              </div>
              <h4 className="text-xl font-black text-white/40 tracking-tighter uppercase mb-2">Awaiting Selection</h4>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest max-w-[200px]">
                Select a blueprint to begin the manufacturing process.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Crafting, (prev, next) => {
  return prev.stats === next.stats;
});
