import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { createFloatingText } from '@/shared/lib/effectUtils';

/**
 * 투사체(Projectile)의 물리 연산 및 충돌 판정을 처리하는 시스템입니다.
 */
export const projectileSystem = (world: GameWorld, deltaTime: number, now: number) => {
  const { entities, player, tileMap } = world;
  const { soa } = entities;

  const dtFactor = deltaTime / 16.6;

  for (let i = soa.count - 1; i >= 0; i--) {
    if (soa.type[i] !== 5) continue; // 5: projectile

    // 1. 위치 업데이트
    soa.x[i] += soa.vx[i] * dtFactor;
    soa.y[i] += soa.vy[i] * dtFactor;
    entities.markDirty(i);

    // 2. 플레이어 충돌 체크
    const px = player.pos.x * TILE_SIZE;
    const py = player.pos.y * TILE_SIZE;
    const pw = TILE_SIZE;
    const ph = TILE_SIZE;

    const ex = soa.x[i];
    const ey = soa.y[i];
    const ew = soa.width[i] || 16;
    const eh = soa.height[i] || 16;

    const isHitPlayer = ex < px + pw && ex + ew > px && ey < py + ph && ey + eh > py;

    if (isHitPlayer) {
      // 대미지 적용
      const attack = soa.attack[i] || 10;
      const damage = Math.max(1, attack - (player.stats.defense || 0));
      player.stats.hp -= damage;
      player.lastHitTime = now;

      createFloatingText(world, px + TILE_SIZE / 2, py, `-${damage}`, '#ef4444');
      world.shake = Math.max(world.shake, 5);

      entities.destroy(i);
      continue;
    }

    // 3. 타일 충돌 및 맵 경계 체크
    const tx = Math.floor(ex / TILE_SIZE);
    const ty = Math.floor(ey / TILE_SIZE);

    // 월드 경계 밖으로 나감
    if (ty < 0 || ty >= 3000) {
      entities.destroy(i);
      continue;
    }

    const tile = tileMap.getTile(tx, ty);
    if (tile && tile.type !== 'empty' && tile.type !== 'portal') {
      // 벽에 부딪힘
      entities.destroy(i);
      continue;
    }

    // 4. 수명(Life) 체크 (5초 후 소멸)
    // lastAttackTime 필드를 '생성 시간(performance.now)'으로 활용함
    if (now - soa.lastAttackTime[i] > 5000) {
      entities.destroy(i);
      continue;
    }
  }
};
