import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * GameLoop 내부의 렌더링 동기화 바이너리 통신 로직을 전담하는 인코더 클래스입니다.
 * ECS 내부 SoA 구조체의 데이터를 Float32Array로 직렬화하여 Main Thread로 전송합니다.
 */
export class RenderSyncEncoder {
  private static readonly HEADER_SIZE = 16;
  private static readonly ENTITY_STRIDE = 8;
  private static readonly CULLING_RADIUS = 1200;

  /**
   * 버퍼에 현재 월드의 상태를 기록합니다.
   * Culling이 적용된 Entity 데이터만 포함하여 전송 대역폭을 최적화합니다.
   */
  public static encodeAndSend(world: GameWorld, buffer: ArrayBuffer, now: number) {
    const view = new Float32Array(buffer);

    // Culling (지정된 반경 내의 엔티티만 인덱싱)
    const visibleIndices = world.spatialHash.query(
      world.player.visualPos.x * TILE_SIZE,
      world.player.visualPos.y * TILE_SIZE,
      this.CULLING_RADIUS
    );

    // Header 패킹
    view[0] = visibleIndices.length;
    view[1] = now;
    view[2] = world.player.visualPos.x;
    view[3] = world.player.visualPos.y;
    view[4] = world.shake;
    view[5] = world.player.stats.hp;
    view[6] = world.player.stats.maxHp;

    // Body 패킹
    let offset = this.HEADER_SIZE;
    const { soa } = world.entities;

    for (let i = 0; i < visibleIndices.length; i++) {
      const idx = visibleIndices[i];
      if (offset + this.ENTITY_STRIDE > view.length) break;

      view[offset + 0] = soa.type[idx];
      view[offset + 1] = soa.state[idx];
      view[offset + 2] = soa.x[idx];
      view[offset + 3] = soa.y[idx];
      view[offset + 4] = soa.hp[idx];
      view[offset + 5] = soa.maxHp[idx];
      view[offset + 6] = soa.spriteIndex[idx];
      view[offset + 7] = soa.width[idx];

      // 동기화 완료 후 Dirty 플래그 클리어 (렌더 틱에서 수행됨)
      soa.dirtyFlags[idx] = 0;

      offset += this.ENTITY_STRIDE;
    }

    // 워커 환경에서 자체 Global Scope를 통해 전송
    (self as any).postMessage({ type: 'RENDER_SYNC', buffer }, [buffer]);
  }
}
