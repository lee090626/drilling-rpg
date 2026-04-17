import { GameWorld } from '@/entities/world/model';
import { MOVEMENT_DELAY_MS } from '@/shared/config/constants';
import { createFloatingText } from '@/shared/lib/effectUtils';

/**
 * 상태 이상(Effect) 및 버프에 따른 물리적 변조를 계산합니다.
 */
export const statusEffector = (world: GameWorld, now: number): { movementDelay: number } => {
  const { player } = world;

  // 1. 기본 이동 속도 배율 계산
  const baseSpeedMult = (player.stats.moveSpeed || 100) / 100;
  
  // 2. 상태 이상에 따른 속도 변조
  let statusSpeedMult = 1.0;
  if (player.stats.activeEffects) {
    if (player.stats.activeEffects.some((e) => e.type === 'SLOW')) statusSpeedMult *= 0.5;
    if (player.stats.activeEffects.some((e) => e.type === 'BUFF_SPEED')) statusSpeedMult *= 1.5;
    if (player.stats.activeEffects.some((e) => e.type === 'FREEZE')) statusSpeedMult *= 0.2;
  }

  // 3. 마스터리 돌파/버프에 의한 속도 변조
  if (now < player.buffs.speedBoostUntil) {
    statusSpeedMult *= player.buffs.speedBoostMultiplier;
  }

  const divisor = baseSpeedMult * statusSpeedMult || 1;
  const movementDelay = MOVEMENT_DELAY_MS / divisor;

  return { movementDelay };
};

/**
 * 이동 시 발생하는 상태 이상 효과(출혈 등)를 처리합니다.
 */
export const processMovementSideEffects = (world: GameWorld) => {
  const { player } = world;

  // BLEED (선혈): 이동 시 최대 체력 비례 고정 피해
  if (player.stats.activeEffects?.some((e) => e.type === 'BLEED')) {
    const bleedDmg = Math.max(1, Math.floor(player.stats.maxHp * 0.03));
    player.stats.hp -= bleedDmg;
    
    createFloatingText(
      world,
      player.visualPos.x * 128, // TILE_SIZE (128) 기준 보정
      player.visualPos.y * 128,
      `-${bleedDmg}`,
      '#ef4444',
    );
  }
};
