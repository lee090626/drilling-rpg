import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE, BASE_DEPTH, CAMERA_SCALE } from '@/shared/config/constants';
import { renderEntities } from './entityRenderer';
import { createHitFlashFilter, createRadialLightMask } from '../../lib/pixiEffects';

// 타일 스프라이트 캐시 (좌표키 -> Sprite)
const tileSpriteCache = new Map<string, PIXI.Sprite>();
const tilePool: PIXI.Sprite[] = [];

/**
 * PixiJS를 사용하여 게임의 모든 시각적 요소를 화면에 그리는 시스템입니다.
 */
export const renderSystem = (
  world: GameWorld, 
  app: PIXI.Application, 
  layers: {
    stage: PIXI.Container;
    tileLayer: PIXI.Container;
    entityLayer: PIXI.Container;
    effectLayer: PIXI.Container;
    lightLayer: PIXI.Container;
    uiLayer: PIXI.Container;
  }, 
  now: number,
  textures: { [key: string]: PIXI.Texture },
  lightingFilter: any | null = null
) => {
  const { player, tileMap, entities, assets, shake } = world;
  const { stage, tileLayer, entityLayer, effectLayer, lightLayer, uiLayer } = layers;

  // 1. 카메라 제어 (중앙 정렬 및 셰이크 효과)
  const shakeX = (Math.random() - 0.5) * shake * 2;
  const shakeY = (Math.random() - 0.5) * shake * 2;
  
  // Pixi 스테이지 좌표 업데이트 (중앙 정렬 방식)
  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;
  
  stage.scale.set(CAMERA_SCALE);
  stage.position.set(
    centerX - (player.visualPos.x * TILE_SIZE + TILE_SIZE / 2) * CAMERA_SCALE + shakeX,
    centerY - (player.visualPos.y * TILE_SIZE + TILE_SIZE / 2) * CAMERA_SCALE + shakeY
  );

  // 2. 타일 렌더링 (뷰포트 최적화)
  const startTileX = Math.floor(player.visualPos.x - 15);
  const endTileX = Math.ceil(player.visualPos.x + 15);
  const startTileY = Math.floor(player.visualPos.y - 12);
  const endTileY = Math.ceil(player.visualPos.y + 12);

  // 현재 화면에 필요한 타일 키 세트
  const visibleTileKeys = new Set<string>();

  for (let y = startTileY; y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      let textureKey = '';
      let isBaseTile = false;

      // 1. 베이스 캠프 레이아웃 렌더링 (지상 영역)
      if (y >= 0 && y < BASE_DEPTH && world.baseLayout) {
        const row = world.baseLayout[y];
        // x 좌표 보정: baseLayout이 0부터 시작한다고 가정 (width: 30)
        if (row && x >= 0 && x < row.length) {
          const tileId = row[x];
          textureKey = `tile_base_${tileId}`;
          isBaseTile = true;
        }
      }

      // 2. 지하 타일 또는 베이스 캠프 타일 결정
      const tile = !isBaseTile ? tileMap.getTile(x, y) : null;
      if (!isBaseTile && (!tile || tile.type === 'empty')) continue;
      
      const renderTextureKey = isBaseTile ? textureKey : `tile_${tile!.type}`;
      const key = `${x},${y}_${renderTextureKey}`;
      visibleTileKeys.add(key);

      if (!tileSpriteCache.has(key)) {
        // 풀에서 가져오거나 새로 생성
        let sprite = tilePool.pop() || new PIXI.Sprite();
        sprite.texture = textures[renderTextureKey] || PIXI.Texture.WHITE;
        sprite.width = TILE_SIZE;
        sprite.height = TILE_SIZE;
        sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
        sprite.visible = true;
        
        tileLayer.addChild(sprite);
        tileSpriteCache.set(key, sprite);
      }
    }
  }

  // 화면 밖으로 나간 타일 스프라이트 회수 (Pooling)
  for (const [key, sprite] of tileSpriteCache.entries()) {
    if (!visibleTileKeys.has(key)) {
      tileLayer.removeChild(sprite);
      tilePool.push(sprite);
      tileSpriteCache.delete(key);
    }
  }

  // 0. 플레이어 및 일반 엔티티 렌더링
  renderEntities(world, layers, now, textures);
  updateMiningTarget(world, layers);
  updateParticlesAndTexts(world, layers);

  // 5. 동적 조명 효과 (LightingFilter GPU 처리)
  updateLighting(world, layers, app, now, lightingFilter);
};

