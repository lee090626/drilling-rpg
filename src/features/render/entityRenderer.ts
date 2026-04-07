import * as PIXI from 'pixi.js';
import { GameWorld } from '../../entities/world/model';
import { Entity } from '../../shared/types/game';
import { TILE_SIZE } from '../../shared/config/constants';
import { DRONES } from '../../shared/config/droneData';

/**
 * 엔티티별 Pixi 컨테이너 캐시 (ID -> Container)
 */
const entityContainerMap = new Map<string, PIXI.Container>();
const droneContainerMap = new Map<string, PIXI.Container>();
const visualHpMap = new Map<string, number>(); // 이전 프레임의 HP 비율 캐시 (애니메이션용)

/**
 * PixiJS를 사용하여 모든 엔티티(NPC, 몬스터, 보스, 드론 등)를 렌더링하는 헬퍼 시스템입니다.
 */
export const renderEntities = (
  world: GameWorld, 
  layers: { entityLayer: PIXI.Container; effectLayer: PIXI.Container }, 
  now: number,
  textures: { [key: string]: PIXI.Texture }
) => {
  const { entities, activeDrone, player } = world;
  const { entityLayer } = layers;

  // 0. 현재 프레임에 존재하는 엔티티 ID 추적
  const activeEntityIds = new Set<string>();
  
  // 플레이어 렌더링
  const playerId = 'player';
  activeEntityIds.add(playerId);
  updateEntitySprite(player, player, entityLayer, now, textures, 'player', playerId);

  // 1. 일반 엔티티 렌더링
  entities.forEach(entity => {
    if (entity.id) {
       activeEntityIds.add(entity.id);
       updateEntitySprite(entity, player, entityLayer, now, textures, undefined, entity.id);
    }
  });

  // 2. 맵에 남아있지만 월드 배열에서 사라진 엔티티 정리 (사망 등)
  for (const [id, container] of entityContainerMap.entries()) {
    if (!activeEntityIds.has(id)) {
      entityLayer.removeChild(container);
      container.destroy({ children: true });
      entityContainerMap.delete(id);
      visualHpMap.delete(id); // 시각적 HP 데이터도 함께 삭제
    }
  }

  // 3. 펫 드론 렌더링
  if (activeDrone) {
    updateDrone(world, entityLayer, now);
  }
};

/**
 * 엔티티(또는 플레이어) 스프라이트 업데이트 통합 로직
 */
