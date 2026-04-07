import GameEngine from '@/src/app/game/GameEngine';

export const dynamic = 'force-static';

/**
 * 게임의 메인 플레이 페이지 엔트리 포인트입니다.
 * GameEngine 컴포넌트를 렌더링하며 화면 전체를 고정 레이아웃으로 설정합니다.
 */
export default function Play() {
  return (
    <main className="fixed inset-0 bg-zinc-950 overflow-hidden select-none">
      {/* 
          High-Visibility SEO Layer for AdSense & Crawlers:
          자바스크립트가 실행되기 전, 서버에서 바로 내려주는 텍스트들입니다.
          애드센스 봇이 "내용 없음"으로 판단하는 것을 방지합니다.
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-12 z-0 opacity-0 pointer-events-none">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic">
            Drilling RPG
          </h1>
          <h2 className="text-xl md:text-3xl font-bold text-cyan-500 max-w-3xl mx-auto uppercase tracking-widest">
            Deep Abyss Exploration
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl text-white font-medium uppercase tracking-widest text-[10px]">
          <div className="space-y-2">
            <h3 className="font-black text-zinc-500">Resource Extraction</h3>
            <p className="leading-relaxed">Diamonds, Rubies, Uranium</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-zinc-500">Combat Systems</h3>
            <p className="leading-relaxed">Dimensional Boss Encounters</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-zinc-500">Tech Upgrades</h3>
            <p className="leading-relaxed">Advanced AI Drone Tech</p>
          </div>
        </div>
      </div>

      {/* Actual Game Engine (Canvas will cover the text above) */}
      <div className="relative z-60 w-full h-full bg-transparent">
        <GameEngine />
      </div>
    </main>
  );
}
