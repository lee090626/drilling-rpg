import { GameWorld } from '@/entities/world/model';
import { MINERALS } from '@/shared/config/mineralData';
import { TILE_SIZE } from '@/shared/config/constants';
import { createParticles } from '@/shared/lib/effectUtils';
import { showToast } from './toastSystem';
import { ID_TO_TILE_TYPE } from '@/shared/types/game';

// Buffer for item pickup aggregation
const pickupBuffer: Record<string, number> = {};
let lastPickupEventTime = 0;
const AGGREGATION_WINDOW = 1200; // 1.2s aggregation window

/**
 * System managing visual effects (particles, floating text) and physics lifecycle.
 */
export const effectSystem = (world: GameWorld, deltaTime: number) => {
  const { particles, floatingTexts } = world;
  const now = Date.now();

  // 0. Handle item acquisition aggregation toast
  if (lastPickupEventTime > 0 && now - lastPickupEventTime > AGGREGATION_WINDOW) {
    const entries = Object.entries(pickupBuffer);
    if (entries.length > 0) {
      const message = entries.map(([type, count]) => `${type.toUpperCase()} x${count}`).join(', ');

      showToast(`${message} Acquired!`, 'info', 2000);

      // Reset buffer
      for (const key in pickupBuffer) {
        delete pickupBuffer[key];
      }
      lastPickupEventTime = 0;
    }
  }

  // 0. Shake reduction
  if (world.shake > 0) {
    world.shake *= Math.pow(0.8, deltaTime / 16.6);
    if (world.shake < 0.1) world.shake = 0;
  }

  // 1. [Specialist] Particle update
  const { updateParticles } = require('./effect/ParticlePhysics');
  updateParticles(world, deltaTime);


  // 2. Floating text update
  for (let i = 0; i < floatingTexts.length; i++) {
    const ft = floatingTexts[i];
    if (!ft.active) continue;

    const dtFactor = deltaTime / 16.6;

    if (ft.vx !== undefined && ft.vy !== undefined) {
      ft.x += ft.vx * dtFactor;
      ft.y += ft.vy * dtFactor;
      ft.vy += 0.25 * dtFactor;
      ft.vx *= 0.98;

      const isResource = ft.text.includes('G') || ft.text.includes('+');
      if (isResource && ft.life < 0.7) {
        const px = world.player.visualPos.x * TILE_SIZE + TILE_SIZE / 2;
        const py = world.player.visualPos.y * TILE_SIZE + TILE_SIZE / 2;

        const dx = px - ft.x;
        const dy = py - ft.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          const force = 0.15 * dtFactor;
          ft.vx += (dx / dist) * force;
          ft.vy += (dy / dist) * force;
          ft.life -= 0.01 * dtFactor;
        }
      }
    } else {
      ft.y -= 1 * dtFactor;
    }

    ft.life -= 0.012 * dtFactor;

    if (ft.life <= 0) {
      ft.active = false;
    }
  }

  // 3. Dropped item update (TypedArray Optimization)
  const dp = world.droppedItemPool;
  for (let i = 0; i < dp.capacity; i++) {
    if (!dp.active[i]) continue;

    const dtSeconds = deltaTime / 1000;
    dp.life[i] += dtSeconds;

    const type = ID_TO_TILE_TYPE[dp.typeId[i]];

    if (dp.life[i] < 0.5) {
      // Physics phase
      dp.vy[i] += 0.4;
      const nextX = dp.x[i] + dp.vx[i];
      const nextY = dp.y[i] + dp.vy[i];

      const tileX = Math.floor(nextX / TILE_SIZE);
      const tileY = Math.floor(nextY / TILE_SIZE);
      const tile = world.tileMap.getTile(tileX, tileY);

      if (tile && tile.type !== 'empty' && tile.type !== 'portal' && tile.type !== 'wall') {
        dp.vy[i] = -dp.vy[i] * 0.4;
        dp.vx[i] *= 0.8;
        if (Math.abs(dp.vy[i]) > 0.5) {
          dp.y[i] = tileY * TILE_SIZE - 1;
        } else {
          dp.vy[i] = 0;
          dp.y[i] += dp.vy[i];
        }
        dp.x[i] += dp.vx[i];
      } else {
        dp.x[i] = nextX;
        dp.y[i] = nextY;
      }
    } else {
      // Pickup phase
      const px = world.player.visualPos.x * TILE_SIZE + TILE_SIZE / 2;
      const py = world.player.visualPos.y * TILE_SIZE + TILE_SIZE / 2;

      const dx = px - dp.x[i];
      const dy = py - dp.y[i];
      const dist = Math.sqrt(dx * dx + dy * dy);

      const pickupRadius = 30;

      if (dist < pickupRadius) {
        // Collect
        const amount = dp.amount[i];

        // 인벤토리 추가 (슬롯 누락 시 자동 생성 처리)
        const currentAmount = world.player.stats.inventory[type] || 0;
        world.player.stats.inventory[type] = currentAmount + amount;

        // === [내실] 정수 및 유물 획득 시 누적 기록 업데이트 ===
        const isArtifact = type.startsWith('essence_') || type.startsWith('relic_');
        if (isArtifact) {
          if (!world.player.stats.collectionHistory) {
            world.player.stats.collectionHistory = {};
          }
          world.player.stats.collectionHistory[type] =
            (world.player.stats.collectionHistory[type] || 0) + amount;
        }

        // Record for aggregation (UI Snapshot happens implicitly by name)
        pickupBuffer[type] = (pickupBuffer[type] || 0) + amount;
        lastPickupEventTime = now;

        // Visual feedback
        createParticles(world, px - TILE_SIZE / 2, py - TILE_SIZE / 2, '#ffffff', 4);

        // Remove from world
        dp.kill(i);
      } else {
        const accel = 1.5;
        dp.vx[i] += (dx / dist) * accel;
        dp.vy[i] += (dy / dist) * accel;
        dp.vx[i] *= 0.85;
        dp.vy[i] *= 0.85;

        const maxSpeed = 15;
        const speed = Math.sqrt(dp.vx[i] * dp.vx[i] + dp.vy[i] * dp.vy[i]);
        if (speed > maxSpeed) {
          dp.vx[i] = (dp.vx[i] / speed) * maxSpeed;
          dp.vy[i] = (dp.vy[i] / speed) * maxSpeed;
        }

        dp.x[i] += dp.vx[i];
        dp.y[i] += dp.vy[i];
      }
    }
  }
};
