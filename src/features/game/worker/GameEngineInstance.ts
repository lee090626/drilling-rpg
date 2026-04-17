import { createInitialWorld, GameWorld } from '@/entities/world/model';
import * as PIXI from 'pixi.js';
import { LightingFilter } from '@/features/game/lib/LightingFilter';
import { GameLoop } from '@/features/game/ecs/systems/GameLoop';
import { handlePlayerAction } from '@/features/game/ecs/systems/ActionSystem';
import { AssetParser } from '../lib/AssetParser';

/**
 * GameEngineInstance class
 * Handles dependency injection and message routing within the worker.
 */
export class GameEngineInstance {
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
      preference: 'webgl',
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
      this.gameLoop.updateDependencies(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
      );
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
        const binary = atob(tileMapData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        this.world.tileMap.deserializeFromBuffer(bytes.buffer, stats.mapSeed, stats.dimension);
      } else if (tileMap) {
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
        this.bufferPool,
      );
      this.gameLoop.start();
      self.postMessage({ type: 'ENGINE_READY' });
    } else {
      this.gameLoop.updateDependencies(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
      );
    }
  }

  async updateAssetsFromAtlas(payload: any) {
    if (!this.world) return;
    const { atlasData, layout, entities } = payload;

    this.world.baseLayout = layout;
    this.world.staticEntities = entities;

    // 분할된 AssetParser 호출 (단일 책임 원칙)
    await AssetParser.parseAtlasData(atlasData, this.textures);

    if (this.gameLoop) {
      this.gameLoop.updateDependencies(
        this.world,
        this.pixiApp,
        this.layers,
        this.textures,
        this.lightingFilter,
      );
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

  handleSaveRequest() {
    const tileMapBuffer = this.world.tileMap.serializeToBuffer();
    (self as any).postMessage(
      {
        type: 'EXPORT_DATA',
        payload: {
          version: 1,
          timestamp: Date.now(),
          stats: this.world.player.stats,
          position: this.world.player.pos,
          tileMapBuffer: tileMapBuffer,
        },
      },
      [tileMapBuffer.buffer],
    );
  }

  async safeReset(seed: number, dimension: number) {
    if (this.gameLoop) {
      await this.gameLoop.safeReset(seed, dimension);
      this.world.player.stats.mapSeed = seed;
      this.world.player.stats.dimension = dimension;
    }
  }
}
