import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

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
        // 이미 처치된 몬스터라면 시드에서 나와도 소환 안 함 (오토스폰 방지)
        const isKilled = player.stats.killedMonsterIds?.includes(initialMonster.id);

        if (!isKilled) {
          // 이미 해당 ID의 엔티티가 존재하지 않는지 최종 확인 (중복 방지 - $O(1)$ Hash Lookup)
          if (!entities.hasId(initialMonster.id)) {
            // MonsterDefinition 인덱스 찾기 (최적화: 미리 맵핑 테이블을 만드는 게 좋지만 일단 findIndex 사용)
            const MONSTERS = require('@/shared/config/monsterData').MONSTERS;
            const defIdx = MONSTERS.findIndex((m: any) => m.id === initialMonster.id);

            entities.create(
                1, // type: monster
                initialMonster.x * TILE_SIZE, 
                initialMonster.y * TILE_SIZE, 
                initialMonster.id,
                defIdx !== -1 ? defIdx : 0
            );
            
            // 추가 스탯 설정 (SoA 직접 접근)
            const idx = entities.soa.count - 1;
            entities.soa.hp[idx] = initialMonster.stats?.hp || 100;
            entities.soa.maxHp[idx] = initialMonster.stats?.maxHp || 100;
            entities.soa.attack[idx] = initialMonster.stats?.attack || 5;
            entities.soa.speed[idx] = initialMonster.stats?.speed || 50;
            entities.soa.width[idx] = initialMonster.width || 60;
            entities.soa.height[idx] = initialMonster.height || 60;
          }
        }
      }
      
      // 체크 완료 표시
      spawnedCoords.add(coordKey);
    }
  }

  // 최적화: 플레이어와 너무 멀어진 몬스터 제거 및 좌표 추적 데이터 정리
  if (entities.soa.count > 50 || spawnedCoords.size > 1000) {
    // 1. 엔티티 제거 ($O(1)$ Swap-and-Pop)
    for (let i = entities.soa.count - 1; i >= 0; i--) {
      if (entities.soa.type[i] !== 1) continue; // 1: monster
      
      const dx = player.pos.x - entities.soa.x[i];
      const dy = player.pos.y - entities.soa.y[i];
      if (Math.abs(dx) > 40 || Math.abs(dy) > 30) {
        entities.destroy(i);
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
