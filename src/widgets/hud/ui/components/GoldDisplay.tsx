import React from 'react';
import { AtlasIcon } from '../AtlasIcon';

interface GoldDisplayProps {
  gold: number;
}

/**
 * 플레이어의 보유 골드를 표시하는 컴포넌트입니다.
 */
export const GoldDisplay: React.FC<GoldDisplayProps> = React.memo(({ gold }) => {
  return (
    <div className="flex flex-col items-end gap-2 md:gap-3">
      <div className="flex items-center gap-1.5 md:gap-3 bg-zinc-900/80 backdrop-blur-md border border-yellow-500/20 px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg">
        <div className="flex items-center justify-center rounded-full bg-transparent w-4 h-4 md:w-6 md:h-7 relative">
          <AtlasIcon name="GoldIcon" alt="Gold" size={24} />
        </div>
        <span className="text-yellow-400 font-mono text-sm md:text-xl lg:text-2xl font-black tracking-tight">
          {gold.toLocaleString()}
        </span>
      </div>
    </div>
  );
});
