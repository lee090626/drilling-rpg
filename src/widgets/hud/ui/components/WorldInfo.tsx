import React from 'react';

interface WorldInfoProps {
  layerName: string;
  depth: number;
  onOpenElevator?: () => void;
}

/**
 * 현재 월드 정보(서클명, 구역명)를 표시하는 컴포넌트입니다.
 */
export const WorldInfo: React.FC<WorldInfoProps> = React.memo(({ layerName, depth, onOpenElevator }) => {
  return (
    <div className="hidden md:flex flex-col items-end gap-1 opacity-80 hover:opacity-100 transition-opacity pointer-events-auto">
      <span className="text-emerald-400 font-mono text-sm md:text-xl lg:text-4xl font-black tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
        {layerName}
      </span>
      {onOpenElevator && (
        <button 
          onClick={onOpenElevator}
          className="text-[10px] text-zinc-500 hover:text-white transition-colors font-black tracking-widest"
        >
          [ Open Elevator ]
        </button>
      )}
    </div>
  );
});
