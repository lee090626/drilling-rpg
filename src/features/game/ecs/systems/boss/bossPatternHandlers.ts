import { GameWorld } from '@/entities/world/model';
import { BossPattern, BossPatternType } from '@/shared/config/monsterData';
import { EntityManager } from '@/shared/lib/ecs/EntityManager';

// ============================================================
// 내부 타입 정의
// ============================================================

export interface PatternContext {
  world: GameWorld;
  entities: EntityManager;
  bossIdx: number;
  phase: number;
  bx: number;
  by: number;
  px: number;
  py: number;
  now: number;
  pattern: BossPattern;
}

export type PatternHandler = (ctx: PatternContext) => boolean;

// ============================================================
// 전역 타이머 맵 (instanceId 기반)
// ============================================================

export const patternTimers = new Map<string, number>();

// ============================================================
// 패턴 핸들러 구현
// ============================================================

const handleShot: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, px, py, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 1;
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 5;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 10;
  const size = pattern.projectileSize ?? 128;

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 0) return false;

  const baseVx = (dx / dist) * speed;
  const baseVy = (dy / dist) * speed;

  for (let j = 0; j < count; j++) {
    const offset = count > 1 ? (j - (count - 1) / 2) * 0.2 : 0;
    const cos = Math.cos(offset);
    const sin = Math.sin(offset);
    const finalVx = baseVx * cos - baseVy * sin;
    const finalVy = baseVx * sin + baseVy * cos;

    const pIdx = entities.create(5, bx, by);
    if (pIdx !== -1) {
      const idx = entities.getIndex(pIdx);
      soa.vx[idx] = finalVx;
      soa.vy[idx] = finalVy;
      soa.attack[idx] = power;
      soa.createdAt[idx] = now;
      soa.lastAttackTime[idx] = 0;
      soa.width[idx] = size;
      soa.height[idx] = size;
    }
  }
  return true;
};

const handleCross: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 7;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 15;
  const size = pattern.projectileSize ?? 128;

  const directions = [
    { vx: 0,      vy: -speed },
    { vx: 0,      vy:  speed },
    { vx: -speed, vy: 0      },
    { vx:  speed, vy: 0      },
  ];

  for (const dir of directions) {
    const pIdx = entities.create(5, bx, by);
    if (pIdx !== -1) {
      const idx = entities.getIndex(pIdx);
      soa.vx[idx] = dir.vx;
      soa.vy[idx] = dir.vy;
      soa.attack[idx] = power;
      soa.createdAt[idx] = now;
      soa.lastAttackTime[idx] = 0;
      soa.width[idx] = size;
      soa.height[idx] = size;
    }
  }
  return true;
};

const handleAoe: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 12;
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 5;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 10;
  const size = pattern.projectileSize ?? 128;

  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const finalVx = Math.cos(angle) * speed;
    const finalVy = Math.sin(angle) * speed;

    const pIdx = entities.create(5, bx, by);
    if (pIdx !== -1) {
      const idx = entities.getIndex(pIdx);
      soa.vx[idx] = finalVx;
      soa.vy[idx] = finalVy;
      soa.attack[idx] = power;
      soa.createdAt[idx] = now;
      soa.lastAttackTime[idx] = 0;
      soa.width[idx] = size;
      soa.height[idx] = size;
    }
  }
  return true;
};

const handleLure: PatternHandler = (ctx) => {
  const { world, now, pattern } = ctx;
  const { player } = world;

  const lureDuration = pattern.lureDuration ?? 2000;
  const lureCycle = pattern.lureCycle ?? 5000;
  const cycleTime = now % lureCycle;

  if (cycleTime < lureDuration) {
    const alreadyConfused = player.stats.activeEffects?.some(
      (e) => e.type === 'CONFUSION',
    );
    if (!alreadyConfused) {
      if (!player.stats.activeEffects) player.stats.activeEffects = [];
      player.stats.activeEffects.push({
        type: 'CONFUSION',
        startTime: now,
        endTime: now + lureDuration,
      });
      return true;
    }
  }
  return false;
};

const handleSwarm: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 15;
  const baseSpeed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 4;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 8;
  const size = pattern.projectileSize ?? 64; // 파리 떼이므로 작게 설정 가능

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = baseSpeed * (0.8 + Math.random() * 0.4); // 속도에 변주를 줌
    const finalVx = Math.cos(angle) * speed;
    const finalVy = Math.sin(angle) * speed;

    const pIdx = entities.create(5, bx, by);
    if (pIdx !== -1) {
      const idx = entities.getIndex(pIdx);
      soa.vx[idx] = finalVx;
      soa.vy[idx] = finalVy;
      soa.attack[idx] = power;
      soa.createdAt[idx] = now;
      soa.lastAttackTime[idx] = 0;
      soa.width[idx] = size;
      soa.height[idx] = size;
    }
  }
  return true;
};

const handleGravity: PatternHandler = (ctx) => {
  const { world, bx, by, px, py, pattern } = ctx;
  
  const dx = bx - px;
  const dy = by - py;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 10) return false; // 너무 가까우면 인력 중단

  // 인력 세기 (기본값 0.1 타일/틱)
  const strength = 0.08; 
  world.environmentalForce = {
    vx: (dx / dist) * strength,
    vy: (dy / dist) * strength
  };
  
  return true;
};

export const patternRegistry: Map<BossPatternType, PatternHandler> = new Map([
  ['shot', handleShot],
  ['cross', handleCross],
  ['aoe', handleAoe],
  ['lure', handleLure],
  ['swarm', handleSwarm],
  ['gravity', handleGravity],
]);
