import React from 'react';
import { PlayerStats } from '../../shared/types/game';

interface HudProps {
  stats: PlayerStats;
  onOpenEncyclopedia?: () => void;
}

const Hud: React.FC<HudProps> = ({ stats, onOpenEncyclopedia }) => {
  const hpPercent = Math.max(0, (stats.hp / stats.maxHp) * 100);

  return (
    <div className="absolute top-0 left-0 w-full p-5 pointer-events-none select-none flex justify-between items-start">
      {/* Left Side: HP & Depth */}
      <div className="flex flex-col gap-4">
        {/* HP Bar */}
        <div className="w-64">
           <div className="flex justify-between items-end mb-1">
             <span className="text-slate-400 font-black text-xs uppercase tracking-widest">HP</span>
             <span className="text-white font-mono text-sm font-bold">
               {Math.floor(stats.hp)} / {stats.maxHp}
             </span>
           </div>
           <div className="h-4 bg-black/50 backdrop-blur-md rounded-full overflow-hidden border border-white/10">
             <div 
               className={`h-full transition-all duration-300 ease-out ${
                 hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-orange-500' : 'bg-rose-500'
               }`}
               style={{ width: `${hpPercent}%` }}
             />
           </div>
        </div>

        {/* Depth Meter */}
        <div className="flex flex-col">
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Depth</span>
          <div className="text-white text-4xl font-black font-mono tracking-tighter drop-shadow-lg">
            {stats.depth}m
          </div>
        </div>
      </div>

      {/* Right Side: Dimension & FPS */}
      <div className="flex flex-col items-end gap-1 opacity-50">
        <span className="text-yellow-500 font-black text-xs uppercase tracking-widest font-mono">
          Dimension {stats.dimension}
        </span>
        <span className="text-white font-black text-xs font-mono uppercase tracking-widest">
          60 FPS
        </span>
        
        <button 
          onClick={onOpenEncyclopedia}
          className="mt-4 pointer-events-auto bg-[#a855f7]/20 hover:bg-[#a855f7]/40 border border-[#a855f7]/50 text-[#a855f7] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-900/20"
        >
          📖 Encyclopedia
        </button>
      </div>
    </div>
  );
};

export default Hud;
