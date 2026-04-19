import { GameWorld } from '@/entities/world/model';

/**
 * 주기적으로 게임 상태를 직렬화하여 메인 스레드에 자동 저장 패킷을 방출합니다.
 */
export function autoSaveSystem(world: GameWorld, lastSaveTime: number, now: number): number {
  if (now - lastSaveTime > 10000) {
    const tileMapBuffer = world.tileMap.serializeToBuffer();

    // Use (self as any) to bypass TypeScript WorkerGlobalScope inference issues
    (self as any).postMessage(
      {
        type: 'SAVE',
        payload: {
          version: 1,
          timestamp: Date.now(),
          stats: world.player.stats,
          position: world.player.pos,
          tileMapBuffer: tileMapBuffer,
        },
      },
      [tileMapBuffer.buffer]
    );
    return now;
  }
  return lastSaveTime;
}