/**
 * 파티클 및 플로팅 텍스트 업데이트
 */
const particleSpritePool: PIXI.Graphics[] = [];
const activeParticleSprites = new Map<any, PIXI.Graphics>();
const textSpritePool: PIXI.Text[] = [];
const activeTextSprites = new Map<any, PIXI.Text>();

function updateParticlesAndTexts(world: GameWorld, layers: any) {
  const { effectLayer } = layers;
  const { particles, floatingTexts } = world;

  // 파티클 처리
  particles.forEach((p, i) => {
    let sprite = activeParticleSprites.get(p);
    if (p.active) {
      if (!sprite) {
        sprite = particleSpritePool.pop() || new PIXI.Graphics();
        effectLayer.addChild(sprite);
        activeParticleSprites.set(p, sprite);
      }
      sprite.clear();
      sprite.fill({ color: p.color, alpha: p.life });
      sprite.rect(0, 0, p.size, p.size);
      sprite.position.set(p.x, p.y);
    } else if (sprite) {
      effectLayer.removeChild(sprite);
      particleSpritePool.push(sprite);
      activeParticleSprites.delete(p);
    }
  });

  // 플로팅 텍스트 처리
  floatingTexts.forEach((ft, i) => {
    let sprite = activeTextSprites.get(ft);
    if (ft.active) {
      if (!sprite) {
        sprite = textSpritePool.pop() || new PIXI.Text({ text: ft.text, style: { fontSize: 16, fill: 0xffffff, fontWeight: 'bold' } });
        sprite.anchor.set(0.5, 0.5);
        effectLayer.addChild(sprite);
        activeTextSprites.set(ft, sprite);
      }
      sprite.text = ft.text;
      sprite.style.fill = ft.color;
      sprite.alpha = ft.life;
      sprite.position.set(ft.x, ft.y);
      sprite.scale.set(0.5 + ft.life * 0.5);
    } else if (sprite) {
      effectLayer.removeChild(sprite);
      textSpritePool.push(sprite);
      activeTextSprites.delete(ft);
    }
  });
}

/**
 * 채굴 타겟팅 표시 업데이트
 */
function updateMiningTarget(world: GameWorld, layers: any) {
  const { uiLayer } = layers;
  const { intent, tileMap } = world;
  
  let targetRect = uiLayer.getChildByLabel('miningTarget') as PIXI.Graphics;
  
  if (intent.miningTarget && !targetRect) {
    targetRect = new PIXI.Graphics();
    targetRect.label = 'miningTarget';
    uiLayer.addChild(targetRect);
  }
  
  if (intent.miningTarget) {
    const tx = intent.miningTarget.x * TILE_SIZE;
    const ty = intent.miningTarget.y * TILE_SIZE;
    
    targetRect.clear();

    const tile = tileMap.getTile(intent.miningTarget.x, intent.miningTarget.y);
    const hasTileHealth = tile && tile.maxHealth > 0 && tile.type !== 'empty' && tile.type !== 'wall' && tile.type !== 'portal';

    // Pixi v8 표준 순서: 도형 선언 -> 스타일(선/면) 적용
    targetRect
      .rect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2)
      .fill({ color: 0xef4444, alpha: 0.15 })
      .stroke({ color: 0xef4444, width: 2, alignment: 0 });

    if (hasTileHealth) {
      // 체력바 렌더링 (대상 타일 하단)
      const barW = TILE_SIZE - 12;
      const barH = 6;
      const barX = tx + 6;
      const barY = ty + TILE_SIZE - barH - 4;
      
      const ratio = Math.max(0, Math.min(1, tile.health / tile.maxHealth));

      // 체력바 배경
      targetRect
        .roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2)
        .fill({ color: 0x09090b, alpha: 0.8 })
        .stroke({ color: 0xffffff, alpha: 0.3, width: 1, alignment: 0 });

      // 체력바 본체
      if (ratio > 0) {
        let hpColor = 0x10b981; // Emerald
        if (ratio < 0.25) hpColor = 0xef4444; // Rose
        else if (ratio < 0.5) hpColor = 0xf59e0b; // Amber

        targetRect
          .roundRect(barX, barY, barW * ratio, barH, 1)
          .fill({ color: hpColor });
      }
    }
    
    targetRect.visible = true;
  } else if (targetRect) {
    targetRect.visible = false;
  }
}

