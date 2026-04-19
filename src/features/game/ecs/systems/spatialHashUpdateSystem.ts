import { GameWorld } from '@/entities/world/model';

/**
 * 매 프레임마다 공간 분할(Spatial Hash) 그리드를 업데이트합니다.
 * 충돌 판정 및 타겟 서칭 등 성능 최적화를 위한 사전 작업입니다.
 */
export function spatialHashUpdateSystem(world: GameWorld) {
  world.spatialHash.clear();
  for (let i = 0; i < world.entities.soa.count; i++) {
    world.spatialHash.insert(
      i,
      world.entities.soa.x[i],
      world.entities.soa.y[i],
      world.entities.soa.width[i],
      world.entities.soa.height[i]
    );
  }
}
