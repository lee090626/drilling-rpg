import { GameWorld } from '@/entities/world/model';
import { Entity } from '@/shared/types/game';

/**
 * 플레이어와 NPC(엔티티) 또는 포탈 간의 상호작용을 관리하는 시스템입니다.
 * 
 * @param world - 게임 월드 상태 객체
 */
export const interactionSystem = (world: GameWorld) => {
  const { player, entities, tileMap, intent } = world;

  // 1. 주변 엔티티(NPC 등) 확인 및 상호작용 프롬프트 표시 제어
  const INTERACTION_DISTANCE = 1.5;
  let nearbyEntity = null;

  for (const entity of world.staticEntities) {
    const entW = entity.width || 1;
    const entH = entity.height || 1;
    
    // 엔티티의 중심 좌표 기준 거리 체크
    const centerX = entity.x;
    const centerY = entity.y - entH / 2;

    const dx = centerX - player.pos.x;
    const dy = centerY - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 엔티티 크기에 따른 유동적인 상호작용 거리 계산
    const interactionDist = Math.max(2.5, Math.max(entW, entH) / 1.5);

    if (dist < interactionDist) {
      nearbyEntity = entity;
      break;
    }
  }

  if (nearbyEntity) {
    world.ui.showInteractionPrompt = true;
    world.ui.activeInteractionType = nearbyEntity.interactionType;

    // 상호작용 의도(스페이스 키) 처리
    if (intent.action === 'interact') {
      handleEntityInteraction(world, nearbyEntity);
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
};

/**
 * 엔티티 종류에 따른 상호작용(상점 열기, 대화 등)을 처리합니다.
 */
const handleEntityInteraction = (world: GameWorld, entity: Entity) => {
  if (entity.interactionType === 'shop') {
    world.ui.isShopOpen = true;
  } else if (entity.interactionType === 'dialog') {
    // 현재 대화 시스템은 로그 출력만 수행
    console.log(`${entity.name}와(과) 대화 중...`);
  } else if (entity.interactionType === 'crafting') {
    world.ui.isCraftingOpen = true;
  } else if (entity.interactionType === 'refinery') {
    world.ui.isRefineryOpen = true;
  }
};

/**
 * 포탈 상호작용을 처리하여 다음 차원으로 이동시킵니다.
 */
const handlePortalInteraction = (world: GameWorld) => {
  const { player } = world;
  
  if (world.intent.action === 'interact') {
    const nextDim = player.stats.dimension + 1;
    
    // 워커에서는 confirm/alert을 사용할 수 없으므로 메인 스레드에 이벤트를 보냅니다.
    self.postMessage({
      type: 'PORTAL_TRIGGERED',
      payload: { nextDim }
    });

    // 즉시 재발생 방지를 위해 의도 초기화
    world.intent.action = 'none';
  }
};
