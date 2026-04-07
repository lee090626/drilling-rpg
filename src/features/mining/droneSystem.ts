import { GameWorld } from '@/entities/world/model';
import { DRONES } from '@/shared/config/droneData';
import { TILE_SIZE } from '@/shared/config/constants';
import { getTileColor } from '@/shared/lib/tileUtils';
import { MINERALS } from '@/shared/config/mineralData';
import { createParticles } from '@/shared/lib/effectUtils';
import { calculateDroneDamage } from './miningCalculator';
import { handleBossDefeat } from './bossSystem';

/**
 * 펫 드론의 독립 보조 채굴 로직(Auto-Mining)을 처리하는 시스템입니다.
 */
export const droneSystem = (world: GameWorld, now: number) => {
  const { player, tileMap, activeDrone } = world;
  
  if (!activeDrone || !player.stats.equippedDroneId) return;

  const droneConfig = DRONES[player.stats.equippedDroneId];
  if (!droneConfig) return;

  // 쿨타임 체크
  if (now - activeDrone.lastHitTime < droneConfig.cooldownMs) {
    // 쿨타임 중일 때 시각 효과 소거 타이머 (예: 200ms 동안만 레이저 출력)
    if (activeDrone.targetX && (now - activeDrone.lastHitTime > 200)) {
      activeDrone.targetX = null;
      activeDrone.targetY = null;
    }
    return;
  }

  // 드론의 타일 좌표 계산
  const droneTileX = Math.floor(activeDrone.x / TILE_SIZE);
  const droneTileY = Math.floor(activeDrone.y / TILE_SIZE);
  
  // 반경 내 파괴 가능한 대상 탐색
  let targetFound = false;
  let tX = 0, tY = 0, tType: any = '';
  
  const radius = droneConfig.miningRadius || 2;
  searchLoop:
  for(let r = 1; r <= radius; r++) {
    for(let dy = -r; dy <= r; dy++) {
      for(let dx = -r; dx <= r; dx++) {
        // 겉테두리만 탐색
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        
        const cx = droneTileX + dx;
        const cy = droneTileY + dy;
        const cTile = tileMap.getTile(cx, cy);
        
        if (cTile && cTile.type !== 'empty' && cTile.type !== 'wall' && cTile.type !== 'portal' && cTile.health > 0) {
          targetFound = true;
          tX = cx; tY = cy; tType = cTile.type;
          break searchLoop;
        }
      }
    }
  }
  
  if (targetFound) {
    // 레이저 타겟 좌표 저장 (렌더링 용)
    activeDrone.targetX = tX * TILE_SIZE + TILE_SIZE / 2;
    activeDrone.targetY = tY * TILE_SIZE + TILE_SIZE / 2;
    activeDrone.lastHitTime = now;
    
    const droneDamage = calculateDroneDamage(droneConfig.basePower, tType);
    
    if (droneDamage > 0) {
      const dDestroyed = tileMap.damageTile(tX, tY, droneDamage);
      
      const color = getTileColor(tType);
      if (dDestroyed) {
        createParticles(world, tX * TILE_SIZE, tY * TILE_SIZE, color, 8);
        const inv = player.stats.inventory;
        if (inv[tType] !== undefined) {
          world.droppedItems.push({
            id: `drone_drop_${Math.random()}`,
            type: tType,
            x: tX * TILE_SIZE + TILE_SIZE / 2,
            y: tY * TILE_SIZE + TILE_SIZE / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: -4 - Math.random() * 3,
            life: 0
          });
        }
        
        if (tType === 'boss_core') {
          handleBossDefeat(world, tX, tY);
        }
      } else {
        // 작은 파편 연출
        createParticles(world, tX * TILE_SIZE, tY * TILE_SIZE, color, 2);
      }
    }
  } else {
    // 쏠 타겟이 없으면 레이저 시각효과 해제
    if (now - activeDrone.lastHitTime > 300) {
      activeDrone.targetX = null;
      activeDrone.targetY = null;
    }
  }
};
