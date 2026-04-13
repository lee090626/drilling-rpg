import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { getCircleConfig } from '@/shared/config/circleData';

/**
 * 보스 처치 성공 시의 로직을 수행합니다 (유물 획득, 포탈 생성 등).
 */
export const handleBossDefeat = (world: GameWorld, x: number, y: number) => {
  const { player, tileMap } = world;
  const config = getCircleConfig(player.stats.depth);
  const circleId = config.id;

  // 유물 획득
  const artifactId = `circle_${circleId}_core`;
  if (!player.stats.artifacts.includes(artifactId)) {
    player.stats.artifacts.push(artifactId);

    if (!player.stats.equippedArtifactId) {
      player.stats.equippedArtifactId = artifactId;
    }

    createFloatingText(world, x, y - 40, `Artifact Unlocked: Circle ${circleId} Core`, '#a855f7');
  }

  // 보스 전용 유니크 룬 지급
  if (!player.stats.inventoryRunes) {
    player.stats.inventoryRunes = [];
  }
  player.stats.inventoryRunes.push({
    id: `rune_${Date.now()}_unique`,
    runeId: 'lucky_charm_rune',
    rarity: 'Unique',
  });
  createFloatingText(world, x, y - 60, 'Unique Skill Rune Acquired!', '#22d3ee');

  // [심리스 개편] 포탈 생성을 생략하고 보상 지급 및 연출에 집중합니다.
  createFloatingText(world, x, y - 20, `Circle ${circleId} Boss Defeated!`, '#a855f7');
};
