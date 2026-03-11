import GameEngine from '@/src/app/game/GameEngine';

export default function Home() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none">
      <GameEngine />
    </main>
  );
}
