import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { Entity } from '@/shared/types/game';
import { TILE_SIZE } from '@/shared/config/constants';
import { DRONES } from '@/shared/config/droneData';

/**
 * 엔티티별 Pixi 컨테이너 캐시 (ID -> Container)
 */
const entityContainerMap = new Map<string, PIXI.Container>();
const staticContainerMap = new Map<string, PIXI.Container>();
const droneContainerMap = new Map<string, PIXI.Container>();
const visualHpMap = new Map<string, number>(); // 이전 프레임의 HP 비율 캐시 (애니메이션용)

/**
 * 엔티티 컨테이너 풀 (객체 재사용)
 */
const entityPool: PIXI.Container[] = [];
const visualHpCache = new Float32Array(5000); // 인덱스별 시각적 HP 보간값

export const renderEntities = (
  world: GameWorld, 
  layers: { entityLayer: PIXI.Container; effectLayer: PIXI.Container }, 
  now: number,
  textures: { [key: string]: PIXI.Texture }
) => {
  const { entities, activeDrone, player } = world;
  const { entityLayer } = layers;
  const { soa } = entities;

  // 1. 플레이어 렌더링 (별도 관리 또는 인덱스 0 고정 가능하지만 여기서는 수동 업데이트)
  let playerContainer = entityContainerMap.get('player');
  if (!playerContainer) {
    playerContainer = createEntityContainer({ type: 'player', width: 1, height: 1 }, textures, 'player');
    entityLayer.addChild(playerContainer);
    entityContainerMap.set('player', playerContainer);
  }
  updateEntitySpriteByIndex(-1, player, playerContainer, now, textures);

  // 2. SoA 엔티티 렌더링 (Viewport Culling & Index 동기화)
  // 현재 화면 중심(플레이어) 기준 넉넉한 반경 내의 엔티티만 조회
  const visibleIndices = world.spatialHash.query(
    player.visualPos.x * TILE_SIZE,
    player.visualPos.y * TILE_SIZE,
    1200 // 고정 반경 (뷰포트 크기에 따라 조절 가능)
  );

  const monsterStartIndex = 1; // 0번 자식은 플레이어
  
  // 가시 엔티티 개수에 맞춰 컨테이너 개수 동기화
  while (entityLayer.children.length - monsterStartIndex < visibleIndices.length) {
    const container = entityPool.pop() || createEntityContainer({ type: 'monster', width: 1, height: 1 }, textures);
    container.alpha = 0; // 등장 시 페이드 인을 위해 0으로 시작
    entityLayer.addChild(container);
  }

  while (entityLayer.children.length - monsterStartIndex > visibleIndices.length) {
    const container = entityLayer.removeChildAt(entityLayer.children.length - 1) as PIXI.Container;
    container.visible = false;
    entityPool.push(container);
  }

  // 가시 엔티티만 데이터 동기화
  for (let i = 0; i < visibleIndices.length; i++) {
    const idx = visibleIndices[i];
    const container = entityLayer.getChildAt(i + monsterStartIndex) as PIXI.Container;
    container.visible = true;
    updateEntitySpriteFromSoA(idx, soa, player, container, now, textures);
  }

  // 3. 펫 드론 렌더링
  if (activeDrone) {
    updateDrone(world, entityLayer, now);
  }

  // 4. 정적 NPC 및 오브젝트 (상점, 제련소 등) 렌더링
  if (world.staticEntities) {
    for (let i = 0; i < world.staticEntities.length; i++) {
      const staticEntity = world.staticEntities[i];
      let staticContainer = staticContainerMap.get(staticEntity.id);
      if (!staticContainer) {
        staticContainer = createEntityContainer(staticEntity, textures);
        entityLayer.addChild(staticContainer);
        staticContainerMap.set(staticEntity.id, staticContainer);
      }
      updateEntitySpriteByIndex(i, staticEntity, staticContainer, now, textures);
    }
  }
};

/**
 * SoA 데이터를 기반으로 컨테이너 가시성 및 속성 업데이트
 */
