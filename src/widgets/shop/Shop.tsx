'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayerStats, Equipment, EquipmentPart } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { useGachaAnimation } from './useGachaAnimation';
import GachaOverlay from './GachaOverlay';
import MineralSellTab from './MineralSellTab';
import RuneSummonTab from './RuneSummonTab';

import { useShopTrade } from './useShopTrade';

/**
 * 상점 컴포넌트의 Props 인터페이스입니다.
 */
interface ShopProps {
  stats: PlayerStats;
  onUpgrade: (id: string, price: Record<string, number>) => void;
  onSell: (resource: string, amount: number, price: number) => void;
  onSummonRune: (tier: number, count?: number) => void;
  onSynthesizeRunes: () => void;
  onClose: () => void;
}

/**
 * 플레이어가 자원을 판매하고 장비를 업그레이드하거나 스킬젬을 관리할 수 있는 상점(Forge) 컴포넌트입니다.
 */
function Shop({ stats, onUpgrade, onSell, onSummonRune, onSynthesizeRunes, onClose }: ShopProps) {
  const {
    activeTab,
    setActiveTab,
    sellAmounts,
    updateSellAmount,
    resetSellAmount,
  } = useShopTrade(stats);

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
  const runeCounts = (stats.inventoryRunes || []).reduce(
    (acc, rune) => {
      acc[rune.rarity] = (acc[rune.rarity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-amber-500/5 to-transparent pointer-events-none" />

      {/* 헤더 섹션 - Bento 스타일의 플로팅 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6 relative z-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
              <AtlasIcon name="GoldIcon" size={40} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-amber-400 leading-none">
                Shop
              </h2>
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1 opacity-60">
                Global Market
              </span>
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
              <AtlasIcon name="GoldIcon" size={32} />
            </div>
            <span className="text-sm md:text-2xl font-black text-white tabular-nums tracking-tighter flex items-baseline gap-2">
              {stats.goldCoins.toLocaleString()}
              <span className="text-amber-500 text-[10px] md:text-xs uppercase tracking-widest font-black opacity-60">
                Gold
              </span>
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
            <MineralSellTab
              stats={stats}
              sellAmounts={sellAmounts}
              onUpdateAmount={updateSellAmount}
              onSell={onSell}
            />
          )}

          {activeTab === 'runes' && (
            <RuneSummonTab
              stats={stats}
              performExtraction={performExtraction}
              onSynthesizeRunes={onSynthesizeRunes}
            />
          )}
        </div>
      </div>

      {/* 가챠 오버레이 연출 */}
      <GachaOverlay
        gachaState={gachaState}
        startRouletteAnim={startRouletteAnim}
        rouletteItems={rouletteItems}
        gachaResults={gachaResults}
        isMultiDraw={isMultiDraw}
        onReset={resetGacha}
      />
    </div>
  );
}

export default React.memo(Shop, (prev, next) => {
  return prev.stats === next.stats;
});
