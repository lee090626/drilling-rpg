import { GameWorld } from '@/entities/world/model';

/**
 * UI 레이어로 정기적인 상태 동기화 패킷을 방출합니다.
 */
export function syncUiSystem(world: GameWorld, lastUiSyncTime: number, now: number, uiSyncInterval: number): number {
  if (now - lastUiSyncTime > uiSyncInterval) {
    self.postMessage({
      type: 'SYNC_UI',
      payload: {
        stats: world.player.stats,
        ui: world.ui,
        boss: world.bossCombatStatus,
        // Optimization Monitoring
        metrics: {
          blockedDrops: world.droppedItemPool.blockedDropCount,
        },
      },
    });
    return now;
  }
  return lastUiSyncTime;
}
