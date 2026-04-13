import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import { GameWorld } from '@/entities/world/model';

/**
 * 부활, 체크포인트 이동, 유물 합성 등 월드 관련 액션을 처리합니다.
 */
export const handleWorldAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;

  switch (action) {
    case 'respawn': {
      stats.hp = stats.maxHp;
      world.player.pos = { x: 15, y: 8 };
      world.player.visualPos = { x: 15, y: 8 };
      console.log('[Worker] Player respawned at Base Camp.');
      break;
    }

    case 'selectCheckpoint': {
      world.player.pos.y = data.depth + 10;
      world.player.visualPos.y = data.depth + 10;
      stats.depth = data.depth;
      break;
    }

    case 'synthesizeRelic': {
      const artifact = ARTIFACT_DATA[data.relicId];
      if (artifact && artifact.requirements) {
        if (stats.unlockedResearchIds.includes(data.relicId)) break;

        const hasEnough = Object.entries(artifact.requirements).every(([res, amt]) => {
          const owned = res === 'goldCoins' ? stats.goldCoins : stats.inventory[res as any] || 0;
          return owned >= (amt as number);
        });

        if (!hasEnough) break;

        Object.entries(artifact.requirements).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else (stats.inventory[res as any] as number) -= amt as number;
        });

        stats.unlockedResearchIds.push(data.relicId);
      }
      break;
    }

    case 'useArtifact': {
      world.intent.action = 'artifact';
      break;
    }

    case 'equip':
      if (data.type === 'drill') stats.equipment.drillId = data.id;
      else if (data.type === 'artifact') stats.equippedArtifactId = data.id;
      break;
  }
};
