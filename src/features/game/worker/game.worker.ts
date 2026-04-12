import { createInitialWorld, GameWorld } from '@/entities/world/model';
import * as PIXI from 'pixi.js';
import { LightingFilter } from '@/features/game/lib/LightingFilter';
import { GameLoop } from '@/features/game/ecs/systems/GameLoop';
import { handlePlayerAction } from '@/features/game/ecs/systems/ActionSystem';

// PixiJS v8 Web Worker adapter setup
PIXI.DOMAdapter.set(PIXI.WebWorkerAdapter);

/**
 * GameEngineInstance class
 * Handles dependency injection and message routing within the worker.
 */
class GameEngineInstance {
  world: GameWorld;
  pixiApp: PIXI.Application | null = null;
  
  // Pixi layer structure
  layers: {
    stage: PIXI.Container;
    tileLayer: PIXI.Container;
    staticLayer: PIXI.Container;
    entityLayer: PIXI.Container;
    effectLayer: PIXI.Container;
    uiLayer: PIXI.Container;
    lightLayer: PIXI.Container;
  } | null = null;
  
  textures: { [key: string]: PIXI.Texture } = {};
  lightingFilter: LightingFilter | null = null;
  
  private readonly BUFFER_SIZE = (16 + 5000 * 8) * 4;
  bufferPool: ArrayBuffer[] = [];

  private gameLoop: GameLoop | null = null;

  constructor() {
    this.world = createInitialWorld(12345);
    for (let i = 0; i < 3; i++) {
      this.bufferPool.push(new ArrayBuffer(this.BUFFER_SIZE));
    }
  }

  /** Initialize Pixi with new OffscreenCanvas */
  async setCanvas(newCanvas: OffscreenCanvas) {
    if (this.pixiApp) {
      this.pixiApp.destroy(true, { children: true, texture: true });
    }

    this.pixiApp = new PIXI.Application();
    await this.pixiApp.init({
      canvas: newCanvas,
      width: newCanvas.width,
      height: newCanvas.height,
      backgroundAlpha: 0,
      antialias: true,
      preference: 'webgl'
    });

    const stage = new PIXI.Container();
    const tileLayer = new PIXI.Container();
    const staticLayer = new PIXI.Container();
    const entityLayer = new PIXI.Container();
    const effectLayer = new PIXI.Container();
    const lightLayer = new PIXI.Container();
    const uiLayer = new PIXI.Container();

    stage.addChild(tileLayer);
    stage.addChild(staticLayer);
    stage.addChild(entityLayer);
    stage.addChild(effectLayer);
    stage.addChild(lightLayer);
    stage.addChild(uiLayer);

    this.pixiApp.stage.addChild(stage);
    
    this.lightingFilter = new LightingFilter();
    stage.filters = [this.lightingFilter];

    this.layers = { stage, tileLayer, staticLayer, entityLayer, effectLayer, lightLayer, uiLayer };

    if (this.gameLoop) {
      this.gameLoop.updateDependencies(this.world, this.pixiApp, this.layers, this.textures, this.lightingFilter);
    }
  }

  returnBuffer(buffer: ArrayBuffer) {
    this.bufferPool.push(buffer);
  }

