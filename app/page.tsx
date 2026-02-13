import GameEngine from './components/GameEngine';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <GameEngine />
    </main>
  );
}
