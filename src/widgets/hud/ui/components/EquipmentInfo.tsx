import React from 'react';
import { Equipment } from '@/shared/types/game';

interface EquipmentInfoProps {
  pos: { x: number; y: number };
}

/**
 * 플레이어의 현재 좌표 정보(X, Y)를 표시합니다.
 */
export const EquipmentInfo: React.FC<EquipmentInfoProps> = React.memo(
  ({ pos }) => {
    return (
      <div className="hidden md:flex flex-col bg-zinc-950/40 backdrop-blur-xl border border-white/5 p-3 px-5 rounded-2xl items-center gap-2 shadow-2xl z-10 opacity-80 hover:opacity-100 transition-all hover:bg-zinc-900/60 ring-1 ring-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-[10px] font-black text-zinc-500 tracking-widest">Navigation Unit</span>
        </div>
        
        <div className="font-mono text-[14px] lg:text-[16px] font-black tracking-[0.2em] text-white">
          <span className="text-white/40">X</span> <span className="text-amber-400">{Math.floor(pos.x).toString().padStart(3, '0')}</span> 
          <span className="mx-3 text-white/10">|</span>
          <span className="text-white/40">Y</span> <span className="text-amber-400">{Math.floor(pos.y).toString().padStart(3, '0')}</span>
        </div>
      </div>
    );
  },
);
