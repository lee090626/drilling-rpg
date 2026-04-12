import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE, BASE_DEPTH, CAMERA_SCALE } from '@/shared/config/constants';
import { renderEntities } from './entityRenderer';
import { createHitFlashFilter, createRadialLightMask } from '../../lib/pixiEffects';
import { ID_TO_TILE_TYPE } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { getSafeTexture } from '@/shared/lib/assetUtils';

// Tile sprite cache (coordinate key -> Sprite)
const tileSpriteCache = new Map<string, PIXI.Sprite>();
const tilePool: PIXI.Sprite[] = [];

/**
 * System that renders all visual elements using PixiJS.
 */
export const renderSystem = (
  world: GameWorld, 
  app: PIXI.Application, 
  layers: {
    stage: PIXI.Container;
    tileLayer: PIXI.Container;
    staticLayer: PIXI.Container;
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
  const { stage, tileLayer, staticLayer, entityLayer, effectLayer, lightLayer, uiLayer } = layers;

  // 1. Camera Control (centering and shake)
  const shakeX = (Math.random() - 0.5) * shake * 2;
  const shakeY = (Math.random() - 0.5) * shake * 2;
  
  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;
  
  stage.scale.set(CAMERA_SCALE);
  stage.position.set(
    centerX - (player.visualPos.x * TILE_SIZE + TILE_SIZE / 2) * CAMERA_SCALE + shakeX,
    centerY - (player.visualPos.y * TILE_SIZE + TILE_SIZE / 2) * CAMERA_SCALE + shakeY
  );

  // 2. Tile Rendering (viewport optimization)
  const startTileX = Math.floor(player.visualPos.x - 20);
  const endTileX = Math.ceil(player.visualPos.x + 20);
  const startTileY = Math.floor(player.visualPos.y - 15);
  const endTileY = Math.ceil(player.visualPos.y + 15);

  const visibleTileKeys = new Set<string>();

  for (let y = startTileY; y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      let textureKey = '';
      let isBaseTile = false;

      // 1. Base Camp Layout (surface area)
      if (y >= 0 && y < BASE_DEPTH && world.baseLayout) {
        const row = world.baseLayout[y];
        if (row && x >= 0 && x < row.length) {
          const tileId = row[x];
          textureKey = `tile_base_${tileId}`;
          isBaseTile = true;
        }
      }

      // 2. Underground Tiles
      const tile = !isBaseTile ? tileMap.getTile(x, y) : null;
      if (!isBaseTile && (!tile || tile.type === 'empty')) continue;
      
      // Resolve texture key: mineralData의 tileImage를 우선 사용, 없으면 StoneTile 폴백
      const renderTextureKey = isBaseTile
        ? textureKey
        : (MINERALS.find(m => m.key === tile!.type)?.tileImage || 'StoneTile');
      
      const key = `${x},${y}_${renderTextureKey}`;
      visibleTileKeys.add(key);

      if (!tileSpriteCache.has(key)) {
        let sprite = tilePool.pop() || new PIXI.Sprite();
        // Use safe texture lookup with defined tileImage or default fallback
        sprite.texture = getSafeTexture(textures, renderTextureKey as string, 'StoneTile');
        sprite.width = TILE_SIZE;
        sprite.height = TILE_SIZE;
        sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
        sprite.visible = true;
        
        tileLayer.addChild(sprite);
        tileSpriteCache.set(key, sprite);
      }
    }
  }

  // Pooled sprite recycling
  for (const [key, sprite] of tileSpriteCache.entries()) {
    if (!visibleTileKeys.has(key)) {
      tileLayer.removeChild(sprite);
      tilePool.push(sprite);
      tileSpriteCache.delete(key);
    }
  }

  // Main render pass
  renderEntities(world, layers, now, textures);
  updateDroppedItems(world, layers, textures);
  updateMiningTarget(world, layers);
  updateParticlesAndTexts(world, layers);
  updateLighting(world, layers, app, now, lightingFilter);
};

const particleSpritePool: PIXI.Graphics[] = [];
const activeParticleSprites = new Map<any, PIXI.Graphics>();
const textSpritePool: PIXI.Text[] = [];
const activeTextSprites = new Map<any, PIXI.Text>();

