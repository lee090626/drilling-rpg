import GameEngine from '@/src/app/game/GameEngine';

/**
 * 게임의 메인 페이지 엔트리 포인트입니다.
 * GameEngine 컴포넌트를 렌더링하며 화면 전체를 고정 레이아웃으로 설정합니다.
 */
export default function Home() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none">
      <GameEngine />
    </main>
  );
}
