import { createInitialWorld, GameWorld } from '../../../entities/world/model';
import { inputSystem } from '../../../features/input/inputSystem';
import { physicsSystem } from '../../../features/movement/physicsSystem';
import { miningSystem } from '../../../features/mining/miningSystem';
import { interactionSystem } from '../../../features/interaction/interactionSystem';
import { refinerySystem } from '../../../features/refinery/refinerySystem';
import { monsterAiSystem } from '../../../features/combat/monsterAiSystem';
import { combatSystem } from '../../../features/combat/combatSystem';
import { spawnSystem } from '../../../features/combat/spawnSystem';
import { effectSystem } from '../../../features/effects/effectSystem';
import { renderSystem } from '../../../features/render/renderSystem';
import { createInitialEquipmentState } from '../../../shared/lib/masteryUtils';
import { REFINERY_RECIPES } from '../../../shared/config/refineryData';
import { RESEARCH_NODES } from '../../../shared/config/researchData';
import { getDroneData } from '../../../shared/config/droneData';
import { SKILL_RUNES } from '../../../shared/config/skillRuneData';
import { TileMap } from '../../../entities/tile/TileMap';
import { Rarity } from '../../../shared/types/game';
import * as PIXI from 'pixi.js';

// PixiJS v8 Web Worker 지원을 위한 어댑터 설정 (ReferenceError: document is not defined 방지)
PIXI.DOMAdapter.set(PIXI.WebWorkerAdapter);

