import React, { useState, useEffect } from 'react';
import { PlayerStats, SmeltingJob } from '../../shared/types/game';
import { REFINERY_RECIPES, RefineryRecipe } from '../../shared/config/refineryData';
import { MINERALS, MineralDefinition } from '../../shared/config/mineralData';
import { getDroneData } from '../../shared/config/droneData';

interface RefineryWindowProps {
  stats: PlayerStats;
  onClose: () => void;
  onStartSmelting: (recipeId: string) => void;
  onCollectSmelting: (jobId: string) => void;
}

export default function RefineryWindow({ stats, onClose, onStartSmelting, onCollectSmelting }: RefineryWindowProps) {
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
    <div className="flex flex-col w-full h-full bg-zinc-950 rounded-2xl md:rounded-[40px] border border-zinc-900 shadow-2xl font-sans overflow-hidden animate-in fade-in zoom-in duration-300">
      
      {/* 헤더 바 */}
      <div className="flex-none p-4 md:p-8 pb-4 md:pb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900 bg-zinc-950/50 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 w-full md:w-auto">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter mix-blend-screen">REFINERY</h2>
            <p className="text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs mt-1 md:mt-2 uppercase">Smelt raw minerals into materials</p>
          </div>
          
          {/* 드론 보너스 표시 */}
          {equippedDrone && (equippedDrone.smeltSpeedMult || equippedDrone.smeltSlotBonus) && (
            <div className="flex items-center gap-3 md:gap-4 bg-amber-400/10 border border-amber-400/20 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-lg w-full sm:w-auto">
              <div className="text-xl md:text-2xl">{equippedDrone.icon}</div>
              <div className="flex flex-col">
                <span className="text-amber-400 text-[8px] md:text-[10px] font-black tracking-widest uppercase">Drone Active</span>
                <div className="flex gap-3 md:gap-4">
                   {equippedDrone.smeltSpeedMult && (
                     <span className="text-white font-black text-xs md:text-sm">+{Math.round((1 - equippedDrone.smeltSpeedMult) * 100)}% Speed</span>
                   )}
                   {equippedDrone.smeltSlotBonus && (
                     <span className="text-white font-black text-xs md:text-sm">+{equippedDrone.smeltSlotBonus} Slots</span>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:relative md:top-0 md:right-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors shadow-inner font-black cursor-pointer z-50 text-lg md:text-xl"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 왼쪽: 레시피 목록 */}
        <div className="flex-1 h-auto lg:h-full overflow-y-auto p-4 md:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-zinc-900 custom-scrollbar min-h-0">
          <h3 className="text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs mb-4 md:mb-6 uppercase">Available Recipes</h3>
          
          <div className="space-y-3 md:space-y-4">
            {REFINERY_RECIPES.map((recipe: RefineryRecipe) => {
              const inputConfig = MINERALS.find((m: MineralDefinition) => m.key === recipe.inputId);
              const outputConfig = MINERALS.find((m: MineralDefinition) => m.key === recipe.outputId);
              if (!inputConfig || !outputConfig) return null;

              const hasEnoughMaterials = (stats.inventory[recipe.inputId as any] || 0) >= recipe.inputAmount;
              const hasFreeSlot = activeJobs.length < maxSlots;
              const canSmelt = hasEnoughMaterials && hasFreeSlot;

              return (
                <div key={recipe.id} className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-6 w-full sm:w-auto">
                    {/* 재료 */}
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-950 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-zinc-900 overflow-hidden">
                        {inputConfig.image ? <img src={typeof inputConfig.image === 'string' ? inputConfig.image : inputConfig.image.src || inputConfig.image} alt={inputConfig.name} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg" /> : inputConfig.icon}
                      </div>
                      <div className="text-center min-w-[40px]">
                        <div className="text-white font-black text-lg md:text-xl">{recipe.inputAmount}</div>
                        <div className={`text-[8px] md:text-[10px] font-bold tracking-widest uppercase ${hasEnoughMaterials ? 'text-zinc-500' : 'text-red-500'}`}>
                          {stats.inventory[recipe.inputId as any] || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-zinc-600 text-xl md:text-2xl font-black">➔</div>
                    
                    {/* 결과물 */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-950 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-zinc-900 overflow-hidden">
                        {outputConfig.image ? <img src={typeof outputConfig.image === 'string' ? outputConfig.image : outputConfig.image.src || outputConfig.image} alt={outputConfig.name} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg" /> : outputConfig.icon}
                      </div>
                      <div>
                        <div className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-[#eab308] mix-blend-screen mb-0.5 md:mb-1">
                          {recipe.durationMs / 1000}S
                        </div>
                        <h4 className="text-white font-black text-base md:text-lg tracking-tight leading-tight">{recipe.name}</h4>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => canSmelt && onStartSmelting(recipe.id)}
                    disabled={!canSmelt}
                    className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-[11px] tracking-widest uppercase transition-all shadow-xl ${
                      canSmelt 
                        ? 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95' 
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800/50'
                    }`}
                  >
                    SMELT
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 진행 중인 용광로 슬롯 */}
        <div className="flex-1 h-auto lg:h-full overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar bg-zinc-950/30 min-h-0">
          <div className="flex justify-between items-end mb-4 md:mb-6">
             <h3 className="text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs uppercase">Active Furances</h3>
             <div className="text-zinc-600 font-black text-[10px] md:text-xs tracking-widest uppercase">
               SLOTS {activeJobs.length} / {maxSlots}
             </div>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {/* 진행 중인 직업 렌더링 */}
            {activeJobs.map((job: SmeltingJob) => {
              const outputConfig = MINERALS.find((m: MineralDefinition) => m.key === job.outputItem);
              const isFinished = now >= job.startTime + job.durationMs;
              const progress = Math.min(100, Math.max(0, ((now - job.startTime) / job.durationMs) * 100));
              
              return (
                <div key={job.id} className="bg-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-zinc-800 flex flex-col gap-3 md:gap-4 relative overflow-hidden group">
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-950 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-inner border border-zinc-900 overflow-hidden">
                         {outputConfig?.image ? <img src={typeof outputConfig.image === 'string' ? outputConfig.image : outputConfig.image.src || outputConfig.image} alt={outputConfig.name} className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-md" /> : (outputConfig?.icon || '⚙️')}
                      </div>
                      <div>
                        <div className="text-xs md:text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-0.5 md:mb-1">
                          {isFinished ? 'COMPLETED' : 'SMELTING'}
                        </div>
                        <h4 className="text-white font-black text-base md:text-lg tracking-tight">
                          {outputConfig?.name || 'Unknown'} x{job.amount}
                        </h4>
                      </div>
                    </div>
                    
                    {isFinished ? (
                      <button
                        onClick={() => onCollectSmelting(job.id)}
                        className="px-4 py-2.5 md:px-6 md:py-3 bg-[#eab308] text-yellow-950 hover:bg-yellow-400 font-black text-[9px] md:text-[10px] tracking-widest uppercase rounded-lg md:rounded-xl shadow-xl active:scale-95 transition-all"
                      >
                        COLLECT
                      </button>
                    ) : (
                      <div className="text-right">
                        <div className="text-zinc-400 font-black text-base md:text-lg tabular-nums">
                          {Math.ceil((job.startTime + job.durationMs - now) / 1000)}s
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 프로그레스 바 */}
                  <div className="h-1.5 md:h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 z-10">
                    <div 
                      className={`h-full transition-all duration-100 ease-linear ${isFinished ? 'bg-[#eab308]' : 'bg-red-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* 진행 중 배경 애니메이션 */}
                  {!isFinished && (
                    <div 
                      className="absolute inset-0 bg-red-500/5 animate-pulse" 
                      style={{ width: `${progress}%` }} 
                    />
                  )}
                </div>
              );
            })}

            {/* 비어있는 슬롯 렌더링 */}
            {Array.from({ length: maxSlots - activeJobs.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-zinc-950 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-zinc-900/50 flex flex-col items-center justify-center min-h-[100px] md:min-h-[140px] opacity-40">
                <div className="text-zinc-800 text-3xl md:text-4xl mb-1 md:mb-2">♨️</div>
                <div className="text-zinc-600 font-black tracking-widest text-[8px] md:text-[10px] uppercase">IDLE FURNACE</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