function updateEntitySpriteFromSoA(idx: number, soa: any, player: any, container: PIXI.Container, now: number, textures: any) {
  const type = soa.type[idx];
  const ex = soa.x[idx];
  const ey = soa.y[idx];
  const ew = soa.width[idx] || TILE_SIZE;
  const eh = soa.height[idx] || TILE_SIZE;

  // 위치 동기화
  container.x = ex;
  container.y = ey;

  // 텍스처 및 색상 업데이트 (타입에 따라)
  const body = container.getChildByName('body') as any;
  if (body) {
    // 몬스터 종류에 따른 틴트/이모지 처리 (간소화)
    if (type === 1) body.tint = 0xef4444; // Monster
    else if (type === 2) body.tint = 0xa855f7; // Boss (Purple)
    
    // 피격 효과 (Hit Flash)
    const lastHit = 0; // TODO: SoA에 lastHitTime 추가 필요 시 반영
    const isHit = now - lastHit < 100;
    body.alpha = isHit ? 0.7 : 1.0;
  }

  // 체력바 및 인디케이터 업데이트
  updateHPBarFromSoA(idx, soa, player, container);
  updateAttackIndicatorFromSoA(idx, soa, container, now);

  // 페이드 인 효과 (Phase 5)
  if (container.alpha < 1) {
    container.alpha += 0.05; 
    if (container.alpha > 1) container.alpha = 1;
  }
}


/**
 * 플레이어 전용 업데이트 (기존 호환성 유지)
 */
function updateEntitySpriteByIndex(idx: number, entity: any, container: PIXI.Container, now: number, textures: any) {
  // player는 visualPos를, static entity는 x, y를 사용
  const targetX = entity.visualPos ? entity.visualPos.x : entity.x;
  const targetY = entity.visualPos ? entity.visualPos.y : entity.y;
  container.x = targetX * TILE_SIZE;
  container.y = targetY * TILE_SIZE;
  
  const body = container.getChildByName('body') as PIXI.Sprite;
  if (body) {
    const isHit = now - (entity.lastHitTime || 0) < 100;
    body.alpha = isHit ? 0.7 : 1.0;
  }
}

/**
 * 엔티티를 위한 Pixi 컨테이너와 스프라이트 초기 생성
 */
function createEntityContainer(entity: any, textures: { [key: string]: PIXI.Texture }, forceTextureKey?: string): PIXI.Container {
  const container = new PIXI.Container();
  const entW = (entity.width || 1) * TILE_SIZE;
  const entH = (entity.height || 1) * TILE_SIZE;
  const isPlayer = !entity.type || entity.type === 'player';
  const textureKey = forceTextureKey || entity.imagePath || '';
  const isEmoji = !forceTextureKey && entity.imagePath && isEmojiString(entity.imagePath);

  if (isEmoji) {
    const emojiText = new PIXI.Text({
      text: entity.imagePath!,
      style: { fontSize: entW * 0.8, align: 'center' }
    });
    emojiText.name = 'body';
    emojiText.anchor.set(0.5, 0.5);
    emojiText.position.set(entW / 2, entH / 2);
    container.addChild(emojiText);
  } else {
    const texture = textures[textureKey] || PIXI.Texture.WHITE;
    const sprite = new PIXI.Sprite(texture);
    sprite.name = 'body';
    sprite.width = entW;
    sprite.height = entH;
    
    if (!textureKey && !forceTextureKey) {
      sprite.tint = entity.type === 'monster' ? 0xef4444 : 0xeab308;
    }
    container.addChild(sprite);
  }

  if (!isPlayer) {
    const hpBar = new PIXI.Graphics();
    hpBar.name = 'hpBar';
    hpBar.y = -18; // HP바 위치 상단으로 이동
    container.addChild(hpBar);

    if (entity.type === 'boss') {
      const nameTag = new PIXI.Text({
        text: entity.name, 
        style: { fontSize: 14, fill: 0xffffff, fontWeight: 'bold', stroke: { color: 0x000000, width: 2 } }
      });
      nameTag.name = 'nameTag';
      nameTag.anchor.set(0.5, 0.5);
      nameTag.position.set(entW / 2, -35); // 이름표 위치 조정
      container.addChild(nameTag);
    }

    const indicator = new PIXI.Text({
      text: '!', 
      style: { fontSize: 28, fill: 0xff0000, fontWeight: '900', stroke: { color: 0xffffff, width: 3 } }
    });
    indicator.name = 'attackIndicator';
    indicator.anchor.set(0.5, 0.5);
    indicator.position.set(entW / 2, -35); // HP바 위로 이동
    indicator.visible = false;
    container.addChild(indicator);
  }

  return container;
}

