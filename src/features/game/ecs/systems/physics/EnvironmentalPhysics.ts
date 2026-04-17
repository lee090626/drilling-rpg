import { GameWorld } from '@/entities/world/model';
import { BASE_DEPTH } from '@/shared/config/constants';

/**
 * 환경적인 힘(Storm, 가속도 등) 및 월드 경계를 처리합니다.
 */
export const environmentalPhysics = (world: GameWorld) => {
  const { player, tileMap } = world;

  // 1. 외부 힘 적용 (Storm Surge 등)
  if (world.environmentalForce.vx !== 0 || world.environmentalForce.vy !== 0) {
    const nextX = player.pos.x + world.environmentalForce.vx;
    const nextY = player.pos.y + world.environmentalForce.vy;
    
    // 벽/광물 충돌 검사 (간소화된 4방향 체크)
    const tileX = Math.floor(nextX + 0.5);
    const tileY = Math.floor(nextY + 0.5);
    const targetTile = tileMap.getTile(tileX, tileY);
    
    // 타일이 존재하고 파괴 가능한 타일(Health > 0)이거나 벽인 경우 이동 제한
    const isSolid = targetTile && (targetTile.maxHealth > 0 || targetTile.type === 'wall');
    
    if (!isSolid) {
      player.pos.x = nextX;
      player.pos.y = nextY;
    }
  }

  // 2. 월드 경계 제한 (64x3000 그리드 기준)
  // X: 0 ~ 63
  // Y: BASE_DEPTH ~ 2999
  player.pos.x = Math.max(0, Math.min(63, player.pos.x));
  player.pos.y = Math.max(BASE_DEPTH, Math.min(2999, player.pos.y));
};