function updateParticlesAndTexts(world: GameWorld, layers: any) {
  const { effectLayer } = layers;
  const { particles, floatingTexts } = world;

  // Particles
  const pPool = world.particlePool.getPool();
  for (let i = 0; i < pPool.length; i++) {
    const p = pPool[i];
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
  }

  // Floating Texts
  const ftPool = world.floatingTextPool.getPool();
  for (let i = 0; i < ftPool.length; i++) {
    const ft = ftPool[i];
    let sprite = activeTextSprites.get(ft);
    if (ft.active) {
      const isCrit = ft.text.includes('Crit');
      const isGold = ft.text.includes('G') || ft.color === '#fbbf24';
      const isBlock = ft.text === 'BLOCK!';
      
      if (!sprite) {
        sprite = textSpritePool.pop() || new PIXI.Text({ text: ft.text });
        sprite.style.fontFamily = 'Russo One';
        sprite.style.fontWeight = '900';
        sprite.style.align = 'center';
        sprite.anchor.set(0.5, 0.5);
        effectLayer.addChild(sprite);
        activeTextSprites.set(ft, sprite);
      }
      
      sprite.text = ft.text;
      
      if (isCrit) {
        sprite.style.fill = 0xf87171;
        sprite.style.fontSize = 28;
        sprite.style.stroke = { color: 0x000000, width: 4 };
        sprite.style.dropShadow = { alpha: 0.6, blur: 5, color: 0x000000, distance: 4, angle: Math.PI / 6 };
      } else if (isGold) {
        sprite.style.fill = 0xfacc15;
        sprite.style.fontSize = 20;
        sprite.style.stroke = { color: 0x422006, width: 3 };
        sprite.style.dropShadow = { alpha: 0.4, blur: 3, color: 0x000000, distance: 2, angle: Math.PI / 6 };
      } else if (isBlock) {
        sprite.style.fill = 0x3b82f6;
        sprite.style.fontSize = 22;
        sprite.style.stroke = { color: 0x1e3a8a, width: 3 };
        sprite.style.dropShadow = { alpha: 0.3, blur: 2, color: 0x000000, distance: 2, angle: Math.PI / 6 };
      } else {
        sprite.style.fill = 0xffffff;
        sprite.style.fontSize = 18;
        sprite.style.stroke = { color: 0x000000, width: 3 };
        sprite.style.dropShadow = false;
      }
      
      sprite.alpha = ft.life;
      sprite.position.set(ft.x, ft.y);
      
      const t = 1.0 - ft.life;
      const pop = Math.sin(t * Math.PI) * 0.4;
      const scale = (0.8 + pop) * (isCrit ? 1.5 : 1);
      sprite.scale.set(scale);
    } else if (sprite) {
      effectLayer.removeChild(sprite);
      textSpritePool.push(sprite);
      activeTextSprites.delete(ft);
    }
  }
}

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

    targetRect
      .rect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2)
      .fill({ color: 0xef4444, alpha: 0.15 })
      .stroke({ color: 0xef4444, width: 2, alignment: 0 });

    if (hasTileHealth) {
      const barW = TILE_SIZE - 12;
      const barH = 6;
      const barX = tx + 6;
      const barY = ty + TILE_SIZE - barH - 4;
      
      const ratio = Math.max(0, Math.min(1, tile.health / tile.maxHealth));

      // Healthbar background
      targetRect
        .roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2)
        .fill({ color: 0x09090b, alpha: 0.8 })
        .stroke({ color: 0xffffff, alpha: 0.3, width: 1, alignment: 0 });

      // Healthbar fill
      if (ratio > 0) {
        let hpColor = 0x10b981;
        if (ratio < 0.25) hpColor = 0xef4444;
        else if (ratio < 0.5) hpColor = 0xf59e0b;

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

const itemSpriteMap = new Map<number, PIXI.Sprite>();

function updateDroppedItems(world: GameWorld, layers: any, textures: any) {
  const { effectLayer } = layers;
  const dp = world.droppedItemPool;
  
  // Track currently active IDs from pool for sync
  const activeIds = new Set<number>();
  for (let i = 0; i < dp.capacity; i++) {
    if (dp.active[i]) {
      const id = (dp.generation[i] << 16) | i;
      activeIds.add(id);
      
      let sprite = itemSpriteMap.get(id);
      if (!sprite) {
        const type = ID_TO_TILE_TYPE[dp.typeId[i]];
        const mineral = MINERALS.find(m => m.key === type);
        const iconKey = mineral?.image || `${type}_icon`;
        
        const texture = getSafeTexture(textures, iconKey as string, 'StoneTile');
        sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        const itemSize = TILE_SIZE * 0.5;
        sprite.width = itemSize;
        sprite.height = itemSize;
        effectLayer.addChild(sprite);
        itemSpriteMap.set(id, sprite);
      }
      sprite.position.set(dp.x[i], dp.y[i]);
    }
  }

  // Remove sprites for inactive IDs
  for (const [id, sprite] of itemSpriteMap.entries()) {
    if (!activeIds.has(id)) {
      effectLayer.removeChild(sprite);
      sprite.destroy();
      itemSpriteMap.delete(id);
    }
  }
}

function updateLighting(world: GameWorld, layers: any, app: PIXI.Application, now: number, lightingFilter: any) {
  if (!lightingFilter) return;

  const { player } = world;
  const lights: number[] = [];
  
  // 1. Player light
  const flicker = Math.sin(now / 150) * 3;
  lights.push(
    player.visualPos.x * TILE_SIZE + TILE_SIZE / 2, 
    player.visualPos.y * TILE_SIZE + TILE_SIZE / 2, 
    TILE_SIZE * 5.5 + flicker, 
    1.0
  );

  // 2. Environmental lights
  const dp = world.droppedItemPool;
  for (let i = 0; i < dp.capacity; i++) {
    if (dp.active[i] && lights.length < 64) {
      const type = ID_TO_TILE_TYPE[dp.typeId[i]];
      if (type === 'goldstone' || type === 'luststone') {
        lights.push(dp.x[i], dp.y[i], TILE_SIZE * 2, 0.5);
      }
    }
  }

  const depthFactor = Math.min(1.0, player.stats.depth / 800);
  const darkness = 0.45 + (depthFactor * 0.5);

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
