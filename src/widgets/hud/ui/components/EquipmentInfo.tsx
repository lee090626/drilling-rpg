import React from 'react';
import { Equipment } from '@/shared/types/game';

interface SlotProps {
  label: string;
  item: Equipment | null;
}

const EquipmentSlot: React.FC<SlotProps> = ({ label, item }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-800/80 rounded-lg flex items-center justify-center border border-white/10 relative group overflow-hidden shadow-inner">
      {item ? (
        <span className="text-xl md:text-2xl drop-shadow-md group-hover:scale-110 transition-transform cursor-help" title={item.name}>
          {item.icon}
        </span>
      ) : (
        <div className="w-4 h-4 md:w-5 md:h-5 bg-white/5 rounded-full border border-white/5" />
      )}
      {/* 슬롯 레이블 (D, H, A, B) */}
      <div className="absolute top-0 right-0 px-1 text-[8px] font-bold text-white/30 uppercase">
        {label[0]}
      </div>
    </div>
  </div>
);

interface EquipmentInfoProps {
  drill: Equipment | null;
  helmet: Equipment | null;
  armor: Equipment | null;
  boots: Equipment | null;
  pos: { x: number; y: number };
}

/**
 * 현재 장착된 4부위 장비(드릴, 투구, 갑옷, 신발)와 좌표 정보를 표시합니다.
 */
export const EquipmentInfo: React.FC<EquipmentInfoProps> = React.memo(
  ({ drill, helmet, armor, boots, pos }) => {
    return (
      <div className="hidden md:flex flex-col bg-zinc-950/40 backdrop-blur-xl border border-white/5 p-3 rounded-2xl items-center gap-3 shadow-2xl z-10 opacity-80 hover:opacity-100 transition-all hover:bg-zinc-900/60 ring-1 ring-white/10">
        <div className="grid grid-cols-2 gap-2">
          <EquipmentSlot label="Drill" item={drill} />
          <EquipmentSlot label="Helmet" item={helmet} />
          <EquipmentSlot label="Armor" item={armor} />
          <EquipmentSlot label="Boots" item={boots} />
        </div>
        
        <div className="w-full h-px bg-white/5" />

        <div className="flex flex-col items-center">
          <div className="font-mono text-[12px] lg:text-[14px] font-black tracking-widest text-white/60">
            X <span className="text-amber-400">{Math.floor(pos.x).toString().padStart(3, '0')}</span> 
            <span className="mx-1 text-white/20">|</span>
            Y <span className="text-amber-400">{Math.floor(pos.y).toString().padStart(3, '0')}</span>
          </div>
        </div>
      </div>
    );
  },
);