/** 이모지 판별 유틸리티 */
function isEmojiString(str: string): boolean {
  return /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(str) || str.length <= 2;
}

function updateAttackIndicatorFromSoA(idx: number, soa: any, container: PIXI.Container, now: number) {
  const indicator = container.getChildByName('attackIndicator') as PIXI.Text;
  if (!indicator) return;

  const attackCooldown = 1000;
  const lastAttack = soa.lastAttackTime[idx];
  const timeSinceLastAttack = lastAttack ? now - lastAttack : attackCooldown;
  const isTelegraphing = timeSinceLastAttack > attackCooldown - 300;
  indicator.visible = isTelegraphing;

  if (isTelegraphing) {
    const pulse = 1 + Math.sin(now / 50) * 0.2;
    indicator.scale.set(pulse);
  }
}

function updateHPBarFromSoA(idx: number, soa: any, player: any, container: PIXI.Container) {
  const hpBar = container.getChildByName('hpBar') as PIXI.Graphics;
  if (!hpBar) return;

  const ex = soa.x[idx];
  const ey = soa.y[idx];
  const hp = soa.hp[idx];
  const maxHp = soa.maxHp[idx];
  const entW = soa.width[idx] || TILE_SIZE;

  const dx = player.pos.x * TILE_SIZE - ex;
  const dy = player.pos.y * TILE_SIZE - ey;
  const distSq = dx * dx + dy * dy;
  const shouldShowHP = hp < maxHp || distSq < (TILE_SIZE * 8) * (TILE_SIZE * 8);

  hpBar.visible = shouldShowHP;
  if (!shouldShowHP) return;

  const barW = entW * 0.9;
  const barH = 5;
  const barX = (entW - barW) / 2;
  const currentRatio = Math.max(0, hp / maxHp);
  
  // 인덱스 기반 보간 캐시 사용 (간소화: 여기서는 즉시 반영하거나 별도 배열 관리 가능)
  hpBar.clear();
  hpBar.roundRect(barX - 1, -1, barW + 2, barH + 2, 4);
  hpBar.fill({ color: 0x09090b, alpha: 0.8 });

  let color = 0x10b981;
  if (currentRatio < 0.25) color = 0xef4444;
  else if (currentRatio < 0.5) color = 0xf59e0b;

  if (currentRatio > 0) {
    hpBar.roundRect(barX, 0, barW * currentRatio, barH, 2);
    hpBar.fill({ color });
  }
}

function updateDrone(world: GameWorld, entityLayer: PIXI.Container, now: number) {
  const { activeDrone } = world;
  if (!activeDrone) return;

  let container = droneContainerMap.get(activeDrone.id);
  if (!container) {
    container = new PIXI.Container();
    const droneConfig = DRONES[activeDrone.id];
    const icon = new PIXI.Text({ text: droneConfig ? droneConfig.icon : '🤖', style: { fontSize: 28 } });
    icon.anchor.set(0.5, 0.5);
    container.addChild(icon);
    entityLayer.addChild(container);
    droneContainerMap.set(activeDrone.id, container);
  }

  const hoverY = Math.sin(now / 200) * 4;
  container.position.set(activeDrone.x, activeDrone.y + hoverY);
}
