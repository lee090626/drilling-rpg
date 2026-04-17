import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { RESOURCE_PRICES } from './useGachaAnimation';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface MineralSellTabProps {
  stats: PlayerStats;
  sellAmounts: Record<string, number>;
  onUpdateAmount: (resource: string, amount: number) => void;
  onSell: (resource: string, amount: number, price: number) => void;
}

export default function MineralSellTab({
  stats,
  sellAmounts,
  onUpdateAmount,
  onSell,
}: MineralSellTabProps) {
  return (
    <section className="relative z-10 w-full">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4"></div>

      <div className="grid grid-cols-1 gap-4 pb-12 w-full">
        {Object.entries(RESOURCE_PRICES).map(([res, price]) => {
          const count = (stats.inventory as any)[res] || 0;
          if (count <= 0) return null;

          const mineral = MINERALS.find((m) => m.key === res);
          const displayName = (mineral as any)?.nameKo || mineral?.name || res;
          const currentAmount = sellAmounts[res] || 0;
          const totalPrice = Math.floor(currentAmount * price);

          const updateAmount = (val: number) => {
            const newAmt = Math.max(0, Math.min(count, val));
            onUpdateAmount(res, newAmt);
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
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Inv
                      </span>
                      <span className="text-xs md:text-sm text-zinc-300 font-black tabular-nums">
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/10">
                      <span className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest italic">
                        Price
                      </span>
                      <span className="text-xs md:text-sm text-amber-500 font-black tabular-nums">
                        {price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 중앙: 거래 콘솔 */}
              <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:flex-1 relative z-10">
                <div className="flex flex-wrap items-center justify-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/5 w-full md:w-auto">
                  {[1, 10, 100].map((amt) => (
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
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 opacity-60 italic">
                    Total Value
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xl md:text-2xl font-black tabular-nums tracking-tighter transition-colors ${currentAmount > 0 ? 'text-white' : 'text-zinc-700'}`}
                    >
                      {totalPrice.toLocaleString()}
                    </span>
                    <div className="flex items-center justify-center">
                      <AtlasIcon name="GoldIcon" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: 판매 버튼 */}
              <div className="w-full md:w-auto shrink-0 relative z-10">
                <button
                  onClick={() => {
                    onSell(res, currentAmount, totalPrice);
                    updateAmount(0); // Reset after sell
                  }}
                  disabled={currentAmount <= 0}
                  className={`w-full md:w-32 py-3.5 text-sm font-black rounded-2xl transition-all active:scale-95 tracking-[0.2em] uppercase focus:outline-none focus:ring-2 focus:ring-amber-400/50
                    ${
                      currentAmount > 0
                        ? 'bg-linear-to-br from-amber-400 to-amber-600 text-black shadow-[0_8px_20px_rgba(217,119,6,0.3)] hover:brightness-110 active:translate-y-0.5'
                        : 'bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed opacity-50'
                    }
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
  );
}
