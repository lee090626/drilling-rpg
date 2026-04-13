import React from 'react';
import { AtlasIcon } from '../AtlasIcon';

interface EquipmentInfoProps {
  drillName: string;
  drillImage?: string;
  pos: { x: number; y: number };
}

/**
 * 현재 장착된 드릴 장비와 플레이어의 좌표 정보를 표시하는 컴포넌트입니다.
 */
export const EquipmentInfo: React.FC<EquipmentInfoProps> = React.memo(({ drillName, drillImage, pos }) => {
  return (
    <div className="hidden md:flex bg-zinc-900/60 backdrop-blur-md border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl items-center gap-3 md:gap-4 shadow-xl z-10 opacity-70 hover:opacity-100 transition-opacity">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-800 rounded-lg md:rounded-xl flex items-center justify-center border border-white/10 relative">
        {drillImage ? (
          <AtlasIcon name={drillImage as any} alt="Drill" size={40} className="object-contain p-1" />
        ) : (
          <div className="w-5 h-5 md:w-6 md:h-6 bg-white/10 rounded-full" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-xs md:text-base lg:text-lg leading-tight">{drillName}</span>
        <div className="font-mono text-[10px] md:text-sm lg:text-[18px] font-bold text-white/50">
          X: {Math.floor(pos.x)} Y: {Math.floor(pos.y)}
        </div>
      </div>
    </div>
  );
});
