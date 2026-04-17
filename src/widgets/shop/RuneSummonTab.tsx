import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { RARITY_COLORS } from './useGachaAnimation';

interface RuneSummonTabProps {
  stats: PlayerStats;
  performExtraction: (tier: number, count?: number) => void;
  onSynthesizeRunes: () => void;
}

export default function RuneSummonTab({
  stats,
  performExtraction,
  onSynthesizeRunes,
}: RuneSummonTabProps) {
  /** 보유 중인 룬 등급별 개수 집계 */
  const runeCounts = (stats.inventoryRunes || []).reduce(
    (acc, rune) => {
      acc[rune.rarity] = (acc[rune.rarity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex flex-col gap-8 h-full p-2 overflow-y-auto custom-scrollbar relative z-10 pb-10 w-full">
      {/* 상단: 룬 추출 및 합성 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full shrink-0">
        {/* 티어별 추출기 목록 루프 */}
        {Array.from({ length: (stats.dimension || 0) + 1 }).map((_, tierIndex) => {
          const cost = 500 * Math.pow(2, tierIndex);
          return (
            <div
              key={tierIndex}
              className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center text-center transition-all hover:bg-zinc-800/80 hover:border-amber-500/30 w-full"
            >
              <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 py-1.5 px-5 bg-amber-500 text-black rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
                <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase">
                  World {tierIndex} Tier
                </span>
              </div>

              <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-white/5 mt-10 md:mt-8 overflow-hidden relative group-hover:border-amber-500/30 transition-colors">
                <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                <AtlasIcon
                  name="AttackRune"
                  size={128}
                  className="transition-transform duration-700 group-hover:rotate-12"
                />
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-amber-400 transition-colors">
                Tier {tierIndex} Summoner
              </h3>
              <p className="text-zinc-500 text-xs md:text-sm mb-6 md:mb-8 font-bold tracking-tight max-w-[240px] opacity-80">
                Summoning of core energy modules from{' '}
                {tierIndex === 0 ? 'Limbo' : `Circle ${tierIndex}`}.
              </p>

              {/* 확률표 */}
              <div className="grid grid-cols-2 gap-2 w-full mb-8 bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
                {[
                  {
                    name: 'Uncommon',
                    prob: '5%',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-400/10',
                  },
                  {
                    name: 'Common',
                    prob: '95%',
                    color: 'text-zinc-400',
                    bg: 'bg-zinc-400/10',
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`flex flex-col items-center p-2 rounded-xl border border-transparent hover:border-white/5 transition-colors ${item.bg}`}
                  >
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}
                    >
                      {item.name.slice(0, 3)}
                    </span>
                    <span className="text-[12px] font-black text-white tabular-nums mt-0.5">
                      {item.prob}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full flex justify-between items-center mb-8 px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-[11px] font-black text-zinc-500 tracking-widest uppercase">
                  Fee
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl md:text-3xl font-black text-amber-500 tabular-nums tracking-tighter">
                    {cost.toLocaleString()}
                  </span>
                  <div className="flex items-center justify-center">
                    <AtlasIcon name="GoldIcon" size={24} />
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
          );
        })}

        {/* 합성기 카드 */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden group flex flex-col items-center text-center transition-all hover:bg-zinc-800/80 hover:border-purple-500/30 w-full">
          <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl mb-6 shadow-inner border border-white/5 mt-10 md:mt-8 overflow-hidden relative group-hover:border-purple-500/30 transition-colors">
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />
            <span className="relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-transform duration-700 group-hover:scale-110">
              🔮
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-purple-400 transition-colors">
            Synthesizer
          </h3>
          <p className="text-zinc-500 text-xs md:text-sm mb-6 md:mb-12 font-bold tracking-tight max-w-[240px] opacity-80">
            Optimizes and merges duplicate energy modules to create higher-tier components.
          </p>

          <div className="w-full flex justify-between items-center mb-8 px-6 py-4 bg-black/20 rounded-2xl border border-white/5">
            <span className="text-[11px] font-black text-zinc-500 tracking-widest uppercase">
              Processor Mode
            </span>
            <span className="text-xl md:text-2xl font-black text-purple-400 tracking-tighter uppercase italic">
              Batch Auto
            </span>
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
      <div className="bg-black/40 backdrop-blur-sm p-6 md:p-10 rounded-[3rem] border border-white/5 flex-1 min-h-0 overflow-y-auto mb-10 custom-scrollbar shadow-inner relative w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-amber-400/20 to-transparent" />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h3 className="text-[14px] font-black text-white tracking-widest uppercase">
              Inventory Log
            </h3>
          </div>
          <div className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-full shadow-lg">
            <span className="text-amber-500 font-black tabular-nums tracking-tighter text-sm">
              {stats.inventoryRunes?.length || 0}
            </span>
            <span className="ml-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Active Modules
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full">
          {Object.entries(runeCounts).map(([rarity, count]) => (
            <div
              key={rarity}
              className={`px-5 py-3 border rounded-2xl flex items-center gap-4 transition-all shadow-xl backdrop-blur-md ${RARITY_COLORS[rarity] || 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
            >
              <div className="w-2 h-2 rounded-full bg-current opacity-40 animate-pulse" />
              <span className="text-sm font-black tracking-widest uppercase">{rarity}</span>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-2xl font-black tabular-nums tracking-tighter text-white">
                x{count}
              </span>
            </div>
          ))}
          {(!stats.inventoryRunes || stats.inventoryRunes.length === 0) && (
            <div className="w-full text-center py-16 opacity-30">
              <p className="text-lg font-black text-zinc-600 tracking-tighter mb-1">
                No modules detected.
              </p>
              <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
                Extract core energy from the Global Market.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
