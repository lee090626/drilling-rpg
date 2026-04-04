import GameEngine from '@/src/app/game/GameEngine';

export const dynamic = 'force-static';

/**
 * 게임의 메인 플레이 페이지 엔트리 포인트입니다.
 * GameEngine 컴포넌트를 렌더링하며 화면 전체를 고정 레이아웃으로 설정합니다.
 */
export default function Play() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* 
          Background Content for SEO & AdSense: 
          This is behind the canvas, so it's invisible to the player once the game loads,
          but visible to search engine crawlers and AdSense preview bots.
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-4">
        <h1 className="text-3xl font-bold text-zinc-400">Drilling RPG - Game in Progress</h1>
        <p className="text-zinc-600 max-w-lg">
          You are currently in the deep abyss exploration zone. 
          The mining engine is initializing your drill, loading neural network drones, 
          and preparing the mineral-rich world for extraction. 
        </p>
        <div className="text-xs text-zinc-800">
          Keywords: Mining Action RPG, Resource Management, Boss Battles, Upgradeable Drills.
        </div>
      </div>

      {/* Actual Game Engine */}
      <div className="relative z-10 w-full h-full">
        <GameEngine />
      </div>
    </main>
  );
}
