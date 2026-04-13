import React from 'react';
import { useGameStore } from '@/shared/lib/store';

/**
 * 보스 전투 시 화면 상단에 표시되는 전역 보스 체력 바 컴포넌트입니다.
 * Zustand 스토어의 boss 상태를 구독하여 실시간으로 업데이트됩니다.
 */
const BossHealthBar: React.FC = () => {
  const boss = useGameStore((state) => state.boss);

  if (!boss || !boss.active) return null;

  const hpPercent = Math.max(0, (boss.hp / boss.maxHp) * 100);
  
  // 페이즈별 색상 테마 정의
  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'from-amber-500 to-orange-600';
      case 2: return 'from-orange-600 to-red-600';
      case 3: return 'from-red-600 to-rose-700';
      default: return 'from-orange-500 to-red-600';
    }
  };

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-in slide-in-from-top-10 duration-700 pointer-events-none">
      {/* 보스 이름 및 정보 */}
      <div className="flex justify-between items-end mb-1.5 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs font-black text-rose-500 tracking-[0.2em] uppercase opacity-80">
            Abyssal Lord - Circle {boss.id?.split('_')[0].replace('c', '')}
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            {boss.name}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] md:text-xs font-mono font-bold text-white/50 uppercase">
            Phase {boss.phase}
          </span>
          <span className="text-lg md:text-2xl font-mono font-black text-white tracking-tighter">
            {Math.ceil(hpPercent)}%
          </span>
        </div>
      </div>

      {/* 체력 바 메인 컨테이너 */}
      <div className="relative h-4 md:h-6 bg-black/60 backdrop-blur-xl rounded-full p-[2px] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* 배경 그리드 장식 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {/* 페이즈 구분선 표시 */}
        <div className="absolute inset-0 flex pointer-events-none">
            <div className="w-[30%] h-full border-r border-white/20" />
            <div className="w-[30%] h-full border-r border-white/20" />
        </div>

        {/* 실제 체력 바 (애니메이션 적용) */}
        <div 
          className={`h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(225,29,72,0.4)] bg-linear-to-r ${getPhaseColor(boss.phase)} relative`}
          style={{ width: `${hpPercent}%` }}
        >
          {/* 하이라이트 효과 */}
          <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent opacity-50" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40" />
        </div>
      </div>

      {/* 하단 장식 (데코레이션 브라켓) */}
      <div className="mt-1 flex justify-between px-1 opacity-40">
        <div className="w-10 h-1 border-l border-b border-white" />
        <div className="w-10 h-1 border-r border-b border-white" />
      </div>
    </div>
  );
};

export default BossHealthBar;
