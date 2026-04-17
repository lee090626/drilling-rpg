import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { getTileColor } from '@/shared/lib/tileUtils';
import {
  getNextLevelExp,
  createInitialMasteryState,
} from '@/shared/lib/masteryUtils';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { showToast } from '../toastSystem';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';

/**
 * 타일 파괴 시 보상(아이템 드롭) 및 숙련도 성장을 처리합니다.
 */
export const masteryService = (
  world: GameWorld,
  x: number,
  y: number,
  type: string,
  luck: number,
  masteryExpGain: number
) => {
  const { player } = world;

  // 1. 파괴 시 대량 파편 효과
  createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(type as any), 8);

  // 2. 아이템 드롭 처리
  if (player.stats.inventory[type as any] !== undefined && type !== 'stone') {
    // 드롭 개수 계산 (Luck 기반 전용 공식)
    const currentLuck = Math.max(1, luck);
    let dropCount = 1;
    if (currentLuck >= 200) {
      dropCount = 2 + Math.floor(Math.log(currentLuck / 200) / Math.log(4));
    }

    for (let i = 0; i < dropCount; i++) {
      const vx = (Math.random() - 0.5) * 8;
      const vy = -Math.random() * 6 - 2;
      world.droppedItemPool.spawn(
        type as any,
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE - 5,
        vx,
        vy,
      );
    }
    
    // 신규 광물 발견 처리
    if (!player.stats.discoveredMinerals.includes(type)) {
      player.stats.discoveredMinerals.push(type);
    }

    // 3. 숙련도(Mastery) 성장 처리
    if (!player.stats.tileMastery) player.stats.tileMastery = {};
    let tileMastery = player.stats.tileMastery[type];
    if (!tileMastery) {
      tileMastery = createInitialMasteryState(type);
      player.stats.tileMastery[type] = tileMastery;
    }

    tileMastery.exp += masteryExpGain;

    // 레벨업 체크
    const nextExp = getNextLevelExp(tileMastery.level);
    if (tileMastery.exp >= nextExp) {
      tileMastery.level++;
      tileMastery.exp -= nextExp;
      showToast(`${type.toUpperCase()} Mastery Level Up: ${tileMastery.level}!!`, 'success');

      // 마스터리 돌파 특성(Perks) 해금 체크
      processMasteryPerks(world, type, tileMastery.level);
    }
  }
};

/**
 * 특정 레벨 도달 시 특성 해금을 처리하는 내부 함수
 */
function processMasteryPerks(world: GameWorld, type: string, currentLevel: number) {
  const { player } = world;
  
  MASTERY_PERKS.forEach((perk) => {
    if (perk.tileType === type && perk.requiredLevel === currentLevel) {
      if (!player.stats.unlockedMasteryPerks.includes(perk.id)) {
        player.stats.unlockedMasteryPerks.push(perk.id);
        showToast(`✨ Breakthrough! [${perk.name}] unlocked!`, 'success');
        
        createFloatingText(
          world,
          player.pos.x * TILE_SIZE,
          player.pos.y * TILE_SIZE - 40,
          `✨ ${perk.name} UNLOCKED!`,
          '#fbbf24',
        );
      }
    }
  });
}
