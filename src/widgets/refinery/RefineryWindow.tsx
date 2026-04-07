import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayerStats, SmeltingJob } from '../../shared/types/game';
import { REFINERY_RECIPES, RefineryRecipe } from '../../shared/config/refineryData';
import { MINERALS, MineralDefinition } from '../../shared/config/mineralData';
import { getDroneData } from '../../shared/config/droneData';
import GoldIconImg from '@/src/shared/assets/ui/icons/MoneyIcon.webp';

interface RefineryWindowProps {
  stats: PlayerStats;
  onClose: () => void;
  onStartSmelting: (recipeId: string) => void;
  onCollectSmelting: (jobId: string) => void;
}

function RefineryWindow({ stats, onClose, onStartSmelting, onCollectSmelting }: RefineryWindowProps) {
  // 컴포넌트가 활성화된 동안 프로그레스 바를 렌더링하기 위한 타이머
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  const activeJobs = stats.activeSmeltingJobs || [];
  
  // 드론 보너스 적용
  const equippedDrone = getDroneData(stats.equippedDroneId);
  const speedMult = equippedDrone?.smeltSpeedMult || 1;
  const extraSlots = equippedDrone?.smeltSlotBonus || 0;
  const maxSlots = stats.refinerySlots + extraSlots;

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-sky-500/5 to-transparent pointer-events-none" />

      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6 relative z-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-sky-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-sky-500/20 shadow-inner">
              ⚗️
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-sky-400 leading-none">
                Refinery
              </h2>
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1 opacity-60">Materials Processor</span>
            </div>
          </div>
          
          {/* 드론 보너스 표시 - 고도화된 배지 */}
          {equippedDrone && (equippedDrone.smeltSpeedMult || equippedDrone.smeltSlotBonus) && (
            <div className="flex items-center gap-3 md:gap-4 bg-black/40 border border-white/5 px-5 py-2.5 md:px-7 md:py-3 rounded-xl md:rounded-2xl shadow-inner w-full sm:w-auto overflow-hidden relative group/drone">
              <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover/drone:opacity-100 transition-opacity" />
              <div className="text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">{equippedDrone.icon}</div>
              <div className="flex flex-col">
                <span className="text-sky-400 text-[8px] md:text-[10px] font-black tracking-widest uppercase italic">Drone Link</span>
                <div className="flex gap-3 md:gap-4 mt-0.5">
                   {equippedDrone.smeltSpeedMult && (
                     <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-white font-black text-[10px] md:text-[11px] tabular-nums">+{Math.round((1 - equippedDrone.smeltSpeedMult) * 100)}% SPD</span>
                     </div>
                   )}
                   {equippedDrone.smeltSlotBonus && (
                     <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-white font-black text-[10px] md:text-[11px] tabular-nums">+{equippedDrone.smeltSlotBonus} SLT</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
          <div className="flex items-center justify-center gap-3 md:gap-4 bg-black/40 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-3xl border border-white/5 shadow-inner">
            <div className="w-6 h-6 md:w-8 md:h-8 relative">
               <Image src={GoldIconImg} alt="Gold" fill className="object-contain" />
            </div>
            <span className="text-sm md:text-2xl font-black text-white tabular-nums tracking-tighter flex items-baseline gap-2">
              {stats.goldCoins.toLocaleString()}
              <span className="text-sky-500 text-[10px] md:text-xs uppercase tracking-widest font-black opacity-60">Gold</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all active:scale-90 shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden relative z-10">
        {/* 왼쪽: 레시피 목록 */}
        <div className="flex-1 flex flex-col h-auto lg:h-full overflow-hidden min-h-0">
          <div className="bg-zinc-900/60 backdrop-blur-xl p-6 md:p-10 rounded-[3rem] flex flex-col h-full overflow-hidden shadow-2xl border border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-sky-400/20 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-500" />
                <h3 className="text-[14px] md:text-[16px] font-black text-white tracking-widest uppercase opacity-60">
                  Process Recipes
                </h3>
              </div>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10 space-y-4 pt-2">
              {REFINERY_RECIPES.map((recipe: RefineryRecipe) => {
                const inputConfig = MINERALS.find((m: MineralDefinition) => m.key === recipe.inputId);
                const outputConfig = MINERALS.find((m: MineralDefinition) => m.key === recipe.outputId);
                if (!inputConfig || !outputConfig) return null;

                const currentInputCount = stats.inventory[recipe.inputId as any] || 0;
                const hasEnoughMaterials = currentInputCount >= recipe.inputAmount;
                const hasFreeSlot = activeJobs.length < maxSlots;
                const canSmelt = hasEnoughMaterials && hasFreeSlot;

                return (
                  <div key={recipe.id} className="bg-black/30 p-5 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 group transition-all hover:bg-zinc-800/40 hover:border-sky-500/20 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto relative z-10">
                      {/* 원재료 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 md:w-18 md:h-18 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner p-3 group-hover:border-sky-500/30 transition-colors">
                          {inputConfig.image ? <img src={typeof inputConfig.image === 'string' ? inputConfig.image : inputConfig.image.src || inputConfig.image} alt={inputConfig.name} className="w-full h-full object-contain drop-shadow-2xl" /> : <span className="text-2xl">{inputConfig.icon}</span>}
                        </div>
                        <div className="flex flex-col items-center">
                           <div className="text-white font-black text-lg tabular-nums leading-none mb-1">{recipe.inputAmount}</div>
                           <div className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${hasEnoughMaterials ? 'bg-zinc-800/80 text-zinc-500 border-white/5' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                              {currentInputCount.toLocaleString()}
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                         <div className="text-zinc-700 text-xl md:text-2xl font-black mb-1 group-hover:text-sky-400 group-hover:translate-x-1 transition-all">❯</div>
                         <div className="text-[9px] font-black text-sky-500/60 uppercase tracking-widest italic">{recipe.durationMs / 1000}s</div>
                      </div>
                      
                      {/* 결과물 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 md:w-18 md:h-18 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 shadow-lg p-3 group-hover:bg-sky-500/20 transition-colors relative">
                           <div className="absolute inset-0 bg-sky-500/10 animate-pulse rounded-2xl" />
                           {outputConfig.image ? <img src={typeof outputConfig.image === 'string' ? outputConfig.image : outputConfig.image.src || outputConfig.image} alt={outputConfig.name} className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" /> : <span className="text-2xl relative z-10">{outputConfig.icon}</span>}
                        </div>
                        <div className="flex flex-col items-center">
                           <h4 className="text-white font-black text-sm md:text-base tracking-tighter leading-tight uppercase truncate max-w-[100px] text-center">{recipe.name}</h4>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => canSmelt && onStartSmelting(recipe.id)}
                      disabled={!canSmelt}
                      className={`w-full sm:w-32 py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-500/40 relative z-10 ${
                        canSmelt 
                          ? 'bg-linear-to-br from-sky-400 to-sky-600 text-black hover:brightness-110 active:translate-y-1' 
                          : 'bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed grayscale'
                      }`}
                    >
                      Process
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 오른쪽: 진행 중인 용광로 슬롯 */}
        <div className="w-full lg:w-[320px] xl:w-[420px] flex flex-col h-auto lg:h-full shrink-0 min-h-0 mt-4 lg:mt-0">
          <div className="bg-black/30 backdrop-blur-xl p-6 md:p-10 rounded-[3rem] flex flex-col h-full overflow-hidden shadow-inner border border-white/5 relative">
            <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-400/20 to-transparent" />
            <div className="flex justify-between items-center mb-8 px-2">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-[14px] font-black text-white tracking-widest uppercase opacity-60">Status</h3>
               </div>
               <div className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-full shadow-lg">
                  <span className="text-sky-400 font-black tabular-nums tracking-tighter text-sm">{activeJobs.length}</span>
                  <span className="mx-1 text-zinc-700 text-xs">/</span>
                  <span className="text-zinc-500 font-black tabular-nums tracking-tighter text-sm">{maxSlots}</span>
               </div>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10 space-y-4">
              {activeJobs.map((job: SmeltingJob) => {
                const outputConfig = MINERALS.find((m: MineralDefinition) => m.key === job.outputItem);
                const isFinished = now >= job.startTime + job.durationMs;
                const progress = Math.min(100, Math.max(0, ((now - job.startTime) / job.durationMs) * 100));
                
                return (
                  <div key={job.id} className={`p-6 rounded-[2.2rem] border transition-all flex flex-col gap-6 relative overflow-hidden group shadow-xl ${isFinished ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-900/60 border-white/5 hover:border-sky-500/20'}`}>
                    {/* 배경 열기(Heat) 효과 */}
                    {!isFinished && (
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-sky-500/10 to-transparent transition-all duration-1000" style={{ height: `${progress}%` }} />
                    )}
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-colors ${isFinished ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-black/40 border-white/5'}`}>
                           {outputConfig?.image ? (
                             <img 
                               src={typeof outputConfig.image === 'string' ? outputConfig.image : outputConfig.image.src || outputConfig.image} 
                               alt={outputConfig.name} 
                               className={`w-10 h-10 object-contain drop-shadow-xl ${isFinished ? 'animate-bounce' : ''}`} 
                             />
                           ) : (
                             <span className="text-2xl">{outputConfig?.icon || '⚙️'}</span>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 ${isFinished ? 'text-emerald-400' : 'text-sky-500'}`}>
                            {isFinished ? (
                              <>
                                <div className="w-1 h-1 rounded-full bg-current" />
                                Ready to Collect
                              </>
                            ) : (
                              <>
                                <div className="w-1 h-1 rounded-full bg-current animate-ping" />
                                Purifying...
                              </>
                            )}
                          </span>
                          <h4 className="text-white font-black text-lg tracking-tight uppercase">
                            {outputConfig?.name || 'Unknown'} <span className="text-zinc-500">x{job.amount}</span>
                          </h4>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-end">
                         <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Process Flow</div>
                         {!isFinished && (
                           <div className="text-sky-400 font-black text-xl tabular-nums tracking-tighter">
                             {Math.ceil((job.startTime + job.durationMs - now) / 1000)}s
                           </div>
                         )}
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                        <div 
                          className={`h-full transition-all duration-100 ease-linear ${isFinished ? 'bg-linear-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-linear-to-r from-sky-400 to-sky-600 shadow-[0_0_15px_rgba(56,189,248,0.5)]'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {isFinished && (
                      <button
                        onClick={() => onCollectSmelting(job.id)}
                        className="w-full py-4 bg-linear-to-br from-emerald-400 to-emerald-600 text-black font-black text-sm tracking-[0.2em] uppercase rounded-2xl shadow-[0_12px_24px_rgba(16,185,129,0.3)] active:scale-95 transition-all hover:brightness-110 active:translate-y-1 relative z-10"
                      >
                        Collect
                      </button>
                    )}
                  </div>
                );
              })}

              {/* 비어있는 슬롯 렌더링 - 프리미엄 대기 상태 */}
              {Array.from({ length: maxSlots - activeJobs.length }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-zinc-900/20 p-8 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center min-h-[140px] group transition-colors hover:border-sky-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 flex items-center justify-center text-2xl text-zinc-800 group-hover:text-sky-400/20 transition-colors mb-3 border border-white/5 shadow-inner">
                     ♨️
                  </div>
                  <div className="text-zinc-700 font-black tracking-widest text-[10px] uppercase opacity-40">Ready for Input</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(RefineryWindow, (prev, next) => {
  return prev.stats === next.stats;
});
