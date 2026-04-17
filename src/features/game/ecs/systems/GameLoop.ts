import { GameWorld } from '@/entities/world/model';
import { inputSystem } from '@/features/input/inputSystem';
import { physicsSystem } from '@/features/game/ecs/systems/physicsSystem';
import { miningSystem } from '@/features/game/ecs/systems/miningSystem';
import { interactionSystem } from '@/features/game/ecs/systems/interactionSystem';

import { spawnSystem } from '@/features/game/ecs/systems/spawnSystem';
import { monsterAiSystem } from '@/features/game/ecs/systems/monsterAiSystem';
import { combatSystem } from '@/features/game/ecs/systems/combatSystem';
import { effectSystem } from '@/features/game/ecs/systems/effectSystem';
import { renderSystem } from '@/features/game/ecs/systems/renderSystem';
import { statusSystem } from '@/features/game/ecs/systems/statusSystem';
import { tutorialSystem } from '@/features/game/ecs/systems/tutorialSystem';
import { bossBehaviorSystem } from '@/features/game/ecs/systems/bossBehaviorSystem';
import { projectileSystem } from '@/features/game/ecs/systems/projectileSystem';
import { statsSyncSystem } from '@/features/game/ecs/systems/statsSyncSystem';
import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';
import { RenderSyncEncoder } from '@/features/game/lib/RenderSyncEncoder';

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
  private readonly uiSyncInterval: number = 500; // 2Hz (Optimized to reduce cloning load)
  public readonly syncInterval: number = 16.66; // 60Hz Target

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

  /**
   * [v4 Protocol] 차원 이동 및 월드 리셋을 위한 안전 시퀀스
   */
  public async safeReset(newSeed: number, nextDim: number) {
    // 1. Pause
    this.isRunning = false;
    console.log('[GameLoop] Reset sequence started. Loop paused.');

    // 2. Flush (최종 UI 상태 동기화)
    self.postMessage({
      type: 'SYNC_UI',
      payload: {
        stats: this.world.player.stats,
        ui: this.world.ui,
      },
    });

    // 약간의 딜레이를 주어 메시지가 전송될 시간을 확보 (필요 시)
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3. Clear (풀 비우기)
    this.world.particlePool.getPool().forEach((p) => (p.active = false));
    this.world.floatingTextPool.getPool().forEach((f) => (f.active = false));
    this.world.droppedItemPool.clear();
    this.world.entities.clear(); // [v4] Protocol: Reuse instance, just clear data
    this.world.spawnedCoords.clear();

    // 4. Reset (타일맵 리셋)
    this.world.tileMap.reset(newSeed, nextDim);

    // 플레이어 위치 초기화
    this.world.player.pos = { x: 15, y: 8 };
    this.world.player.visualPos = { x: 15, y: 8 };
    this.world.player.stats.depth = 0;

    console.log('[GameLoop] World reset complete.');

    // 5. Resume
    this.isRunning = true;
    this.lastLoopTime = performance.now();
    this.loop(this.lastLoopTime);
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
      statsSyncSystem(this.world.player);
      physicsSystem(this.world, now);
      miningSystem(this.world, now);
      interactionSystem(this.world);
      spawnSystem(this.world);
      monsterAiSystem(this.world, now);
      bossBehaviorSystem(this.world, deltaTime, now);
      projectileSystem(this.world, deltaTime, now);
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
            ui: this.world.ui,
            boss: this.world.bossCombatStatus,
            // Optimization Monitoring
            metrics: {
              blockedDrops: this.world.droppedItemPool.blockedDropCount,
            },
          },
        });
      }

      // 4. 트리플 버퍼 기반 렌더 패킷 방출 (Viewport Culling 적용)
      if (now - this.lastSyncTime > this.syncInterval && this.bufferPool.length > 0) {
        this.lastSyncTime = now;
        const buffer = this.bufferPool.shift()!;
        RenderSyncEncoder.encodeAndSend(this.world, buffer, now);
      }

      // 5. 자동 저장(10초)
      if (now - this.lastSaveTime > 10000) {
        this.lastSaveTime = now;
        const tileMapBuffer = this.world.tileMap.serializeToBuffer();

        // Use (self as any) to bypass TypeScript WorkerGlobalScope inference issues
        (self as any).postMessage(
          {
            type: 'SAVE',
            payload: {
              version: 1,
              timestamp: Date.now(),
              stats: this.world.player.stats,
              position: this.world.player.pos,
              tileMapBuffer: tileMapBuffer,
            },
          },
          [tileMapBuffer.buffer]
        );
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