function updateEntitySprite(entity: any, player: any, layer: PIXI.Container, now: number, textures: any, forceTextureKey?: string, overrideId?: string) {
  const entityId = overrideId || entity.id;
  let container = entityContainerMap.get(entityId);
  const isPlayer = !entity.type || entity.type === 'player';
  
  // 사망 데이터 자체만으로 삭제 (선제적 처리)
  if (!isPlayer && entity.stats && entity.stats.hp <= 0 && (entity.type === 'monster' || entity.type === 'boss')) {
    if (container) {
      layer.removeChild(container);
      container.destroy({ children: true });
      entityContainerMap.delete(entityId);
      visualHpMap.delete(entityId);
    }
    return;
  }

  if (!container) {
    container = createEntityContainer(entity, textures, forceTextureKey);
    layer.addChild(container);
    entityContainerMap.set(entityId, container);
  }

  const isGrid = entity.type === 'monster' || entity.type === 'boss';
  const entW = (entity.width || 1) * TILE_SIZE;
  const entH = (entity.height || 1) * TILE_SIZE;
  
  // 위치 업데이트
  const pos = entity.visualPos || { x: entity.x, y: entity.y };
  container.x = isGrid ? pos.x * TILE_SIZE : pos.x * TILE_SIZE;
  container.y = isGrid ? pos.y * TILE_SIZE : pos.y * TILE_SIZE;

  // 피격 효과 (Hit Flash)
  const body = container.getChildByName('body') as PIXI.Sprite;
  if (body) {
    const isHit = now - (entity.lastHitTime || 0) < 100;
    if (isHit) {
      body.tint = 0xffffff;
      body.alpha = 0.8;
    } else {
      body.tint = 0xffffff;
      body.alpha = 1.0;
      
      if (entity.stats && (entity.type === 'monster' || entity.type === 'boss')) {
        const attackCooldown = 1000;
        const timeSinceLastAttack = entity.lastAttackTime ? now - entity.lastAttackTime : attackCooldown;
        if (timeSinceLastAttack > attackCooldown - 300) {
          body.tint = 0xffaaaa;
        }
      }
    }
  }

  if (!isPlayer) {
    updateAttackIndicator(entity, container, now);
    updateHPBar(entity, container, player, entityId); 
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

function updateAttackIndicator(entity: Entity, container: PIXI.Container, now: number) {
  const indicator = container.getChildByName('attackIndicator') as PIXI.Text;
  if (!indicator || !entity.stats) return;

  const attackCooldown = 1000;
  const timeSinceLastAttack = entity.lastAttackTime ? now - entity.lastAttackTime : attackCooldown;
  const isTelegraphing = timeSinceLastAttack > attackCooldown - 300;
  indicator.visible = isTelegraphing;

  if (isTelegraphing) {
    // Pulse 애니메이션 (0.3초 동안 빠르게 커졌다 작아짐)
    const pulse = 1 + Math.sin(now / 50) * 0.2;
    indicator.scale.set(pulse);
  }
}

function updateHPBar(entity: Entity, container: PIXI.Container, player: any, entityId: string) {
  const hpBar = container.getChildByName('hpBar') as PIXI.Graphics;
  if (!hpBar || !entity.stats) return;

  const distToPlayer = Math.sqrt(Math.pow(player.pos.x - entity.x, 2) + Math.pow(player.pos.y - entity.y, 2));
  const shouldShowHP = entity.stats.hp < entity.stats.maxHp || distToPlayer < 8;

  hpBar.visible = shouldShowHP;
  if (!shouldShowHP) return;

  const entW = (entity.width || 1) * TILE_SIZE;
  const barW = entW * 0.9;
  const barH = 5; // 약간 더 슬림하게 조정
  const barX = (entW - barW) / 2;
  const currentRatio = Math.max(0, entity.stats.hp / entity.stats.maxHp);
  
  // 보간 로직: 시각적 HP가 실제 HP를 서서히 따라감 (Draining 효과)
  let visualRatio = visualHpMap.get(entityId) ?? currentRatio;
  if (visualRatio > currentRatio) {
    visualRatio -= (visualRatio - currentRatio) * 0.1; // 보간 속도
    if (visualRatio - currentRatio < 0.01) visualRatio = currentRatio;
  } else {
    visualRatio = currentRatio;
  }
  visualHpMap.set(entityId, visualRatio);

  hpBar.clear();
  
  // 1. 배경 (Black/Dark Zinc)
  // PIXI v8 문법: 경로를 먼저 그리고 영역을 채우거나 테두리를 입힙니다.
  hpBar.roundRect(barX - 1, -1, barW + 2, barH + 2, 4);
  hpBar.fill({ color: 0x09090b, alpha: 0.8 });
  hpBar.stroke({ color: 0xffffff, alpha: 0.1, width: 1 }); // 미세한 테두리

  // 2. 현재 체력 바 (Green/Yellow/Red)
  let color = 0x10b981; // Emerald-500
  if (currentRatio < 0.25) color = 0xef4444; // Rose-500
  else if (currentRatio < 0.5) color = 0xf59e0b; // Amber-500

  // 플레이어 체력바처럼 서서히 달도록 visualRatio를 width로 사용
  if (visualRatio > 0) {
    hpBar.roundRect(barX, 0, barW * visualRatio, barH, 2);
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
