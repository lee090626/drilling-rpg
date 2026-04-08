import { createInitialWorld, GameWorld } from '@/entities/world/model';
import * as PIXI from 'pixi.js';
import { LightingFilter } from '@/features/game/lib/LightingFilter';
import { GameLoop } from '@/features/game/ecs/systems/GameLoop';
import { handlePlayerAction } from '@/features/game/ecs/systems/ActionSystem';

// PixiJS v8 Web Worker 지원을 위한 어댑터 설정
PIXI.DOMAdapter.set(PIXI.WebWorkerAdapter);

/**
 * [Pixi Engine] GameEngineInstance 클래스
 * - 워커 내부에서 의존성 묶음 역할을 하며(DI), 메인 스레드와의 통신(Message Router)만 담당합니다.
 */
class GameEngineInstance {
  world: GameWorld;
  pixiApp: PIXI.Application | null = null;
  
  // Pixi 레이어 구조
  layers: {
    stage: PIXI.Container;
    tileLayer: PIXI.Container;
    entityLayer: PIXI.Container;
    effectLayer: PIXI.Container;
    uiLayer: PIXI.Container;
    lightLayer: PIXI.Container;
  } | null = null;
  
  textures: { [key: string]: PIXI.Texture } = {};
  lightingFilter: LightingFilter | null = null;
  
  // 트리플 버퍼 풀
  private readonly BUFFER_SIZE = (16 + 5000 * 8) * 4;
  bufferPool: ArrayBuffer[] = [];

  // 메인 게임 루프 의존성
  private gameLoop: GameLoop | null = null;

  constructor() {
    this.world = createInitialWorld(12345);
    for (let i = 0; i < 3; i++) {
      this.bufferPool.push(new ArrayBuffer(this.BUFFER_SIZE));
    }
  }

  /** 새로운 캔버스 제어권을 할당받음 및 Pixi 초기화 */
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

    console.log('[Worker] PixiJS Application initialized with OffscreenCanvas.');

    const stage = new PIXI.Container();
    const tileLayer = new PIXI.Container();
    const entityLayer = new PIXI.Container();
    const effectLayer = new PIXI.Container();
    const lightLayer = new PIXI.Container();
    const uiLayer = new PIXI.Container();

    stage.addChild(tileLayer);
    stage.addChild(entityLayer);
    stage.addChild(effectLayer);
    stage.addChild(lightLayer);
    stage.addChild(uiLayer);

    this.pixiApp.stage.addChild(stage);
    
    this.lightingFilter = new LightingFilter();
    stage.filters = [this.lightingFilter];

    this.layers = { stage, tileLayer, entityLayer, effectLayer, lightLayer, uiLayer };

    // 루프에 의존성 갱신
    if (this.gameLoop) {
      this.gameLoop.updateDependencies(this.world, this.pixiApp, this.layers, this.textures, this.lightingFilter);
    }
  }

  returnBuffer(buffer: ArrayBuffer) {
    this.bufferPool.push(buffer);
  }

  async init(payload: any) {
    console.log('[Worker] Initializing world...');
    const seed = payload.seed || 12345;
    const currentAssets = this.world.assets;
    const currentLayout = this.world.baseLayout;
    const currentStaticEntities = this.world.staticEntities;

    this.world = createInitialWorld(seed);
    this.world.assets = currentAssets;
    this.world.baseLayout = currentLayout;
    this.world.staticEntities = currentStaticEntities;

    if (payload.saveData) {
      const { stats, position, tileMap } = payload.saveData;
      this.world.player.stats = stats;
      this.world.player.pos = position;
      this.world.player.visualPos = { ...position };
      this.world.tileMap.deserialize(tileMap, stats.mapSeed, stats.dimension);
      console.log('[Worker] Save data loaded.');
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
      console.log('[Worker] Loop started. Sending ENGINE_READY.');
      self.postMessage({ type: 'ENGINE_READY' });
    } else {
      this.gameLoop.updateDependencies(this.world, this.pixiApp, this.layers, this.textures, this.lightingFilter);
    }
  }

  async updateAssetsFromAtlas(payload: any) {
    if (!this.world) return;
    console.log('[Worker] Converting Atlas to Pixi Textures...');
    const { atlasData, layout, entities } = payload;
    
    this.world.baseLayout = layout;
    this.world.staticEntities = entities;

    for (const atlas of atlasData) {
      const { json, bitmap } = atlas;
      const baseTexture = PIXI.Texture.from(bitmap as any);
      
      const spritesheet = new PIXI.Spritesheet(baseTexture, json);
      await spritesheet.parse();

      for (const [name, texture] of Object.entries(spritesheet.textures)) {
        PIXI.Assets.cache.set(name, texture);
        PIXI.Assets.cache.set(`/${name}`, texture);
        PIXI.Assets.cache.set(`./${name}`, texture);

        this.textures[name] = texture;
        const cleanName = name.replace('.png', '');
        this.textures[`tile_${cleanName}`] = texture;

        if (name.endsWith('Icon.png')) {
          const itemName = cleanName.replace('Icon', '').toLowerCase();
          this.textures[`item_${itemName}`] = texture;
        }

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
    
    // 루프에 의존성 갱신
    if (this.gameLoop) {
      this.gameLoop.updateDependencies(this.world, this.pixiApp, this.layers, this.textures, this.lightingFilter);
    }
    
    console.log(`[Worker] Atlas optimization complete. ${Object.keys(this.textures).length} textures cached.`);
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
    // 순수 분리된 Action System으로 위임 (의존성 제공)
    handlePlayerAction(this.world, payload);
  }
}

// 싱글톤 인스턴스 생성
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
        self.postMessage({ 
          type: 'EXPORT_DATA', 
          payload: {
            version: 1,
            timestamp: Date.now(),
            stats: engine.world.player.stats,
            position: engine.world.player.pos,
            tileMap: engine.world.tileMap.serialize(),
          } 
        });
      }
      break;
  }
});
