import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';

/**
 * 플레이어의 위치를 기반으로 주변 맵에서 몬스터를 탐색하고 엔티티로 소환하는 시스템입니다.
 */
export const spawnSystem = (world: GameWorld) => {
  const { player, tileMap, spawnedCoords, entities } = world;
  
  // 플레이어 주변 일정 범위(뷰포트보다 약간 넓게) 탐색
  const rangeX = 15;
  const rangeY = 12;
  
  const startX = Math.floor(player.pos.x - rangeX);
  const endX = Math.ceil(player.pos.x + rangeX);
  const startY = Math.floor(player.pos.y - rangeY);
  const endY = Math.ceil(player.pos.y + rangeY);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const coordKey = `${x},${y}`;
      
      // 이미 체크한 좌표는 건너뜀
      if (spawnedCoords.has(coordKey)) continue;
      
      // 해당 좌표에 몬스터가 배치되어 있는지 확인
      const initialMonster = tileMap.getInitialMonster(x, y);
      
      if (initialMonster) {
        // 이미 해당 ID의 엔티티가 존재하지 않는지 최종 확인 (중복 방지)
        const exists = entities.some(e => e.id === initialMonster.id);
        if (!exists) {
          entities.push(initialMonster);
        }
      }
      
      // 체크 완료 표시
      spawnedCoords.add(coordKey);
    }
  }

  // 최적화: 플레이어와 너무 멀어진 몬스터 제거 및 좌표 추적 데이터 정리
  if (entities.length > 50 || spawnedCoords.size > 1000) {
    // 1. 엔티티 제거
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      if (e.type !== 'monster') continue;
      
      const dx = player.pos.x - e.x;
      const dy = player.pos.y - e.y;
      if (Math.abs(dx) > 40 || Math.abs(dy) > 30) {
        entities.splice(i, 1);
      }
    }

    // 2. 너무 오래되거나 멀리 떨어진 좌표 데이터 정리 (메모리 관리)
    if (spawnedCoords.size > 1000) {
      const MAX_DIST = 50;
      for (const coord of spawnedCoords) {
        const [cx, cy] = coord.split(',').map(Number);
        if (Math.abs(player.pos.x - cx) > MAX_DIST || Math.abs(player.pos.y - cy) > MAX_DIST) {
          spawnedCoords.delete(coord);
        }
      }
    }
  }
};
