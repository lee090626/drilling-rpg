import React from 'react';

interface WorldInfoProps {
  layerName: string;
  circleName: string;
}

/**
 * 현재 월드 정보(서클명, 구역명)를 표시하는 컴포넌트입니다.
 */
export const WorldInfo: React.FC<WorldInfoProps> = React.memo(({ layerName, circleName }) => {
  return (
    <div className="hidden md:flex flex-col items-end gap-1 opacity-80">
      <span className="text-emerald-400 font-mono text-sm md:text-xl lg:text-3xl font-black tracking-widest uppercase">
        {layerName} {circleName}
      </span>
    </div>
  );
});
