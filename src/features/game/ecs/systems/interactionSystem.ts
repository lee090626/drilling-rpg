import { GameWorld } from '@/entities/world/model';
import { Entity } from '@/shared/types/game';
import { getCircleConfig, CIRCLES } from '@/shared/config/circleData';

/**
 * 플레이어와 NPC(엔티티) 또는 포탈 간의 상호작용을 관리하는 시스템입니다.
 *
 * @param world - 게임 월드 상태 객체
 */
export const interactionSystem = (world: GameWorld) => {
  const { player, entities, tileMap, intent } = world;

  // 0. 필수 데이터 안전성 확인
  if (!world.staticEntities || !player || !player.pos) return;

  try {
    // 1. 주변 엔티티(NPC 등) 확인 및 상호작용 프롬프트 표시 제어
    let nearbyEntity = null;

    for (const entity of world.staticEntities) {
      if (!entity) continue;

      const entW = entity.width || 1;
      const entH = entity.height || 1;

      // (0,0) 탑-레프트 기준 렌더링을 고려하여, 실제 중심점은 y + h/2가 되어야 함
      const centerX = entity.x + entW / 2;
      const centerY = entity.y + entH / 2;

      const dx = centerX - player.pos.x;
      const dy = centerY - player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 더 엄격한 상호작용 거리 계산 (최소 2.0타일, 크기 비례 1.5배)
      const interactionDist = Math.max(2.0, Math.max(entW, entH) / 1.5);

      if (dist < interactionDist) {
        nearbyEntity = entity;
        break;
      }
    }

    if (nearbyEntity) {
      if (!world.ui.showInteractionPrompt) {
        console.log(
          `[Interaction] Nearby entity sensed: ${nearbyEntity.name} (ID: ${nearbyEntity.id}, Type: ${nearbyEntity.interactionType})`,
        );
      }
      world.ui.showInteractionPrompt = true;
      world.ui.activeInteractionType = nearbyEntity.interactionType;

      // 상호작용 의도(스페이스 키) 처리
      if (intent.action === 'interact') {
        console.log(`[Interaction] Executing action for: ${nearbyEntity.name}`);
        handleEntityInteraction(world, nearbyEntity);
        // 상호작용 성공 후 의도 초기화
        world.intent.action = 'none';
      }
    } else {
      world.ui.showInteractionPrompt = false;
      world.ui.activeInteractionType = null;
    }

    // 2. 포탈 상호작용 확인 (포탈 위에 서 있는 경우)
    const currentTileX = Math.floor(player.pos.x + 0.5);
    const currentTileY = Math.floor(player.pos.y + 0.5);
    const currentTile = tileMap.getTile(currentTileX, currentTileY);
    if (currentTile && currentTile.type === 'portal') {
      handlePortalInteraction(world);
    }
  } catch (err) {
    console.error('[InteractionSystem Error]', err);
  }
};

/**
 * 엔티티 종류에 따른 상호작용(상점 열기, 대화 등)을 처리합니다.
 */
const handleEntityInteraction = (world: GameWorld, entity: Entity) => {
  console.log(`[Interaction] Handling ${entity.interactionType} for ${entity.name}`);
  if (entity.interactionType === 'shop') {
    self.postMessage({ type: 'OPEN_MODAL', payload: { target: 'isShopOpen' } });
  } else if (entity.interactionType === 'dialog') {
    console.log(`[Dialog] ${entity.name}: "반갑습니다! 무엇을 도와드릴까요?"`);
  } else if (entity.interactionType === 'crafting') {
    self.postMessage({ type: 'OPEN_MODAL', payload: { target: 'isCraftingOpen' } });
  } else if (entity.interactionType === 'refinery') {
    self.postMessage({ type: 'OPEN_MODAL', payload: { target: 'isRefineryOpen' } });
  }
};

/**
 * 포탈 상호작용을 처리하여 다음 차원으로 이동시킵니다.
 */
const handlePortalInteraction = (world: GameWorld) => {
  const { player } = world;

  if (world.intent.action === 'interact') {
    const currentCircle = getCircleConfig(player.stats.depth);
    const nextCircle = CIRCLES.find((c) => c.id === currentCircle.id + 1);

    if (nextCircle) {
      // 워커에서는 confirm/alert을 사용할 수 없으므로 메인 스레드에 이벤트를 보냅니다.
      self.postMessage({
        type: 'PORTAL_TRIGGERED',
        payload: { nextDepth: nextCircle.depthStart, nextCircleId: nextCircle.id },
      });
    }

    // 즉시 재발생 방지를 위해 의도 초기화
    world.intent.action = 'none';
  }
};
