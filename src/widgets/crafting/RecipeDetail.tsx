import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { formatNumber } from '@/shared/lib/numberUtils';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface RecipeDetailProps {
  selectedRecipe: any;
  stats: PlayerStats;
  canCraft: (rcp: any) => boolean;
  onCraft: (requirements: any, result: any) => void;
}

export function RecipeDetail({ selectedRecipe, stats, canCraft, onCraft }: RecipeDetailProps) {
  if (!selectedRecipe) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-12 rounded-4xl h-full flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="w-24 h-24 bg-black/40 rounded-4xl flex items-center justify-center mb-8 text-rose-500/20 border border-white/5 shadow-inner">
          <span className="text-5xl font-black">?</span>
        </div>
        <h4 className="text-xl font-black text-white/40 tracking-tighter uppercase mb-2">Awaiting Selection</h4>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest max-w-[200px]">
          Select a blueprint to begin the manufacturing process.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[3rem] h-full flex flex-col overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-linear-to-b from-rose-500/5 to-transparent pointer-events-none" />

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex flex-col relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2.5rem] bg-black/40 border border-white/5 flex items-center justify-center p-4 shadow-inner relative group/preview mb-6">
            <div className="absolute inset-0 bg-rose-500/10 blur-3xl opacity-50 group-hover/preview:opacity-100 transition-opacity" />
            {selectedRecipe.image ? (
              <AtlasIcon
                name={selectedRecipe.image}
                size={128}
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
                            <AtlasIcon name="gold" size={24} />
                          ) : mineral?.image ? (
                            <AtlasIcon name={mineral.image} size={24} />
                          ) : (
                            <span className="text-sm">{mineral?.icon || '📦'}</span>
                          )}
                        </div>
                        <span className="text-zinc-300 font-black text-sm tracking-tight capitalize group-hover/req:text-rose-400 transition-colors">
                          {key === 'goldCoins' ? 'Gold' : ((mineral as any)?.nameKo || mineral?.name || key)}
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
  );
}

export default React.memo(RecipeDetail);
