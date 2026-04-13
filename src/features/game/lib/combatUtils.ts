import { Position, Entity } from '@/shared/types/game';

/**
 * 두 좌표 사이의 거리를 계산합니다.
 */
export const getDistance = (
  p1: Position | { x: number; y: number },
  p2: Position | { x: number; y: number },
) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 엔티티(몬스터/보스)의 타일 중앙 좌표를 반환합니다.
 */
export const getEntityCenter = (entity: Entity) => {
  return {
    x: entity.x + (entity.width || 1) / 2,
    y: entity.y + (entity.height || 1) / 2,
  };
};

/**
 * 특정 범위 내에 있는 엔티티들을 필터링합니다.
 */
export const getEntitiesInRange = (
  entities: Entity[],
  pos: { x: number; y: number },
  range: number,
) => {
  return entities.filter((entity) => {
    const center = getEntityCenter(entity);
    return getDistance(pos, center) <= range;
  });
};
