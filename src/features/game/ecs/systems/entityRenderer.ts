import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { Entity } from '@/shared/types/game';
import { TILE_SIZE } from '@/shared/config/constants';

import { MONSTERS } from '@/shared/config/monsterData';

/**
 * 엔티티별 Pixi 컨테이너 캐시 (ID -> Container)
 */
const entityContainerMap = new Map<string, PIXI.Container>();
const staticContainerMap = new Map<string, PIXI.Container>();
const visualHpMap = new Map<string, number>(); // 이전 프레임의 HP 비율 캐시 (애니메이션용)

/**
 * 엔티티 컨테이너 풀 (객체 재사용)
 */
const entityPool: PIXI.Container[] = [];
const visualHpCache = new Float32Array(5000); // 인덱스별 시각적 HP 보간값

export const renderEntities = (
  world: GameWorld, 
  layers: { staticLayer: PIXI.Container; entityLayer: PIXI.Container; effectLayer: PIXI.Container }, 
  now: number,
  textures: { [key: string]: PIXI.Texture }
) => {
  const { entities, player } = world;
  const { staticLayer, entityLayer } = layers;
  const { soa } = entities;

  // 1. 플레이어 렌더링
  let playerContainer = entityContainerMap.get('player');
  if (!playerContainer) {
    playerContainer = createEntityContainer({ type: 'player', width: 1, height: 1 }, textures, 'player');
    entityLayer.addChild(playerContainer);
    entityContainerMap.set('player', playerContainer);
  }
  updateEntitySpriteByIndex(world, 'player', player, playerContainer, now, textures);

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

  // 3. 정적 NPC 및 오브젝트 렌더링
  if (world.staticEntities) {
    for (let i = 0; i < world.staticEntities.length; i++) {
      const staticEntity = world.staticEntities[i];
      let staticContainer = staticContainerMap.get(staticEntity.id);
      if (!staticContainer) {
        staticContainer = createEntityContainer(staticEntity, textures);
        staticLayer.addChild(staticContainer);
        staticContainerMap.set(staticEntity.id, staticContainer);
      }
      updateEntitySpriteByIndex(world, i, staticEntity, staticContainer, now, textures);
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

  // 위치 동기화 (소환 시 이미 픽셀 좌표이므로 그대로 사용)
  container.x = ex;
  container.y = ey;

  // 텍스처 및 색상 업데이트
  const body = container.getChildByLabel('body') as PIXI.Sprite;
  if (body) {
    // 몬스터 종류에 따른 텍스처 교체 (SoA 인덱스 활용)
    const defIdx = soa.monsterDefIndex[idx];
    const mobDef = MONSTERS[defIdx];

    if (mobDef) {
        const texture = textures[mobDef.imagePath] || PIXI.Texture.WHITE;
        body.tint = 0xffffff;
        
        if (body.texture !== texture) {
            body.texture = texture;
            body.width = ew;
            body.height = eh;
        }
    } else if (type === 5) { // Projectile
        // 투사체 전용 시각 효과
        body.texture = textures['Fireball.png'] || textures['Fireball'] || PIXI.Texture.WHITE;
        if (body.texture === PIXI.Texture.WHITE) {
          body.tint = 0xffaa00; // 텍스처 없을 시 주황색 틴트
        } else {
          body.tint = 0xffffff;
        }
        body.width = ew;
        body.height = eh;
        
        // 투사체 회전 (진행 방향 루틴)
        const angle = Math.atan2(soa.vy[idx], soa.vx[idx]);
        body.rotation = angle + Math.PI / 2;
        body.anchor.set(0.5, 0.5);
        body.position.set(ew / 2, eh / 2);
    }

    // 피격 효과 (Hit Flash)
    const lastHit = 0; 
    const isHit = now - lastHit < 100;
    body.alpha = isHit ? 0.7 : 1.0;
  }

  // 4. 보스 특수 애니메이션 (Jump & Fall)
  if (type === 2) {
    const jumpState = soa.state[idx];
    let yOffset = 0;
    const cycleTime = 1000; // Jump/Fall 각각 1초 기준
    const elapsed = now % cycleTime;
    
    if (jumpState === 2) { // Jump
      yOffset = -(elapsed / cycleTime) * 400; // 수직으로 400px 상승
    } else if (jumpState === 3) { // Fall
      yOffset = -400 + (elapsed / cycleTime) * 400; // 수직으로 400px 하강
    }

    body.y = yOffset;

    // 그림자 표시 (공중에 있을 때만)
    let shadow = container.getChildByLabel('shadow') as PIXI.Graphics;
    if (yOffset < -10) {
      if (!shadow) {
        shadow = new PIXI.Graphics().ellipse(ew / 2, eh, ew / 2, eh / 4).fill({ color: 0x000000, alpha: 0.3 });
        shadow.label = 'shadow';
        container.addChildAt(shadow, 0);
      }
      shadow.visible = true;
      shadow.scale.set(1 + yOffset / 800); // 높이 올라갈수록 작아짐
    } else if (shadow) {
      shadow.visible = false;
    }
  }

  // 5. 상태 이상 VFX (STUN)
  updateStatusVFX(container, player.stats.activeEffects || [], ew, eh, now);

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
 * 플레이어 및 정적 엔티티 전용 업데이트
 */
function updateEntitySpriteByIndex(world: GameWorld, idx: number | string, entity: any, container: PIXI.Container, now: number, textures: any) {
  const isPlayer = entity.visualPos !== undefined;
  
  // 1. 위치 동기화
  const targetX = isPlayer ? entity.visualPos.x : entity.x;
  const targetY = isPlayer ? entity.visualPos.y : entity.y;
  container.x = targetX * TILE_SIZE;
  container.y = targetY * TILE_SIZE;
  
  const body = container.getChildByLabel('body') as PIXI.Sprite;
  if (!body) return;

  // 2. 피격 효과 ( Hit Flash )
  const isHit = now - (entity.lastHitTime || 0) < 100;
  body.alpha = isHit ? 0.7 : 1.0;

  // 3. 플레이어 전용 절차적 애니메이션
  if (isPlayer) {
    const isDrilling = entity.isDrilling;
    const dx = entity.pos.x - entity.visualPos.x;
    const dy = entity.pos.y - entity.visualPos.y;
    const isMoving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

    // 초기 설정: Pivot을 중앙 하단으로 설정하여 바운스 효과 최적화
    if (body.anchor.y !== 1) {
      body.anchor.set(0.5, 1);
      body.position.set(TILE_SIZE / 2, TILE_SIZE);
    }

    // 기본 축척 계산 (TILE_SIZE에 맞춤)
    const baseScaleX = TILE_SIZE / (body.texture.width || TILE_SIZE);
    const baseScaleY = TILE_SIZE / (body.texture.height || TILE_SIZE);
    
    // 기본 값 복구
    body.rotation = 0;

    const pContainer = container as any;
    if (pContainer.lastFlip === undefined) pContainer.lastFlip = 1;

    if (isDrilling) {
      // 채굴 중: 고주파 진동 (Jitter)
      const jitterX = (Math.random() - 0.5) * 4;
      const jitterY = (Math.random() - 0.5) * 4;
      body.position.set(TILE_SIZE / 2 + jitterX, TILE_SIZE + jitterY);
      
      // 약간의 스쿼시 효과
      const sX = 1.05 + Math.sin(now / 30) * 0.05;
      const sY = 0.95 + Math.sin(now / 30) * 0.05;
      body.scale.set(baseScaleX * sX * pContainer.lastFlip, baseScaleY * sY);
    } 
    else if (isMoving) {
      // 이동 중: 통통 튀는 효과 (Bounce) 및 기울기 (Tilt)
      const bounce = Math.abs(Math.sin(now / 150)) * 0.15;
      const sX = 1 + bounce * 0.5;
      const sY = 1 - bounce;
      
      const tilt = Math.sin(now / 150) * 0.1;
      body.rotation = tilt;

      // 이동 방향에 따른 좌우 반전 (Flip) - 입력 의도(Intent) 우선 판정
      if (world.intent.moveX !== 0) {
        pContainer.lastFlip = world.intent.moveX > 0 ? 1 : -1;
      } else if (Math.abs(dx) > 0.1) {
        pContainer.lastFlip = dx < 0 ? -1 : 1;
      }
      
      body.scale.set(baseScaleX * sX * pContainer.lastFlip, baseScaleY * sY);
      body.position.set(TILE_SIZE / 2, TILE_SIZE);
    } 
    else {
      // 정지 중: 호흡 효과 (Idle Breathing) 및 방향 유지
      const brew = Math.sin(now / 600) * 0.03;
      body.scale.set(baseScaleX * (1 + brew) * pContainer.lastFlip, baseScaleY * (1 - brew));
      body.position.set(TILE_SIZE / 2, TILE_SIZE);
    }

    // 4. 상태 이상 VFX (STUN 등)
    updateStatusVFX(container, entity.stats.activeEffects || [], TILE_SIZE, TILE_SIZE, now);
  }
}

/**
 * 상태 이상 시각 효과(VFX) 렌더링
 */
function updateStatusVFX(container: PIXI.Container, effects: any[], width: number, height: number, now: number) {
  const isStunned = effects.some(e => e.type === 'STUN');
  let stunVFX = container.getChildByLabel('stunVFX') as PIXI.Container;

  if (isStunned) {
    if (!stunVFX) {
      stunVFX = new PIXI.Container();
      stunVFX.label = 'stunVFX';
      stunVFX.y = -TILE_SIZE * 0.4; // 20 -> TILE_SIZE 기준 비례
      
      // 3개의 작은 별 생성
      for (let i = 0; i < 3; i++) {
        const star = new PIXI.Text({ text: '⭐', style: { fontSize: 14 } });
        star.anchor.set(0.5, 0.5);
        star.label = `star_${i}`;
        stunVFX.addChild(star);
      }
      container.addChild(stunVFX);
    }
    stunVFX.visible = true;
    
    // 별 공전 애니메이션
    stunVFX.children.forEach((star, i) => {
      const angle = (now / 200) + (i * (Math.PI * 2 / 3));
      star.x = (width / 2) + Math.cos(angle) * 20;
      star.y = Math.sin(angle) * 8;
    });
  } else if (stunVFX) {
    stunVFX.visible = false;
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
    emojiText.label = 'body';
    emojiText.anchor.set(0.5, 0.5);
    emojiText.position.set(entW / 2, entH / 2);
    container.addChild(emojiText);
  } else {
    const texture = textures[textureKey] || PIXI.Texture.WHITE;
    const sprite = new PIXI.Sprite(texture);
    sprite.label = 'body';
    sprite.width = entW;
    sprite.height = entH;
    
    if (!textureKey && !forceTextureKey) {
      sprite.tint = entity.type === 'monster' ? 0xef4444 : 0xeab308;
    }
    container.addChild(sprite);
  }

  if (!isPlayer) {
    const hpBar = new PIXI.Graphics();
    hpBar.label = 'hpBar';
    
    // 투사체는 체력바 제외
    if (entity.type === 'projectile') {
      hpBar.visible = false;
    }
    
    container.addChild(hpBar);

    if (entity.type === 'boss') {
      const nameTag = new PIXI.Text({
        text: entity.name, 
        style: { fontSize: 14, fill: 0xffffff, fontWeight: 'bold', stroke: { color: 0x000000, width: 2 } }
      });
      nameTag.label = 'nameTag';
      nameTag.anchor.set(0.5, 0.5);
      nameTag.position.set(entW / 2, -18); // 머리 위로 더 가깝게
      container.addChild(nameTag);
    }

    const indicator = new PIXI.Text({
      text: '!', 
      style: { fontSize: 28, fill: 0xff0000, fontWeight: '900', stroke: { color: 0xffffff, width: 3 } }
    });
    indicator.label = 'attackIndicator';
    indicator.anchor.set(0.5, 0.5);
    indicator.position.set(entW / 2, -14); // 머리 위로 더 가깝게
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
  const indicator = container.getChildByLabel('attackIndicator') as PIXI.Text;
  if (!indicator) return;

  const attackCooldown = soa.attackCooldown[idx]; // SoA에서 개별 쿨타임 읽기
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
  const hpBar = container.getChildByLabel('hpBar') as PIXI.Graphics;
  if (!hpBar) return;

  const ex = soa.x[idx];
  const ey = soa.y[idx];
  const hp = soa.hp[idx];
  const maxHp = soa.maxHp[idx];
  const entW = soa.width[idx] || TILE_SIZE;
  const entH = soa.height[idx] || TILE_SIZE;

  // 플레이어와의 거리에 따라 표시 여부 결정 (가까이 있거나 데미지를 입었을 때만)
  const dx = player.pos.x * TILE_SIZE - ex;
  const dy = player.pos.y * TILE_SIZE - ey;
  const distSq = dx * dx + dy * dy;
  const shouldShowHP = hp < maxHp || distSq < (TILE_SIZE * 8) * (TILE_SIZE * 8);

  hpBar.visible = shouldShowHP;
  if (!shouldShowHP) return;

  // 광물 채굴 UI 스타일과 동일하게 구성 (하단 배치)
  const barW = entW - 12;
  const barH = 6;
  const barX = 6;
  const barY = entH - barH - 4; // 타일 하단에서 4px 위
  const currentRatio = Math.max(0, Math.min(1, hp / maxHp));
  
  hpBar.clear();
  
  // 체력바 배경 (광물 스타일 재사용)
  hpBar
    .roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2)
    .fill({ color: 0x09090b, alpha: 0.8 })
    .stroke({ color: 0xffffff, alpha: 0.3, width: 1, alignment: 0 });

  if (currentRatio > 0) {
    let hpColor = 0x10b981; // Emerald
    if (currentRatio < 0.25) hpColor = 0xef4444; // Rose
    else if (currentRatio < 0.5) hpColor = 0xf59e0b; // Amber

    hpBar
      .roundRect(barX, barY, barW * currentRatio, barH, 1)
      .fill({ color: hpColor });
  }
}

// [삭제됨] updateDrone — 드론 시스템 제거됨