  async init(payload: any) {
    const seed = payload.seed || 12345;
    const currentAssets = this.world.assets;
    const currentLayout = this.world.baseLayout;
    const currentStaticEntities = this.world.staticEntities;

    this.world = createInitialWorld(seed);
    this.world.assets = currentAssets;
    this.world.baseLayout = currentLayout;
    this.world.staticEntities = currentStaticEntities;

    if (payload.saveData) {
      const { stats, position, tileMap, tileMapData } = payload.saveData;
      this.world.player.stats = stats;
      this.world.player.pos = position;
      this.world.player.visualPos = { ...position };
      
      if (tileMapData) {
        // Decode base64 to ArrayBuffer within worker thread
        const binary = atob(tileMapData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        this.world.tileMap.deserializeFromBuffer(bytes.buffer, stats.mapSeed, stats.dimension);
      } else if (tileMap) {
        // Legacy object support
        this.world.tileMap.deserialize(tileMap, stats.mapSeed, stats.dimension);
      }
    }

    if (payload.offscreen) {
      await this.setCanvas(payload.offscreen);
    }

    if (!this.gameLoop) {
      this.gameLoop = new GameLoop(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
        this.bufferPool
      );
      this.gameLoop.start();
      self.postMessage({ type: 'ENGINE_READY' });
    } else {
      this.gameLoop.updateDependencies(this.world, this.pixiApp, this.layers, this.textures, this.lightingFilter);
    }
  }

  async updateAssetsFromAtlas(payload: any) {
    if (!this.world) return;
    const { atlasData, layout, entities } = payload;
    
    this.world.baseLayout = layout;
    this.world.staticEntities = entities;

    for (const atlas of atlasData) {
      const { json, bitmap } = atlas;
      const baseTexture = PIXI.Texture.from(bitmap as any);
      
      const spritesheet = new PIXI.Spritesheet(baseTexture, json);
      await spritesheet.parse();

      for (const [name, texture] of Object.entries(spritesheet.textures)) {
        // 원본 파일명 그대로 등록 (PascalCase 유지)
        this.textures[name] = texture;
        
        // 확장자만 제거한 키로도 등록 (예: "CrimsonStoneTile.png" → "CrimsonStoneTile")
        const cleanName = name.replace(/\.(png|webp)$/i, '');
        this.textures[cleanName] = texture;

        if (name === 'Player.png') this.textures['player'] = texture;
        if (name === 'BaseTileset.png') {
          this.textures['tileset'] = texture;
          this.textures['baseTileset'] = texture;

          const TILE_SIZE_RAW = 128;
          const COLUMNS = 5;
          const rows = Math.floor(texture.height / TILE_SIZE_RAW);
          
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < COLUMNS; col++) {
              const id = row * COLUMNS + col;
              this.textures[`tile_base_${id}`] = new PIXI.Texture({
                source: texture.source,
                frame: new PIXI.Rectangle(
                  texture.frame.x + col * TILE_SIZE_RAW, 
                  texture.frame.y + row * TILE_SIZE_RAW, 
                  TILE_SIZE_RAW, 
                  TILE_SIZE_RAW
                )
              });
            }
          }
        }
      }
    }
    
    if (this.gameLoop) {
      this.gameLoop.updateDependencies(this.world, this.pixiApp, this.layers, this.textures, this.lightingFilter);
    }
    
    self.postMessage({ type: 'ENGINE_READY' });
  }

  resize(width: number, height: number) {
    if (this.pixiApp) {
      this.pixiApp.renderer.resize(width, height);
    }
  }

  handleInput(payload: any) {
    if (payload.keys) {
      this.world.keys = { ...this.world.keys, ...payload.keys };
    }
    if (payload.mobileJoystick) {
      this.world.mobileJoystick = payload.mobileJoystick;
    }
  }

  handleAction(payload: any) {
    const { action, data } = payload;
    
    if (action === 'travelDimension') {
      const targetDepth = payload.targetDepth || 0;
      this.world.player.pos.x = 15;
      this.world.player.pos.y = targetDepth;
      this.world.player.visualPos.x = 15;
      this.world.player.visualPos.y = targetDepth;
      this.world.player.stats.depth = targetDepth;
      
      (self as any).postMessage({ type: 'DIMENSION_TRAVEL_COMPLETE' });
      return;
    }
    

    handlePlayerAction(this.world, payload);
  }

  /** [v4 Protocol] 차원 이동/리셋 안전 시퀀스 호출 */
  async safeReset(seed: number, dimension: number) {
    if (this.gameLoop) {
      await this.gameLoop.safeReset(seed, dimension);
      
      // 세이브 상태 반영 (메인 스레드용)
      this.world.player.stats.mapSeed = seed;
      this.world.player.stats.dimension = dimension;
    }
  }
}

const engine = new GameEngineInstance();

self.addEventListener('message', (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      engine.init(payload);
      break;
    case 'ASSETS_ATLAS':
      engine.updateAssetsFromAtlas(payload);
      break;
    case 'SET_CANVAS':
      if (payload.offscreen) {
        engine.setCanvas(payload.offscreen);
      }
      break;
    case 'INPUT':
      engine.handleInput(payload);
      break;
    case 'RESIZE':
      engine.resize(payload.width, payload.height);
      break;
    case 'ACTION':
      engine.handleAction(payload);
      break;
    case 'RETURN_BUFFER':
      if (payload.buffer) {
        engine.returnBuffer(payload.buffer);
      }
      break;
    case 'SAVE_REQUEST':
      if (payload.type === 'export') {
        const tileMapBuffer = engine.world.tileMap.serializeToBuffer();
        (self as any).postMessage({ 
          type: 'EXPORT_DATA', 
          payload: {
            version: 1,
            timestamp: Date.now(),
            stats: engine.world.player.stats,
            position: engine.world.player.pos,
            tileMapBuffer: tileMapBuffer,
          } 
        }, [tileMapBuffer.buffer]);
      }
      break;
  }
});
