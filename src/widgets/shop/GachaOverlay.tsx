import React from 'react';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { RARITY_COLORS } from './useGachaAnimation';

interface GachaOverlayProps {
  gachaState: 'idle' | 'drawing' | 'result';
  startRouletteAnim: boolean;
  rouletteItems: { runeId: string; rarity: string }[];
  gachaResults: { runeId: string; rarity: string }[];
  isMultiDraw: boolean;
  onReset: () => void;
}

export function GachaOverlay({
  gachaState,
  startRouletteAnim,
  rouletteItems,
  gachaResults,
  isMultiDraw,
  onReset,
}: GachaOverlayProps) {
  if (gachaState === 'idle') return null;

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-500"
      onClick={() => {
        if (gachaState === 'result') {
          onReset();
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
  );
}

export default React.memo(GachaOverlay);
