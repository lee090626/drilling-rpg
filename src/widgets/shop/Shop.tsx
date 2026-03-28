'use client';

import React, { useState } from 'react';
import { PlayerStats, Drill } from '../../shared/types/game';
import { MINERALS } from '../../shared/config/mineralData';
import { DRILLS } from '../../shared/config/drillData';

/**
 * 상점 컴포넌트의 Props 인터페이스입니다.
 */
interface ShopProps {
  /** 플레이어 통계 데이터 */
  stats: PlayerStats;
  /** 장비 업그레이드 실행 콜백 */
  onUpgrade: (type: string, requirements: any) => void;
  /** 자원 판매 실행 콜백 */
  onSell: (resource: string, amount: number, price: number) => void;
  /** 스킬룬 추출 실행 콜백 */
  onExtractRune: (tier: number) => void;
  /** 스킬룬 합성 실행 콜백 */
  onSynthesizeRunes: () => void;
  /** 상점 창 닫기 콜백 */
  onClose: () => void;
}

/**
 * 플레이어가 자원을 판매하고 장비를 업그레이드하거나 스킬젬을 관리할 수 있는 상점(Forge) 컴포넌트입니다.
 */
export default function Shop({
  stats,
  onUpgrade,
  onSell,
  onExtractRune,
  onSynthesizeRunes,
  onClose,
}: ShopProps) {
  const [activeTab, setActiveTab] = useState<'minerals' | 'runes'>('minerals');
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});
  
  /** 광물별 판매 가격 매핑 */
  const resourcePrices = MINERALS.reduce((acc, mineral) => {
    acc[mineral.key] = mineral.basePrice;
    return acc;
  }, {} as Record<string, number>);

  /** 등급별 색상 테마 정의 */
  const rarityColors: Record<string, string> = {
    Common: 'bg-zinc-900 border-zinc-700 text-zinc-400',
    Uncommon: 'bg-emerald-950/30 border-emerald-900 text-emerald-400',
    Rare: 'bg-blue-950/30 border-blue-900 text-blue-400',
    Epic: 'bg-purple-950/30 border-purple-900 text-purple-400',
    Radiant: 'bg-rose-950/30 border-rose-900 text-rose-400',
    Legendary: 'bg-amber-950/30 border-amber-900/50 text-amber-400',
    Mythic: 'bg-red-950/30 border-red-900/50 text-red-500',
    Unique: 'bg-cyan-950/30 border-cyan-900/50 text-cyan-400',
  };

  /** 보유 중인 룬 등급별 개수 집계 */
  const runeCounts = (stats.inventoryRunes || []).reduce((acc, rune) => {
    acc[rune.rarity] = (acc[rune.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* 헤더 섹션 - Bento 스타일의 플로팅 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-amber-400 leading-none">
            Shop
          </h2>
          
          <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('minerals')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-[16px] font-black tracking-wider transition-all ${
                activeTab === 'minerals'
                  ? 'bg-zinc-800 text-amber-400 shadow-lg border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sell Mineral
            </button>
            <button 
                onClick={() => setActiveTab('runes')}
                className={`py-3 md:py-4 px-6 md:px-8 rounded-full font-black text-sm md:text-[18px] transition-all tracking-widest ${
                  activeTab === 'runes' 
                    ? 'bg-amber-400 text-black shadow-[0_10px_20px_rgba(251,191,36,0.3)]' 
                    : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                MODULES
              </button>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-zinc-800 shadow-inner">
            <span className="text-base md:text-xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
              <span className="text-amber-400 text-sm md:text-xl ml-2">Gold</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all active:scale-90"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden min-h-0 pr-2 relative z-0">
        <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-4 custom-scrollbar pb-10">


          {activeTab === 'minerals' && (
            /* 광물 판매 섹션 */
            <section>
              <h3 className="text-[24px] font-black text-zinc-600 tracking-wider mb-6 border-b border-zinc-800 pb-2">
                Sell Mineral
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                {Object.entries(resourcePrices).map(([res, price]) => {
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
                      className="bg-zinc-900/60 p-4 md:p-8 rounded-2xl md:rounded-[3rem] border border-zinc-800/50 flex flex-col gap-4 md:gap-6 group transition-all hover:bg-zinc-800 shadow-xl min-h-[180px] md:min-h-[220px] justify-between"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-0.5 md:gap-1">
                          <div className="text-xl md:text-3xl font-black text-white tracking-tighter">
                            {displayName}
                          </div>
                          <div className="text-xs md:text-base text-zinc-600 font-black tracking-widest">
                            Inventory: <span className="text-zinc-400 tabular-nums">{count.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 md:gap-3 bg-black/30 p-2 md:p-3 rounded-2xl md:rounded-4xl border border-zinc-800/30">
                           <div className="flex items-center gap-1 md:gap-1.5 scale-90 sm:scale-100">
                              {[1, 10, 100].map(amt => (
                                <button 
                                  key={amt}
                                  onClick={() => updateAmount(currentAmount + amt)}
                                  className="px-2 py-1 md:px-3 md:py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs md:text-[16px] font-black rounded-lg md:rounded-xl transition-all active:scale-90 border border-zinc-700/30"
                                >
                                  +{amt}
                                </button>
                              ))}
                              <button 
                                onClick={() => updateAmount(count)}
                                className="px-2 py-1 md:px-3 md:py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[8px] md:text-[10px] font-black rounded-lg md:rounded-xl transition-all active:scale-90 border border-amber-400/20 uppercase"
                              >
                                Max
                              </button>
                           </div>
                           <div className="flex items-center justify-center w-full">
                              <input 
                                type="number" 
                                value={currentAmount}
                                onChange={(e) => updateAmount(parseInt(e.target.value) || 0)}
                                className="w-full sm:w-40 bg-zinc-950 border border-zinc-800 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 text-center text-lg md:text-2xl font-black text-white tabular-nums focus:outline-hidden focus:border-amber-400/50 transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                           </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-4 mt-2 pt-4 md:pt-6 border-t border-zinc-800/50 w-full">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-1.5 md:gap-2">
                             <span className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                               {totalPrice.toLocaleString()}
                             </span>
                             <span className="text-amber-400 font-black text-base md:text-xl tracking-tighter">Gold</span>
                           </div>
                        </div>

                         <button
                          onClick={() => {
                            onSell(res, currentAmount, totalPrice);
                            updateAmount(0);
                          }}
                          disabled={currentAmount <= 0}
                          className={`min-w-[100px] md:min-w-[140px] py-3 md:py-4 text-sm md:text-[18px] font-black rounded-xl md:rounded-2xl transition-all active:scale-95 border-2 tracking-widest
                            ${currentAmount > 0 
                              ? 'bg-amber-400 text-black border-amber-300 shadow-[0_10px_20px_rgba(251,191,36,0.3)] hover:brightness-110 active:translate-y-1' 
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'}
                          `}
                        >
                          SELL
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
            <div className="flex flex-col gap-6 h-full p-2 overflow-y-auto custom-scrollbar">
              {/* 상단: 룬 추출 및 합성 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full shrink-0">
                {/* 티어별 추출기 목록 루프 */}
                {Array.from({ length: (stats.dimension || 0) + 1 }).map((_, tierIndex) => {
                  const cost = 500 * Math.pow(2, tierIndex);
                  return (
                  <div key={tierIndex} className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl relative overflow-hidden group flex flex-col items-center text-center transition-all hover:bg-zinc-800/80">
                    <div className="absolute top-2 md:top-4 left-4 md:left-6 py-0.5 md:py-1 px-3 md:px-4 bg-amber-400/10 border border-amber-400/20 rounded-full">
                      <span className="text-amber-400 text-[10px] md:text-[12px] font-black tracking-widest">WORLD {tierIndex} TIER</span>
                    </div>
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-950 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 shadow-inner border border-zinc-800 mt-6 md:mt-6">⚙️</div>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter mb-1 md:mb-2">Tier {tierIndex} Extractor</h3>
                    <p className="text-zinc-500 text-[10px] md:text-[11px] mb-4 md:mb-6 font-bold tracking-wider opacity-60">Extracts core energy modules for World {tierIndex}.</p>
                    
                    {/* 확률표 */}
                    <div className="grid grid-cols-4 gap-2 w-full mb-8 bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                      {[
                        { name: 'Mythic', prob: '<1%', color: 'text-red-500' },
                        { name: 'Legendary', prob: '?', color: 'text-amber-400' },
                        { name: 'Radiant', prob: '?', color: 'text-rose-400' },
                        { name: 'Epic', prob: '?', color: 'text-purple-400' },
                        { name: 'Rare', prob: '?', color: 'text-blue-400' },
                        { name: 'Uncommon', prob: '5%', color: 'text-emerald-400' },
                        { name: 'Common', prob: '95%', color: 'text-zinc-400' },
                      ].map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                          <span className={`text-[10px] font-black ${item.color}`}>{item.name.slice(0, 3)}</span>
                          <span className="text-[12px] font-black text-white tabular-nums">{item.prob}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full flex justify-between items-center mb-8 px-4">
                      <span className="text-[10px] font-black text-zinc-600 tracking-wider">Extraction Fee</span>
                      <span className="text-2xl font-black text-amber-400 tabular-nums tracking-tighter">{cost.toLocaleString()} <span className="text-xs text-zinc-500">Credits</span></span>
                    </div>
                    <button 
                      onClick={() => onExtractRune(tierIndex)} 
                      className="text-xl w-full py-5 bg-amber-400 hover:brightness-110 text-black rounded-2xl font-black tracking-widest transition-all shadow-xl active:scale-95"
                    >
                      Extract Tier {tierIndex}
                    </button>
                  </div>
                )})}

                <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl relative overflow-hidden group flex flex-col items-center text-center transition-all hover:bg-zinc-800/80">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-950 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 shadow-inner border border-zinc-800">🔮</div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter mb-1 md:mb-2">Auto Synthesizer</h3>
                  <p className="text-zinc-500 text-[10px] md:text-[11px] mb-4 md:mb-8 font-bold tracking-wider opacity-60">Optimizes and synthesizes duplicate runes.</p>
                  <div className="w-full flex justify-between items-center mb-6 md:mb-8 px-2 md:px-4">
                    <span className="text-[9px] md:text-[10px] font-black text-zinc-600 tracking-wider">Operation Mode</span>
                    <span className="text-lg md:text-2xl font-black text-purple-400 tabular-nums tracking-tighter">Batch Processing</span>
                  </div>
                  <button onClick={onSynthesizeRunes} className="w-full py-4 md:py-5 bg-purple-600/80 hover:bg-purple-500 text-white rounded-xl md:rounded-2xl font-black tracking-widest transition-all shadow-xl active:scale-95 border border-purple-500/20 text-sm md:text-base">
                    Synthesize
                  </button>
                </div>
              </div>

              {/* 하단: 보유 룬 현황 리스트 */}
              <div className="mt-8 bg-zinc-950 p-10 rounded-[3rem] border border-zinc-800 flex-1 min-h-0 overflow-y-auto mb-10 custom-scrollbar shadow-inner relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-amber-400/20 to-transparent" />
                <h3 className="text-[10px] font-black text-zinc-600 tracking-widest mb-10 flex items-center justify-between">
                  <span>Inventory Log</span>
                  <span className="bg-zinc-900/80 px-4 py-1.5 rounded-full text-zinc-500 border border-zinc-800 tabular-nums">{stats.inventoryRunes?.length || 0} Modules</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(runeCounts).map(([rarity, count]) => (
                    <div key={rarity} className={`px-5 py-3 border rounded-xl flex items-center gap-4 transition-all hover:-translate-y-1 shadow-md ${rarityColors[rarity] || 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>
                      <span className="text-sm font-black tracking-wider">{rarity}</span>
                      <span className="text-2xl font-black tabular-nums tracking-tighter">x{count}</span>
                    </div>
                  ))}
                  {(!stats.inventoryRunes || stats.inventoryRunes.length === 0) && (
                    <div className="w-full text-center py-10 opacity-30">
                      <p className="text-xs font-bold text-zinc-500 tracking-wider mb-2">No runes acquired yet.</p>
                      <p className="text-sm font-medium text-zinc-600">Extract some runes using your credits!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
