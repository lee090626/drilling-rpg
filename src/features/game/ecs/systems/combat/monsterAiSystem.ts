import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 몬스터의 AI 행동(추격, 공격 대기 등)을 처리하는 시스템입니다.
 */
export const monsterAiSystem = (world: GameWorld, now: number) => {
  const { player, entities, tileMap } = world;
  const CHASE_RANGE = 8; // 8타일 이내면 추격 시작

  for (let i = 0; i < entities.soa.count; i++) {
    if (entities.soa.type[i] !== 1 && entities.soa.type[i] !== 2) continue; // 1: monster, 2: boss
    if (entities.soa.hp[i] <= 0) continue;

    // --- Logic LOD (Phase 4) ---
    const px = entities.soa.x[i] / TILE_SIZE;
    const py = entities.soa.y[i] / TILE_SIZE;
    const ew = (entities.soa.width[i] || TILE_SIZE) / TILE_SIZE;
    const eh = (entities.soa.height[i] || TILE_SIZE) / TILE_SIZE;

    // AABB perimeter distance (handles 1x1 ~ 5x5 bosses safely)
    const cx = Math.max(px, Math.min(player.pos.x, px + ew - 1));
    const cy = Math.max(py, Math.min(player.pos.y, py + eh - 1));

    const dx = player.pos.x - cx;
    const dy = player.pos.y - cy;
    const distSq = dx * dx + dy * dy;

    // 15타일(약 900px) 이상 떨어지면 10프레임에 한 번만 AI 체크 (성능 최적화)
    const updateInterval = distSq > 15 * 15 ? 10 : 1;
    // Worker 루프 내의 simple 프레임 카운터 역할 (now 값 사용)
    if (Math.floor(now / 16) % updateInterval !== 0) continue;

    const ATTACK_RANGE = 1.5; // 1.2 -> 1.5 상향 (인접 타일 인식 개선)

    const range = entities.soa.aggroRange[i] || 8;
    const rangeSq = range * range;

    if (distSq < rangeSq) {
      if (distSq < ATTACK_RANGE * ATTACK_RANGE) {
        // [추가] 잡몹(Type 1)은 대각선 공격 불가능
        const isDiagonal = Math.abs(dx) > 0.8 && Math.abs(dy) > 0.8;
        const canAttack = entities.soa.type[i] === 2 || !isDiagonal;

        if (canAttack && entities.soa.state[i] !== 2) {
          entities.soa.state[i] = 2; // 2: attack
          entities.markDirty(i);
        } else if (!canAttack) {
          if (entities.soa.state[i] !== 0) {
            entities.soa.state[i] = 0; // 대각선 잡몹은 대기 상태 유지
            entities.markDirty(i);
          }
          // 공격 사각지대 진입 시 캐스팅 완전 리셋
          entities.soa.lastAttackTime[i] = now;
        }
      } else {
        if (entities.soa.state[i] !== 0) {
          entities.soa.state[i] = 0; // 0: idle
          entities.markDirty(i);
        }
        // 사거리 이탈 시 캐스팅 완전 리셋 (카이팅 허용)
        entities.soa.lastAttackTime[i] = now;
      }
    } else {
      if (entities.soa.state[i] !== 0) {
        entities.soa.state[i] = 0;
        entities.markDirty(i);
      }
      // 추격 범위 이탈 시에도 리셋
      entities.soa.lastAttackTime[i] = now;
    }
  }
};