/**
 * 드랍된 아이템 렌더링 업데이트
 */
const itemSpriteMap = new Map<number, PIXI.Sprite>();

function updateDroppedItems(world: GameWorld, layers: any, textures: any) {
  const { effectLayer } = layers;
  const { droppedItems } = world;
  
  const currentItemIds = new Set(droppedItems.map(item => (item as any).id || (item.x + item.y))); // 임시 ID

  // 기존 스프라이트 중 더 이상 존재하지 않는 아이템 제거
  for (const [id, sprite] of itemSpriteMap.entries()) {
    if (!currentItemIds.has(id)) {
      effectLayer.removeChild(sprite);
      sprite.destroy();
      itemSpriteMap.delete(id);
    }
  }

  droppedItems.forEach(item => {
    const id = (item as any).id || (item.x + item.y);
    let sprite = itemSpriteMap.get(id);
    
    if (!sprite) {
      const texture = textures[`item_${item.type}`] || PIXI.Texture.WHITE;
      sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5, 0.5);
      sprite.width = 30;
      sprite.height = 30;
      effectLayer.addChild(sprite);
      itemSpriteMap.set(id, sprite);
    }
    
    sprite.position.set(item.x, item.y);
  });
}

/**
 * [PixiJS v8] GPU 기반의 고성능 동적 조명 시스템
 */
function updateLighting(world: GameWorld, layers: any, app: PIXI.Application, now: number, lightingFilter: any) {
  if (!lightingFilter) return;

  const { player, droppedItems } = world;
  const TILE_SIZE = 60; // TODO: 상수 연동

  // 조광 계산을 위한 광원 데이터 수집 (Max 16)
  const lights: number[] = [];
  
  // 1. 플레이어 조명
  const flicker = Math.sin(now / 150) * 3;
  lights.push(
    player.visualPos.x * TILE_SIZE + TILE_SIZE / 2, 
    player.visualPos.y * TILE_SIZE + TILE_SIZE / 2, 
    TILE_SIZE * 5.5 + flicker, 
    1.0 // Intensity
  );

  // 2. 주변 환경 광원 (드랍된 아이템 등 - 예: 용암 파편)
  droppedItems.forEach(item => {
    if (lights.length < 64 && (item.type === 'iron' || item.type === 'gold')) { // TEMP: 예시 광원
        lights.push(item.x, item.y, TILE_SIZE * 2, 0.5);
    }
  });

  // 어둠 농도 계산 (깊이에 따라 깊어짐)
  const depthFactor = Math.min(1.0, player.stats.depth / 800);
  const darkness = 0.45 + (depthFactor * 0.5);

  // 필터 유니폼 업데이트
  lightingFilter.updateUniforms(
    darkness,
    layers.stage.scale.x,
    player.visualPos.x * TILE_SIZE + TILE_SIZE / 2,
    player.visualPos.y * TILE_SIZE + TILE_SIZE / 2,
    app.screen.width,
    app.screen.height,
    lights
  );
}
