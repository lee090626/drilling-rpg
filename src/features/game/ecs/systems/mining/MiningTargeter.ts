import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 플레이어의 현재 위치와 입력 방향을 기반으로 채굴 대상을 계산합니다.
 */
export const miningTargeter = (world: GameWorld): { hasMonsterTarget: boolean } => {
  const { player, tileMap, intent } = world;
  
  // 현재 위치 및 입력 방향을 고려한 타겟 좌표 계산
  const targetX = Math.floor(player.pos.x + (intent.moveX !== 0 ? intent.moveX * 1.0 : 0) + 0.5);
  const targetY = Math.floor(player.pos.y + (intent.moveY !== 0 ? intent.moveY * 1.0 : 0) + 0.5);
  const targetTile = tileMap.getTile(targetX, targetY);

  // 1. 몬스터 존재 여부 체크 (SpatialHash 사용)
  let hasMonsterTarget = false;
  const targetPxX = targetX * TILE_SIZE;
  const targetPxY = targetY * TILE_SIZE;
  
  const nearbyIdxs = world.spatialHash.query(
    targetPxX + TILE_SIZE / 2,
    targetPxY + TILE_SIZE / 2,
    TILE_SIZE,
  );

  for (let i = 0; i < nearbyIdxs.length; i++) {
    const idx = nearbyIdxs[i];
    const type = world.entities.soa.type[idx];
    
    // 1: monster, 2: boss
    if ((type === 1 || type === 2) && world.entities.soa.hp[idx] > 0) {
      const ex = world.entities.soa.x[idx];
      const ey = world.entities.soa.y[idx];
      const ew = world.entities.soa.width[idx] || TILE_SIZE;
      const eh = world.entities.soa.height[idx] || TILE_SIZE;
      
      // 타겟 좌표(타일 중심)가 몬스터의 바운딩 박스 안에 있는지 확인
      if (targetPxX >= ex && targetPxX < ex + ew && targetPxY >= ey && targetPxY < ey + eh) {
        hasMonsterTarget = true;
        break;
      }
    }
  }

  // 2. 채굴 대상 확정 (몬스터가 있거나, 파괴 가능한 타일인 경우)
  const isValidTile = targetTile && 
                     targetTile.type !== 'empty' && 
                     targetTile.type !== 'wall' && 
                     targetTile.type !== 'portal';

  if (hasMonsterTarget || isValidTile) {
    intent.miningTarget = { x: targetX, y: targetY };
  } else {
    intent.miningTarget = null;
  }

  return { hasMonsterTarget };
};
