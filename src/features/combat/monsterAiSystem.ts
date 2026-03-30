import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';

/**
 * 몬스터의 AI 행동(추격, 공격 대기 등)을 처리하는 시스템입니다.
 */
export const monsterAiSystem = (world: GameWorld) => {
  const { player, entities, tileMap } = world;
  const CHASE_RANGE = 8; // 8타일 이내면 추격 시작
  const ATTACK_RANGE = 1.2; // 1.2타일 이내면 공격 가능

  entities.forEach(entity => {
    if (entity.type !== 'monster' && entity.type !== 'boss') return;
    if (!entity.stats || entity.stats.hp <= 0) return;

    // 플레이어와의 거리 계산 (몬스터는 그리드 기준이므로 타일 중앙 위치 사용)
    const dx = player.pos.x - (entity.x + 0.5);
    const dy = player.pos.y - (entity.y + 0.5);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CHASE_RANGE) {
      // 추격은 하지 않고 공격 사거리만 체크
      if (distance < ATTACK_RANGE) {
        entity.state = 'attack';
      } else {
        entity.state = 'idle';
      }
    } else {
      entity.state = 'idle';
    }
  });
};
