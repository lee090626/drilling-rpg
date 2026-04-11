'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayerStats, Drill } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { DRILLS } from '@/shared/config/drillData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { useGachaAnimation, RESOURCE_PRICES, RARITY_COLORS } from './useGachaAnimation';

/**
 * 상점 컴포넌트의 Props 인터페이스입니다.
 */
interface ShopProps {
  stats: PlayerStats;
  onUpgrade: (type: string, requirements: any) => void;
  onSell: (resource: string, amount: number, price: number) => void;
  onSummonRune: (tier: number, count?: number) => void;
  onSynthesizeRunes: () => void;
  onClose: () => void;
}

/**
 * 플레이어가 자원을 판매하고 장비를 업그레이드하거나 스킬젬을 관리할 수 있는 상점(Forge) 컴포넌트입니다.
 */
function Shop({
  stats,
  onUpgrade,
  onSell,
  onSummonRune,
  onSynthesizeRunes,
  onClose,
}: ShopProps) {
  const [activeTab, setActiveTab] = useState<'minerals' | 'runes'>('minerals');
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});
  
  // 가챠 연출 Hook
  const {
    gachaState,
    gachaResults,
    isMultiDraw,
    rouletteItems,
    startRouletteAnim,
    performExtraction,
    resetGacha,
  } = useGachaAnimation(stats, onSummonRune);

  /** 보유 중인 룬 등급별 개수 집계 */
  const runeCounts = (stats.inventoryRunes || []).reduce((acc, rune) => {
    acc[rune.rarity] = (acc[rune.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-amber-500/5 to-transparent pointer-events-none" />

      {/* 헤더 섹션 - Bento 스타일의 플로팅 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6 relative z-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                <AtlasIcon name="gold" size={40} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-amber-400 leading-none">
                Shop
              </h2>
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1 opacity-60">Global Market</span>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl md:rounded-2xl border border-white/5 w-full sm:w-auto shadow-inner">
            <button
              onClick={() => setActiveTab('minerals')}
              className={`flex-1 sm:flex-none px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                activeTab === 'minerals'
                  ? 'bg-amber-500 text-black shadow-[0_4px_12px_rgba(245,158,11,0.3)]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sell
            </button>
            <button 
                onClick={() => setActiveTab('runes')}
                className={`flex-1 sm:flex-none px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                  activeTab === 'runes' 
                    ? 'bg-amber-500 text-black shadow-[0_4px_12px_rgba(245,158,11,0.3)]' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Runes
              </button>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
          <div className="flex items-center justify-center gap-3 md:gap-4 bg-black/40 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-3xl border border-white/5 shadow-inner group">
            <div className="flex items-center justify-center">
               <AtlasIcon name="gold" size={32} />
            </div>
            <span className="text-sm md:text-2xl font-black text-white tabular-nums tracking-tighter flex items-baseline gap-2">
              {stats.goldCoins.toLocaleString()}
              <span className="text-amber-500 text-[10px] md:text-xs uppercase tracking-widest font-black opacity-60">Gold</span>
            </span>
          </div>
            <button
              onClick={onClose}
              disabled={gachaState === 'drawing'}
              className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg md:text-xl font-bold">✕</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden min-h-0 pr-2 relative z-0">
        <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-4 custom-scrollbar pb-10">


          {activeTab === 'minerals' && (
            /* 광물 판매 섹션 */
            <section className="relative z-10">
              <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
              </div>
              
              <div className="grid grid-cols-1 gap-4 pb-12">
                {Object.entries(RESOURCE_PRICES).map(([res, price]) => {
                  const count = (stats.inventory as any)[res] || 0;
                  if (count <= 0) return null;
                  
                  const mineral = MINERALS.find(m => m.key === res);
                  const displayName = mineral?.name || res;
                  const currentAmount = sellAmounts[res] || 0;
                  const totalPrice = Math.floor(currentAmount * price);

                  const updateAmount = (val: number) => {
                    const newAmt = Math.max(0, Math.min(count, val));
                    setSellAmounts(prev => ({ ...prev, [res]: newAmt }));
                  };

                  return (
                    <div
                      key={res}
                      className="bg-zinc-900/40 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex flex-col lg:flex-row items-center gap-6 group transition-all hover:bg-zinc-800/60 hover:border-amber-500/20 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      {/* 좌측: 광물 정보 */}
                      <div className="flex items-center gap-4 md:gap-6 w-full lg:w-1/3 shrink-0 relative z-10">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:border-amber-500/30 transition-colors shrink-0">
                          {mineral?.image ? (
                            <AtlasIcon name={mineral.image} size={80} />
                          ) : (
                            <span className="text-3xl">{mineral?.icon || '💎'}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="text-xl md:text-2xl font-black text-white tracking-tighter truncate group-hover:text-amber-400 transition-colors">
                            {displayName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/30 rounded-md border border-white/5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Inv</span>
                                <span className="text-xs md:text-sm text-zinc-300 font-black tabular-nums">{count.toLocaleString()}</span>
                             </div>
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/10">
                                <span className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest italic">Price</span>
                                <span className="text-xs md:text-sm text-amber-500 font-black tabular-nums">{price.toLocaleString()}</span>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* 중앙: 거래 콘솔 */}
                      <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:flex-1 relative z-10">
                        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/5 w-full md:w-auto">
                          {[1, 10, 100].map(amt => (
                            <button 
                              key={amt}
                              onClick={() => updateAmount(currentAmount + amt)}
                              className="px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[11px] font-black rounded-lg transition-all active:scale-90 border border-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            >
                              +{amt}
                            </button>
                          ))}
                          <button 
                            onClick={() => updateAmount(count)}
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[11px] font-black rounded-lg transition-all active:scale-90 border border-amber-500/20 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          >
                            Max
                          </button>
                        </div>
                        
                        <div className="relative w-full md:w-32 group/input">
                          <input 
                            type="number" 
                            value={currentAmount}
                            onChange={(e) => updateAmount(parseInt(e.target.value) || 0)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-center text-lg font-black text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>

                        <div className="flex flex-col items-center md:items-start min-w-[120px]">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 opacity-60 italic">Total Value</div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xl md:text-2xl font-black tabular-nums tracking-tighter transition-colors ${currentAmount > 0 ? 'text-white' : 'text-zinc-700'}`}>
                                {totalPrice.toLocaleString()}
                              </span>
                              <div className="flex items-center justify-center">
                                <AtlasIcon name="gold" size={20} />
                              </div>
                            </div>
                        </div>
                      </div>

                      {/* 우측: 판매 버튼 */}
                      <div className="w-full md:w-auto shrink-0 relative z-10">
                         <button
                          onClick={() => {
                            onSell(res, currentAmount, totalPrice);
                            updateAmount(0);
                          }}
                          disabled={currentAmount <= 0}
                          className={`w-full md:w-32 py-3.5 text-sm font-black rounded-2xl transition-all active:scale-95 tracking-[0.2em] uppercase focus:outline-none focus:ring-2 focus:ring-amber-400/50
                            ${currentAmount > 0 
                              ? 'bg-linear-to-br from-amber-400 to-amber-600 text-black shadow-[0_8px_20px_rgba(217,119,6,0.3)] hover:brightness-110 active:translate-y-0.5' 
                              : 'bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed opacity-50'}
                          `}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 'runes' && (
            /* 스킬룬 관리 섹션 */
            <div className="flex flex-col gap-8 h-full p-2 overflow-y-auto custom-scrollbar relative z-10 pb-10">
              {/* 상단: 룬 추출 및 합성 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full shrink-0">
                {/* 티어별 추출기 목록 루프 */}
                {Array.from({ length: (stats.dimension || 0) + 1 }).map((_, tierIndex) => {
                  const cost = 500 * Math.pow(2, tierIndex);
                  return (
                  <div key={tierIndex} className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center text-center transition-all hover:bg-zinc-800/80 hover:border-amber-500/30">
                    <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 py-1.5 px-5 bg-amber-500 text-black rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
                      <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase">World {tierIndex} Tier</span>
                    </div>
                    
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-white/5 mt-10 md:mt-8 overflow-hidden relative group-hover:border-amber-500/30 transition-colors">
                       <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                       <AtlasIcon name="attack_rune" size={128} className="transition-transform duration-700 group-hover:rotate-12" />
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-amber-400 transition-colors">Tier {tierIndex} Summoner</h3>
                    <p className="text-zinc-500 text-xs md:text-sm mb-6 md:mb-8 font-bold tracking-tight max-w-[240px] opacity-80">Summoning of core energy modules from the {tierIndex === 0 ? 'Earth' : `Dimension ${tierIndex}`}.</p>
                    
                    {/* 확률표 */}
                    <div className="grid grid-cols-2 gap-2 w-full mb-8 bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
                      {[
                        { name: 'Uncommon', prob: '5%', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { name: 'Common', prob: '95%', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
                      ].map((item) => (
                        <div key={item.name} className={`flex flex-col items-center p-2 rounded-xl border border-transparent hover:border-white/5 transition-colors ${item.bg}`}>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.name.slice(0, 3)}</span>
                          <span className="text-[12px] font-black text-white tabular-nums mt-0.5">{item.prob}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full flex justify-between items-center mb-8 px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                      <span className="text-[11px] font-black text-zinc-500 tracking-widest uppercase">Fee</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl md:text-3xl font-black text-amber-500 tabular-nums tracking-tighter">{cost.toLocaleString()}</span>
                        <div className="flex items-center justify-center">
                          <AtlasIcon name="gold" size={24} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => performExtraction(tierIndex, 1)} 
                        className="py-4 bg-linear-to-br from-amber-400 to-amber-600 text-black rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg active:scale-95 hover:brightness-110"
                      >
                        Summon x1
                      </button>
                      <button 
                        onClick={() => performExtraction(tierIndex, 10)} 
                        className="py-4 bg-zinc-800 border border-amber-500/30 text-amber-500 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg active:scale-95 hover:bg-amber-500/10"
                      >
                        Summon x10
                      </button>
                    </div>
                  </div>
                )})}

                <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center text-center transition-all hover:bg-zinc-800/80 hover:border-purple-500/30">
                  <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl mb-6 shadow-inner border border-white/5 mt-10 md:mt-8 overflow-hidden relative group-hover:border-purple-500/30 transition-colors">
                     <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />
                     <span className="relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-transform duration-700 group-hover:scale-110">🔮</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-purple-400 transition-colors">Synthesizer</h3>
                  <p className="text-zinc-500 text-xs md:text-sm mb-6 md:mb-12 font-bold tracking-tight max-w-[240px] opacity-80">Optimizes and merges duplicate energy modules to create higher-tier components.</p>
                  
                  <div className="w-full flex justify-between items-center mb-8 px-6 py-4 bg-black/20 rounded-2xl border border-white/5">
                    <span className="text-[11px] font-black text-zinc-500 tracking-widest uppercase">Processor Mode</span>
                    <span className="text-xl md:text-2xl font-black text-purple-400 tracking-tighter uppercase italic">Batch Auto</span>
                  </div>
                  
                  <button 
                    onClick={onSynthesizeRunes} 
                    className="w-full py-5 bg-linear-to-br from-purple-500 to-purple-700 text-white rounded-2xl md:rounded-3xl font-black text-lg tracking-[0.2em] uppercase transition-all shadow-[0_12px_24px_rgba(168,85,247,0.3)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/40 hover:brightness-110 active:translate-y-1"
                  >
                    Synthesize
                  </button>
                </div>
              </div>

              {/* 하단: 보유 룬 현황 리스트 */}
              <div className="bg-black/40 backdrop-blur-sm p-6 md:p-10 rounded-[3rem] border border-white/5 flex-1 min-h-0 overflow-y-auto mb-10 custom-scrollbar shadow-inner relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-amber-400/20 to-transparent" />
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="text-[14px] font-black text-white tracking-widest uppercase">Inventory Log</h3>
                  </div>
                  <div className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-full shadow-lg">
                    <span className="text-amber-500 font-black tabular-nums tracking-tighter text-sm">{stats.inventoryRunes?.length || 0}</span>
                    <span className="ml-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Modules</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {Object.entries(runeCounts).map(([rarity, count]) => (
                    <div key={rarity} className={`px-5 py-3 border rounded-2xl flex items-center gap-4 transition-all shadow-xl backdrop-blur-md ${RARITY_COLORS[rarity] || 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>
                      <div className="w-2 h-2 rounded-full bg-current opacity-40 animate-pulse" />
                      <span className="text-sm font-black tracking-widest uppercase">{rarity}</span>
                      <div className="w-px h-4 bg-white/10" />
                      <span className="text-2xl font-black tabular-nums tracking-tighter text-white">x{count}</span>
                    </div>
                  ))}
                  {(!stats.inventoryRunes || stats.inventoryRunes.length === 0) && (
                    <div className="w-full text-center py-16 opacity-30">
                      <p className="text-lg font-black text-zinc-600 tracking-tighter mb-1">No modules detected.</p>
                      <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Extract core energy from the Global Market.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 가챠 오버레이 연출 */}
      {gachaState !== 'idle' && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-500"
          onClick={() => {
            if (gachaState === 'result') {
              resetGacha();
            }
          }}
        >
          {gachaState === 'drawing' && (
            <div className="flex flex-col items-center w-full max-w-5xl px-0 md:px-8 overflow-hidden relative">
              <p className="mb-10 md:mb-16 text-amber-500 font-black tracking-[0.4em] uppercase text-xl md:text-3xl drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                Summoning Sequence...
              </p>
              
              <div className="relative w-full h-[180px] md:h-[240px] flex items-center bg-black/60 rounded-3xl md:rounded-[3rem] border-y-2 border-white/10 overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,1)]">
                <div 
                  className="flex items-center h-full gap-4 will-change-transform"
                  style={{
                    paddingLeft: 'calc(50% - 75px)', // Item 150px / 2 = 75px
                    transform: startRouletteAnim ? `translateX(-8300px)` : 'translateX(0)', // 50 * (150px + 16px) = 8300px
                    transition: startRouletteAnim ? 'transform 5s cubic-bezier(0.1, 0.95, 0.2, 1)' : 'none'
                  }}
                >
                  {rouletteItems.map((item, idx) => (
                    <div key={idx} className={`shrink-0 transition-all duration-300 ${startRouletteAnim ? 'opacity-50 scale-90 blur-[2px]' : 'opacity-100 scale-100'} ${idx === 50 && startRouletteAnim ? 'opacity-100! scale-110! blur-0!' : ''}`}>
                      <SkillRuneIcon runeId={item.runeId} rarity={item.rarity as any} size={150} />
                    </div>
                  ))}
                </div>

                {/* 하이라이트 박스 (정중앙) */}
                <div className="absolute left-1/2 -translate-x-1/2 w-[160px] h-[180px] rounded-4xl border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5),inset_0_0_30px_rgba(245,158,11,0.2)] z-20 pointer-events-none flex flex-col justify-between items-center py-2 bg-amber-500/5 backdrop-blur-[1px]">
                   <div className="w-0 h-0 border-l-10 border-r-10 border-t-10 border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-md brightness-150" />
                   <div className="w-0 h-0 border-l-10 border-r-10 border-b-10 border-l-transparent border-r-transparent border-b-amber-500 drop-shadow-md brightness-150" />
                </div>
                 
                 {/* 그라데이션 가림막 (양 옆) */}
                 <div className="absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-black via-black/90 to-transparent z-10 pointer-events-none" />
                 <div className="absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-black via-black/90 to-transparent z-10 pointer-events-none" />
              </div>
            </div>
          )}
          
          {gachaState === 'result' && gachaResults.length > 0 && (
            <div className="flex flex-col items-center animate-in zoom-in-[0.8] duration-500 ease-out relative w-full h-full justify-center px-4 overflow-y-auto pt-20 pb-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-linear-to-tr from-transparent via-amber-500/5 to-transparent animate-[spin_20s_linear_infinite] pointer-events-none" />
              
              <div className="mb-8 md:mb-12 text-amber-400 font-black text-2xl md:text-5xl tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] text-center">
                Summoning Complete
              </div>

              <div className={`grid ${isMultiDraw ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1'} gap-4 md:gap-8 max-w-6xl w-full justify-items-center`}>
                {gachaResults.map((res, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="relative w-24 h-24 md:w-40 md:h-40 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden hover:scale-110 transition-transform duration-300 ring-4 ring-white/5 active:scale-95">
                      <SkillRuneIcon 
                        runeId={res.runeId} 
                        rarity={res.rarity as any} 
                        size={160}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                       <span className={`px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase border backdrop-blur-md mb-1 ${RARITY_COLORS[res.rarity] || 'text-white border-white'}`}>
                        {res.rarity}
                      </span>
                      <span className="text-xs md:text-sm font-black text-white/90 text-center drop-shadow-md truncate max-w-[120px]">
                        {SKILL_RUNES[res.runeId]?.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 md:mt-24 text-zinc-500 font-bold tracking-[0.5em] uppercase text-xs md:text-sm animate-pulse cursor-pointer">
                - Tap anywhere to continue -
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default React.memo(Shop, (prev, next) => {
  return prev.stats === next.stats;
});