/**
 * [Pixi Engine] GameEngineInstance 클래스
 * - 워커 내부에서 PixiJS Application을 관리하고 렌더링 루프를 제어합니다.
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
  
  // 에셋 텍스처 캐시
  textures: { [key: string]: PIXI.Texture } = {};
  
  private isRunning: boolean = false;
  private lastLoopTime: number = 0;
  lastSyncTime: number = 0;
  lastSaveTime: number = 0;
  syncInterval: number = 50; // 20Hz

  constructor() {
    this.world = createInitialWorld(12345);
  }

  /** 새로운 캔버스 제어권을 할당받음 및 Pixi 초기화 */
  async setCanvas(newCanvas: OffscreenCanvas) {
    if (this.pixiApp) {
      this.pixiApp.destroy(true, { children: true, texture: true });
    }

    this.pixiApp = new PIXI.Application();
    
    // PixiJS v8 스타일 초기화 (OffscreenCanvas 지원)
    await this.pixiApp.init({
      canvas: newCanvas,
      width: newCanvas.width,
      height: newCanvas.height,
      backgroundAlpha: 0,
      antialias: true,
      preference: 'webgl' // 성능을 위해 WebGL 강제
    });

    console.log('[Worker] PixiJS Application initialized with OffscreenCanvas.');

    // 레이어 초기화
    const stage = new PIXI.Container();
    const tileLayer = new PIXI.Container();
    const entityLayer = new PIXI.Container();
    const effectLayer = new PIXI.Container();
    const lightLayer = new PIXI.Container(); // 조명 효과 레이어 (멀티플라이 블렌딩용)
    const uiLayer = new PIXI.Container();

    stage.addChild(tileLayer);
    stage.addChild(entityLayer);
    stage.addChild(effectLayer);
    stage.addChild(lightLayer);
    stage.addChild(uiLayer);

    this.pixiApp.stage.addChild(stage);
    
    this.layers = { stage, tileLayer, entityLayer, effectLayer, lightLayer, uiLayer };
  }

  /** 월드 상태 초기화 (세이브 데이터 포함) */
  async init(payload: any) {
    console.log('[Worker] Initializing world...');
    const seed = payload.seed || 12345;
    const currentAssets = this.world.assets;
    const currentLayout = this.world.baseLayout;
    const currentEntities = this.world.entities;

    this.world = createInitialWorld(seed);
    this.world.assets = currentAssets;
    this.world.baseLayout = currentLayout;
    this.world.entities = currentEntities;

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

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastLoopTime = performance.now();
      this.startLoop();
      console.log('[Worker] Loop started. Sending ENGINE_READY.');
      self.postMessage({ type: 'ENGINE_READY' });
    }
  }

  /** 아틀라스 에셋 데이터 업데이트 (Spritesheet 활용) */
  async updateAssetsFromAtlas(payload: any) {
    if (!this.world) return;
    console.log('[Worker] Converting Atlas to Pixi Textures...');
    const { atlasData, layout, entities } = payload;
    
    this.world.baseLayout = layout;
    this.world.entities = entities;

    // Pixi 텍스처로 변환 및 캐싱
    for (const atlas of atlasData) {
      const { json, bitmap } = atlas;
      const baseTexture = PIXI.Texture.from(bitmap as any);
      
      const spritesheet = new PIXI.Spritesheet(baseTexture, json);
      await spritesheet.parse();

      // 전역 캐시 및 엔진 내부 캐시 등록
      for (const [name, texture] of Object.entries(spritesheet.textures)) {
        // 1. PixiJS 전역 캐시 (PIXI.Texture.from 호출 대응)
        PIXI.Assets.cache.set(name, texture);
        PIXI.Assets.cache.set(`/${name}`, texture);
        PIXI.Assets.cache.set(`./${name}`, texture);

        // 2. 엔진 내부 매핑 (this.textures)
        this.textures[name] = texture;
        
        const cleanName = name.replace('.png', '');

        // 타일 매핑 (dirt.png -> tile_dirt)
        this.textures[`tile_${cleanName}`] = texture;

        // 아이템 매핑 (DirtIcon.png -> item_dirt)
        if (name.endsWith('Icon.png')) {
          const itemName = cleanName.replace('Icon', '').toLowerCase();
          this.textures[`item_${itemName}`] = texture;
        }

        // 특수 캐릭터/타일셋 매핑
        if (name === 'Player.png') {
          this.textures['player'] = texture;
        }
        if (name === 'BaseTileset.png') {
          this.textures['tileset'] = texture;
          this.textures['baseTileset'] = texture;

          // 베이스캠프 타일셋 슬라이싱 (128x128 타일, 5열)
          const TILE_SIZE_RAW = 128;
          const COLUMNS = 5;
          const rows = Math.floor(texture.height / TILE_SIZE_RAW);
          
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < COLUMNS; col++) {
              const id = row * COLUMNS + col;
              // @ts-ignore - PixiJS v8 style texture frame slicing
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
    
    console.log(`[Worker] Atlas optimization complete. ${Object.keys(this.textures).length} textures cached.`);
    self.postMessage({ type: 'ENGINE_READY' });
  }

  updateAssets(payload: any) {
    // ... 기존 코드는 호환성을 위해 유지하거나 제거 가능 (현재는 ATLAS만 사용)
  }

  /** 메인 루프 시작 */
  startLoop() {
    const loop = (now: number) => {
      if (!this.isRunning) return;

      const deltaTime = now - (this.lastLoopTime || now);
      this.lastLoopTime = now;

      try {
        // 1. 게임 로직
        inputSystem(this.world);
        physicsSystem(this.world, now);
        miningSystem(this.world, now);
        interactionSystem(this.world);
        refinerySystem(this.world, now);
        spawnSystem(this.world);
        monsterAiSystem(this.world);
        combatSystem(this.world, deltaTime, now);
        effectSystem(this.world, deltaTime);

        // 2. 렌더링 (Pixi 엔진 활용)
        if (this.pixiApp && this.layers) {
           renderSystem(this.world, this.pixiApp, this.layers, now, this.textures);
        }

        // 3. UI 동기화 (20Hz)
        if (now - this.lastSyncTime > this.syncInterval) {
          this.lastSyncTime = now;
          self.postMessage({
            type: 'SYNC',
            payload: {
              stats: this.world.player.stats,
              pos: this.world.player.pos,
              visualPos: this.world.player.visualPos,
              shake: this.world.shake,
            }
          });
        }

        // 4. 자동 저장 (10초)
        if (now - this.lastSaveTime > 10000) {
          this.lastSaveTime = now;
          self.postMessage({
            type: 'SAVE',
            payload: {
              version: 1,
              timestamp: Date.now(),
              stats: this.world.player.stats,
              position: this.world.player.pos,
              tileMap: this.world.tileMap.serialize(),
            }
          });
        }
      } catch (err) {
        console.error('[Worker Loop Error]', err);
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /** 브라우저 크기 조정 대응 */
  resize(width: number, height: number) {
    if (this.pixiApp) {
      this.pixiApp.renderer.resize(width, height);
    }
  }

  /** 메인 스레드로부터의 입력 처리 */
  handleInput(payload: any) {
    if (payload.keys) {
      this.world.keys = { ...this.world.keys, ...payload.keys };
    }
    if (payload.mobileJoystick) {
      this.world.mobileJoystick = payload.mobileJoystick;
    }
  }

  /** 게임 액션 수행 */
  handleAction(payload: any) {
    const { action, data } = payload;
    const stats = this.world.player.stats;

    switch (action) {
      case 'upgrade':
        if (data.type === 'power') stats.power += 5;
        else if (data.type === 'maxHp') stats.maxHp += 20;
        if (data.requirements) {
          Object.entries(data.requirements).forEach(([res, amt]) => {
            const amount = amt as number;
            if (res === 'goldCoins') stats.goldCoins -= amount;
            else if (stats.inventory[res as any] !== undefined) {
              (stats.inventory as any)[res] -= amount;
            }
          });
        }
        break;

      case 'sell':
        if (stats.inventory[data.resource] >= data.amount) {
          stats.inventory[data.resource] -= data.amount;
          stats.goldCoins += data.price;
        }
        break;

      case 'equip':
        if (data.type === 'drill') stats.equippedDrillId = data.id;
        else if (data.type === 'drone') stats.equippedDroneId = data.id;
        else if (data.type === 'artifact') stats.equippedArtifactId = data.id;
        break;

      case 'craft':
        if (data.req) {
          Object.entries(data.req).forEach(([res, amt]) => {
            if (res === 'goldCoins') stats.goldCoins -= amt as number;
            else if (stats.inventory[res as any] !== undefined) (stats.inventory as any)[res] -= amt as number;
          });
        }
        if (data.res.drillId && !stats.ownedDrillIds.includes(data.res.drillId)) {
          stats.ownedDrillIds.push(data.res.drillId);
          if (!stats.equipmentStates[data.res.drillId]) {
             stats.equipmentStates[data.res.drillId] = createInitialEquipmentState(data.res.drillId);
          }
        }
        if (data.res.droneId && !stats.ownedDroneIds.includes(data.res.droneId)) {
          stats.ownedDroneIds.push(data.res.droneId);
        }
        break;

      case 'extractRune': {
        const cost = 500 * Math.pow(2, data.tier);
        if (stats.goldCoins >= cost) {
          stats.goldCoins -= cost;
          const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
          const finalTierIdx = Math.min(data.tier + (Math.random() < 0.05 ? 1 : 0), rarities.length - 1);
          const availableRunes = Object.values(SKILL_RUNES);
          const rune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
          stats.inventoryRunes.push({
            id: `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            runeId: rune.id,
            rarity: rarities[finalTierIdx]
          });
        }
        break;
      }

      case 'regenerateWorld': {
        const newSeed = Math.floor(Math.random() * 1000000);
        stats.mapSeed = newSeed;
        this.world.tileMap = new TileMap(newSeed, stats.dimension);
        this.world.player.pos = { x: 15, y: 8 };
        this.world.player.visualPos = { x: 15, y: 8 };
        this.world.player.stats.depth = 0;
        this.world.particles = [];
        this.world.floatingTexts = [];
        this.world.droppedItems = [];
        break;
      }
      
      case 'useArtifact': {
        this.world.intent.action = 'artifact';
        break;
      }

      case 'respawn': {
        // HP 회복 및 위치 초기화
        stats.hp = stats.maxHp;
        this.world.player.pos = { x: 15, y: 8 };
        this.world.player.visualPos = { x: 15, y: 8 };
        console.log('[Worker] Player respawned at Base Camp.');
        break;
      }

      case 'equipRune': {
        const { runeInstanceId, slotIndex } = data;
        const drillId = stats.equippedDrillId;
        const state = stats.equipmentStates[drillId];
        if (state) {
          const prevIdx = state.slottedRunes.indexOf(runeInstanceId);
          if (prevIdx !== -1) state.slottedRunes[prevIdx] = null;
          state.slottedRunes[slotIndex] = runeInstanceId;
        }
        break;
      }

      case 'unequipRune': {
        const state = stats.equipmentStates[data.drillId];
        if (state && state.slottedRunes[data.slotIndex]) state.slottedRunes[data.slotIndex] = null;
        break;
      }

      case 'selectCheckpoint': {
        this.world.player.pos.y = data.depth + 10;
        this.world.player.visualPos.y = data.depth + 10;
        stats.depth = data.depth;
        break;
      }

      case 'startSmelting': {
        const recipeId = data.recipeId;
        const recipe = REFINERY_RECIPES.find(r => r.id === recipeId);
        if (recipe) {
          (stats.inventory[recipe.inputId as any] as number) -= recipe.inputAmount;
          const speedMult = getDroneData(stats.equippedDroneId)?.smeltSpeedMult || 1;
          stats.activeSmeltingJobs.push({
            id: `smelt_${Date.now()}_${Math.random()}`,
            inputMineral: recipe.inputId,
            outputItem: recipe.outputId,
            amount: recipe.outputAmount,
            startTime: Date.now(),
            durationMs: recipe.durationMs * speedMult
          });
        }
        break;
      }

      case 'collectSmelting': {
        const idx = stats.activeSmeltingJobs.findIndex(j => j.id === data.jobId);
        if (idx !== -1) {
          const job = stats.activeSmeltingJobs[idx];
          stats.inventory[job.outputItem] += job.amount;
          stats.activeSmeltingJobs.splice(idx, 1);
        }
        break;
      }

      case 'unlockResearch': {
        const node = RESEARCH_NODES.find(n => n.id === data.researchId);
        if (node) {
          Object.entries(node.cost).forEach(([res, amt]) => {
            if (res === 'goldCoins') stats.goldCoins -= amt as number;
            else (stats.inventory[res as any] as number) -= amt as number;
          });
          stats.unlockedResearchIds.push(data.researchId);
          if (node.effect.type === 'power') stats.power += node.effect.value;
          if (node.effect.type === 'maxHp') {
            stats.hp += node.effect.value;
            stats.maxHp += node.effect.value;
          }
        }
        break;
      }

      case 'synthesizeRunes': {
        const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
        const runeGroups = new Map<string, any[]>();
        
        for (const rune of stats.inventoryRunes) {
          const key = `${rune.runeId}_${rune.rarity}`;
          if (!runeGroups.has(key)) runeGroups.set(key, []);
          runeGroups.get(key)!.push(rune);
        }

        for (const [, group] of runeGroups) {
          if (group.length >= 5) {
            const sample = group[0];
            const currentTierIdx = rarities.indexOf(sample.rarity as Rarity);
            
            if (currentTierIdx !== -1 && currentTierIdx < rarities.length - 1) {
              // 5개 제거
              let removedCount = 0;
              stats.inventoryRunes = stats.inventoryRunes.filter(r => {
                if (removedCount < 5 && group.includes(r)) {
                  removedCount++;
                  return false;
                }
                return true;
              });

              // 상위 등급 1개 추가
              stats.inventoryRunes.push({
                id: `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                runeId: sample.runeId,
                rarity: rarities[currentTierIdx + 1]
              });
              
              console.log(`[Worker] Synthesized 5 ${sample.rarity} ${sample.runeId} into 1 ${rarities[currentTierIdx + 1]}`);
            }
            break; // 한 번에 한 종류만 합성
          }
        }
        break;
      }

      case 'travelDimension': {
        const nextDim = stats.dimension + 1;
        stats.dimension = nextDim;
        
        // 월드 초기화
        const newSeed = Math.floor(Math.random() * 1000000);
        stats.mapSeed = newSeed;
        this.world.tileMap.reset(newSeed, nextDim);
        
        // 플레이어 상태 초기화
        this.world.player.pos = { x: 15, y: 8 };
        this.world.player.visualPos = { x: 15, y: 8 };
        stats.depth = 0;
        
        // 휘발성 데이터 청소
        this.world.particles = [];
        this.world.floatingTexts = [];
        this.world.droppedItems = [];
        this.world.spawnedCoords.clear();
        
        console.log(`[Worker] Traveled to Dimension ${nextDim}`);
        
        // 메인 스레드에 알림 (필요시)
        self.postMessage({ type: 'DIMENSION_TRAVEL_COMPLETE', payload: { dimension: nextDim } });
        break;
      }
    }
  }
}

// 싱크톤 인스턴스 생성
const engine = new GameEngineInstance();

self.addEventListener('message', (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      engine.init(payload);
      break;
    case 'ASSETS':
      engine.updateAssets(payload);
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
