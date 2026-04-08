import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 몬스터의 AI 행동(추격, 공격 대기 등)을 처리하는 시스템입니다.
 */
export const monsterAiSystem = (world: GameWorld, now: number) => {
  const { player, entities, tileMap } = world;
  const CHASE_RANGE = 8; // 8타일 이내면 추격 시작
  const ATTACK_RANGE = 1.2; // 1.2타일 이내면 공격 가능

  for (let i = 0; i < entities.soa.count; i++) {
    if (entities.soa.type[i] !== 1 && entities.soa.type[i] !== 2) continue; // 1: monster, 2: boss
    if (entities.soa.hp[i] <= 0) continue;

    // --- Logic LOD (Phase 4) ---
    const px = entities.soa.x[i] / TILE_SIZE;
    const py = entities.soa.y[i] / TILE_SIZE;
    
    const dx = player.pos.x - px;
    const dy = player.pos.y - py;
    const distSq = dx * dx + dy * dy;

    // 15타일(약 900px) 이상 떨어지면 10프레임에 한 번만 AI 체크 (성능 최적화)
    const updateInterval = distSq > 15 * 15 ? 10 : 1;
    // Worker 루프 내의 simple 프레임 카운터 역할 (now 값 사용)
    if (Math.floor(now / 16) % updateInterval !== 0) continue;

    if (distSq < CHASE_RANGE * CHASE_RANGE) {
      if (distSq < ATTACK_RANGE * ATTACK_RANGE) {
        entities.soa.state[i] = 2; // 2: attack
      } else {
        entities.soa.state[i] = 0; // 0: idle
      }
    } else {
      entities.soa.state[i] = 0;
    }
  }
};
