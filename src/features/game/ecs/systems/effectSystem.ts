import { GameWorld } from '@/entities/world/model';
import { MINERALS } from '@/shared/config/mineralData';
import { TILE_SIZE } from '@/shared/config/constants';
import { createParticles } from '@/shared/lib/effectUtils';
import { showToast } from './toastSystem';

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
      const message = entries
        .map(([type, count]) => `${type.toUpperCase()} x${count}`)
        .join(', ');
      
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

  // 1. Particle update
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.active) continue;

    const dtFactor = deltaTime / 16.6;
    p.x += p.vx * dtFactor;
    p.y += p.vy * dtFactor;
    p.vy += 0.2 * dtFactor;
    p.life -= 0.02 * dtFactor;
    
    if (p.life <= 0) {
      p.active = false;
    }
  }

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

  // 3. Dropped item update
  for (let i = world.droppedItems.length - 1; i >= 0; i--) {
    const item = world.droppedItems[i];
    const dtSeconds = deltaTime / 1000;
    
    item.life += dtSeconds;

    if (item.life < 0.5) {
      item.vy += 0.4;
      const nextX = item.x + item.vx;
      const nextY = item.y + item.vy;

      const tileX = Math.floor(nextX / TILE_SIZE);
      const tileY = Math.floor(nextY / TILE_SIZE);
      const tile = world.tileMap.getTile(tileX, tileY);

      if (tile && tile.type !== 'empty' && tile.type !== 'portal' && tile.type !== 'wall') {
        item.vy = -item.vy * 0.4;
        item.vx *= 0.8;
        if (Math.abs(item.vy) > 0.5) {
          item.y = tileY * TILE_SIZE - 1;
        } else {
          item.vy = 0;
          item.y += item.vy; 
        }
        item.x += item.vx;
      } else {
        item.x = nextX;
        item.y = nextY;
      }
    } else {
      const px = world.player.visualPos.x * TILE_SIZE + TILE_SIZE / 2;
      const py = world.player.visualPos.y * TILE_SIZE + TILE_SIZE / 2;
      
      const dx = px - item.x;
      const dy = py - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const hasMagnet = world.player.stats.equippedDroneId === 'magnet_drone';
      const pickupRadius = hasMagnet ? 80 : 30;

      if (dist < pickupRadius) {
        // Collect
        if (world.player.stats.inventory[item.type] !== undefined) {
          world.player.stats.inventory[item.type]++;
        }
        
        // Record for aggregation
        pickupBuffer[item.type] = (pickupBuffer[item.type] || 0) + 1;
        lastPickupEventTime = now;
        
        // Visual feedback
        createParticles(world, px - TILE_SIZE / 2, py - TILE_SIZE / 2, '#ffffff', 4);
        
        // Remove from world
        world.droppedItems.splice(i, 1);
        continue;
      } else {
        const accel = hasMagnet ? 4.0 : 1.5;
        item.vx += (dx / dist) * accel;
        item.vy += (dy / dist) * accel;
        item.vx *= 0.85;
        item.vy *= 0.85;

        const maxSpeed = hasMagnet ? 25 : 15;
        const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
        if (speed > maxSpeed) {
          item.vx = (item.vx / speed) * maxSpeed;
          item.vy = (item.vy / speed) * maxSpeed;
        }

        item.x += item.vx;
        item.y += item.vy;
      }
    }
  }
};
