import { GameWorld } from '@/entities/world/model';
import { inputSystem } from '@/features/input/inputSystem';
import { physicsSystem } from '@/features/game/ecs/systems/physicsSystem';
import { miningSystem } from '@/features/game/ecs/systems/miningSystem';
import { interactionSystem } from '@/features/game/ecs/systems/interactionSystem';
import { refinerySystem } from '@/features/refinery/refinerySystem';
import { spawnSystem } from '@/features/game/ecs/systems/spawnSystem';
import { monsterAiSystem } from '@/features/game/ecs/systems/monsterAiSystem';
import { combatSystem } from '@/features/game/ecs/systems/combatSystem';
import { effectSystem } from '@/features/game/ecs/systems/effectSystem';
import { renderSystem } from '@/features/game/ecs/systems/renderSystem';
import { statusSystem } from '@/features/game/ecs/systems/statusSystem';
import { orosAiSystem } from '@/features/game/ecs/systems/orosAiSystem';
import { tutorialSystem } from '@/features/game/ecs/systems/tutorialSystem';
import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 게임 메인 루프를 관리하는 클래스 (Ticker)
 * 각 시스템(ECS)의 틱을 제어하고, 워커-메인 간의 상태 동기화를 보장합니다.
 */
export class GameLoop {
  private isRunning: boolean = false;
  private lastLoopTime: number = 0;

  // 상태 동기화 관리
  private lastSyncTime: number = 0;
  private lastUiSyncTime: number = 0;
  private lastSaveTime: number = 0;
  private readonly uiSyncInterval: number = 200; // 5Hz
  public readonly syncInterval: number = 16.66;  // 60Hz Target

  // 의존성 주입(DI) 데이터
  private world: GameWorld;
  private pixiApp: PIXI.Application | null;
  private layers: any | null;
  private textures: { [key: string]: PIXI.Texture };
  private lightingFilter: any | null;
  private bufferPool: ArrayBuffer[];

  constructor(
    world: GameWorld,
    pixiApp: PIXI.Application | null,
    layers: any | null,
    textures: { [key: string]: PIXI.Texture },
    lightingFilter: any | null,
    bufferPool: ArrayBuffer[]
  ) {
    this.world = world;
    this.pixiApp = pixiApp;
    this.layers = layers;
    this.textures = textures;
    this.lightingFilter = lightingFilter;
    this.bufferPool = bufferPool;
  }

  public updateDependencies(
    world: GameWorld,
    pixiApp: PIXI.Application | null,
    layers: any | null,
    textures: { [key: string]: PIXI.Texture },
    lightingFilter: any | null
  ) {
    this.world = world;
    this.pixiApp = pixiApp;
    this.layers = layers;
    this.textures = textures;
    this.lightingFilter = lightingFilter;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastLoopTime = performance.now();
    this.loop(this.lastLoopTime);
  }

  public stop() {
    this.isRunning = false;
  }

  private loop = (now: number) => {
    if (!this.isRunning) return;

    const deltaTime = now - (this.lastLoopTime || now);
    this.lastLoopTime = now;

    try {
      // 0. 공간 분할(Spatial Hash) 그리드 업데이트
      this.world.spatialHash.clear();
      for (let i = 0; i < this.world.entities.soa.count; i++) {
        this.world.spatialHash.insert(
          i,
          this.world.entities.soa.x[i],
          this.world.entities.soa.y[i],
          this.world.entities.soa.width[i],
          this.world.entities.soa.height[i]
        );
      }

      // 1. 게임 시뮬레이션
      inputSystem(this.world);
      statusSystem(this.world, now);
      physicsSystem(this.world, now);
      miningSystem(this.world, now);
      interactionSystem(this.world);
      refinerySystem(this.world, now);
      spawnSystem(this.world);
      monsterAiSystem(this.world, now);
      orosAiSystem(this.world, now);
      combatSystem(this.world, deltaTime, now);
      effectSystem(this.world, deltaTime);
      tutorialSystem(this.world);

      // 2. 렌더링 호출
      if (this.pixiApp && this.layers) {
        renderSystem(this.world, this.pixiApp, this.layers, now, this.textures, this.lightingFilter);
      }

      // 3. UI 동기화 방출
      if (now - this.lastUiSyncTime > this.uiSyncInterval) {
        this.lastUiSyncTime = now;
        self.postMessage({
          type: 'SYNC_UI',
          payload: {
            stats: this.world.player.stats,
          }
        });
      }

      // 4. 트리플 버퍼 기반 렌더 패킷 방출 (Viewport Culling 적용)
      if (now - this.lastSyncTime > this.syncInterval && this.bufferPool.length > 0) {
        this.lastSyncTime = now;
        const buffer = this.bufferPool.shift()!;
        const view = new Float32Array(buffer);
        
        // Culling (1200px 반경)
        const visibleIndices = this.world.spatialHash.query(
          this.world.player.visualPos.x * TILE_SIZE,
          this.world.player.visualPos.y * TILE_SIZE,
          1200
        );

        // Header
        const HEADER_SIZE = 16;
        view[0] = visibleIndices.length;
        view[1] = now;
        view[2] = this.world.player.visualPos.x;
        view[3] = this.world.player.visualPos.y;
        view[4] = this.world.shake;
        view[5] = this.world.player.stats.hp;
        view[6] = this.world.player.stats.maxHp;

        // Body 패킹
        const ENTITY_STRIDE = 8;
        let offset = HEADER_SIZE;
        const { soa } = this.world.entities;

        for (let i = 0; i < visibleIndices.length; i++) {
          const idx = visibleIndices[i];
          if (offset + ENTITY_STRIDE > view.length) break;

          view[offset + 0] = soa.type[idx];
          view[offset + 1] = soa.state[idx];
          view[offset + 2] = soa.x[idx];
          view[offset + 3] = soa.y[idx];
          view[offset + 4] = soa.hp[idx];
          view[offset + 5] = soa.maxHp[idx];
          view[offset + 6] = soa.spriteIndex[idx];
          view[offset + 7] = soa.width[idx];

          offset += ENTITY_STRIDE;
        }
        
        (self as any).postMessage({ type: 'RENDER_SYNC', buffer }, [buffer]);
      }

      // 5. 자동 저장(10초)
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

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(this.loop);
    } else {
      setTimeout(() => this.loop(performance.now()), 16);
    }
  };
}
