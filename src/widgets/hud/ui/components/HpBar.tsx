import React from 'react';

interface HpBarProps {
  hp: number;
  maxHp: number;
}

/**
 * 플레이어의 현재 체력을 시각적으로 표시하는 바 컴포넌트입니다.
 */
export const HpBar: React.FC<HpBarProps> = React.memo(({ hp, maxHp }) => {
  const hpPercent = Math.max(0, (hp / maxHp) * 100);

  return (
    <div className="flex flex-col gap-1 md:gap-2 w-32 md:w-48 lg:w-72 mt-1">
      <div className="relative h-4 md:h-6 lg:h-8 bg-black/60 backdrop-blur-xl rounded-full p-px md:p-[2px] border shadow-inner overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)] ${
            hpPercent > 50 ? 'bg-linear-to-r from-emerald-600 to-emerald-400' : 
            hpPercent > 20 ? 'bg-linear-to-r from-orange-500 to-orange-300' : 
            'bg-linear-to-r from-rose-600 to-rose-400 animate-pulse'
          }`}
          style={{ width: `${hpPercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-mono text-[8px] md:text-xs lg:text-sm font-bold tracking-wider">
            {Math.floor(hp)} <span className="text-white text-[8px] md:text-xs lg:text-sm hidden sm:inline">/ {maxHp}</span>
          </span>
        </div>
      </div>
    </div>
  );
});
