import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';
import { createFloatingText, createParticles } from '../../shared/lib/effectUtils';

/**
 * 보스 처치 성공 시의 로직을 수행합니다 (유물 획득, 포탈 생성 등).
 */
export const handleBossDefeat = (world: GameWorld, x: number, y: number) => {
  const { player, tileMap } = world;
  const artifactName = `${world.player.stats.dimension} Dimension Core`;
  
  // 유물 최초 획득 시 보너스 스탯 부여
  if (!player.stats.artifacts.includes(artifactName)) {
    player.stats.artifacts.push(artifactName);
    player.stats.attackPower += (world.player.stats.dimension + 1) * 10;
    player.stats.maxHp += (world.player.stats.dimension + 1) * 30;
    player.stats.hp = player.stats.maxHp; // 체력 완전 회복
    createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 40, `Artifact Acquired: ${artifactName}`, '#a855f7');
  }

  // 보스 전용 유니크 룬 지급
  if (!player.stats.inventoryRunes) {
    player.stats.inventoryRunes = [];
  }
  player.stats.inventoryRunes.push({
    id: `rune_${Date.now()}_unique`,
    runeId: 'lucky_charm_rune',
    rarity: 'Unique'
  });
  createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 60, 'Unique Skill Rune Acquired!', '#22d3ee');

  // 보스 시체(코어 및 외피) 제거 및 포탈 생성을 위한 범위 탐색
  const bossHeights = [200, 300, 400, 500, 700, 1000];
  const targetHeight = bossHeights[Math.min(tileMap.dimension, bossHeights.length - 1)];
  const bossCenterY = targetHeight - 1;
  const bossCenterX = 15;

  for (let by = bossCenterY - 2; by <= bossCenterY + 2; by++) {
    for (let bx = bossCenterX - 2; bx <= bossCenterX + 2; bx++) {
      const tile = tileMap.getTile(bx, by);
      if (tile && (tile.type === 'boss_core' || tile.type === 'boss_skin')) {
        tile.type = 'empty';
        tile.health = 0;
        createParticles(world, bx * TILE_SIZE, by * TILE_SIZE, '#10b981', 8);
      }
    }
  }

  // 다음 차원으로 이동 가능한 포탈 생성
  const centerTile = tileMap.getTile(bossCenterX, bossCenterY);
  if (centerTile) {
    centerTile.type = 'portal';
    centerTile.health = Infinity;
    centerTile.maxHealth = Infinity;
    createFloatingText(world, bossCenterX * TILE_SIZE, bossCenterY * TILE_SIZE - 20, 'Dimensional Portal Opened!', '#a855f7');
  }
};
