import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { getTileColor } from '@/shared/lib/tileUtils';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { calculateMiningDamage } from '../../../lib/miningCalculator';

/**
 * 조준된 타일에 실제 드릴링 대미지를 입히고 시각 효과를 발생시킵니다.
 */
export const miningExecutor = (
  world: GameWorld, 
  now: number, 
  hasMonsterTarget: boolean
): { destroyed: boolean; targetType: any; totalPower: number } | null => {
  const { player, tileMap, intent } = world;

  // 채굴 중이 아니거나 타겟이 없으면 종료
  if (!player.isDrilling || !intent.miningTarget) {
    player.isDrilling = false;
    return null;
  }

  // 몬스터를 조준 중이면 타일 채굴은 생략 (전투 시스템 담당)
  if (hasMonsterTarget) {
    return null;
  }

  const { x, y } = intent.miningTarget;
  const targetTile = tileMap.getTile(x, y);
  if (!targetTile) return null;

  // 1. 대미지 계산
  const { finalDamage, totalPower, isCrit, attackInterval } = calculateMiningDamage(
    player.stats,
    targetTile.type as any,
  );

  // 2. 쿨타임 체크 (연사 속도 제어)
  if (now - world.timestamp.lastMiningTime < attackInterval) return null;

  // 3. 타격 실행
  const destroyed = finalDamage > 0 ? tileMap.damageTile(x, y, finalDamage) : false;
  world.timestamp.lastMiningTime = now;

  if (finalDamage > 0) {
    player.lastHitTime = now;
    // 파괴 시 더 강한 흔들림
    world.shake = Math.max(world.shake, destroyed ? 2.0 : 0.5);

    // 시각 효과: 파편 및 부동 텍스트
    createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(targetTile.type), 2);
    createFloatingText(
      world,
      x * TILE_SIZE,
      y * TILE_SIZE,
      isCrit ? `Crit! -${finalDamage}` : `${finalDamage}`,
      isCrit ? '#f87171' : '#ffffff',
    );
  }

  return { destroyed, targetType: targetTile.type, totalPower };
};
