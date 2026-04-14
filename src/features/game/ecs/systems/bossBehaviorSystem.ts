import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * [ECS] 보스 AI 및 패턴 제어 시스템
 * - 보스의 HP에 따른 페이즈 전환 및 공격 패턴 발동을 관리합니다.
 */
export const bossBehaviorSystem = (world: GameWorld, deltaTime: number, now: number) => {
  const { entities, player } = world;
  const { soa } = entities;

  // 보스 검색 (type 2)
  let bossIdx = -1;
  for (let i = 0; i < soa.count; i++) {
    if (soa.type[i] === 2) {
      bossIdx = i;
      break;
    }
  }

  // 보스가 없으면 상태 초기화 후 조기 종료
  if (bossIdx === -1) {
    if (world.bossCombatStatus.active) {
      world.bossCombatStatus.active = false;
      world.environmentalForce = { vx: 0, vy: 0 };
    }
    return;
  }

  // 1. 보스 상태 업데이트 (UI 동기화용)
  const hpPercent = (soa.hp[bossIdx] / soa.maxHp[bossIdx]) * 100;
  let phase = 1;
  if (hpPercent <= 40) phase = 3;
  else if (hpPercent <= 70) phase = 2;

  world.bossCombatStatus = {
    active: true,
    id: `boss_${soa.monsterDefIndex[bossIdx]}`,
    name: 'Asmodeus', // 원본 이름 사용 (데이터 연동 필요 시 확장)
    hp: soa.hp[bossIdx],
    maxHp: soa.maxHp[bossIdx],
    phase: phase,
  };

  // 2. 공격 패턴 타이머 관리 (soa.lastAttackTime[bossIdx] 활용)
  const patternInterval = phase === 3 ? 1500 : phase === 2 ? 2500 : 3500;

  // 보스 위치 (중앙 기준)
  const bx = soa.x[bossIdx] + (soa.width[bossIdx] || TILE_SIZE * 5) / 2;
  const by = soa.y[bossIdx] + (soa.height[bossIdx] || TILE_SIZE * 5) / 2;

  // 플레이어 위치
  const px = player.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const py = player.pos.y * TILE_SIZE + TILE_SIZE / 2;

  // --- 패턴 1: Flame Shot (모든 페이즈) ---
  const warningLeadTime = 600; // 공격 600ms 전부터 전조 표시
  const timeSinceLastAttack = now - soa.lastAttackTime[bossIdx];

  if (timeSinceLastAttack > patternInterval - warningLeadTime) {
    // 공격 징조 표시 (UI 컴포넌트 연동)
    soa.state[bossIdx] = 1; // 1: 공격 준비 상태 (렌더러에서 느낌표 표시)
    
    if (timeSinceLastAttack > patternInterval) {
      const shotCount = phase === 3 ? 5 : phase === 2 ? 3 : 1;
      const speed = phase === 3 ? 12 : phase === 2 ? 8 : 5;

      // 플레이어 방향 벡터 계산
      const dx = px - bx;
      const dy = py - by;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        // 투사체 생성 (5: projectile)
        for (let j = 0; j < shotCount; j++) {
          const offset = (j - (shotCount - 1) / 2) * 0.2;
          const cos = Math.cos(offset);
          const sin = Math.sin(offset);
          const finalVx = vx * cos - vy * sin;
          const finalVy = vx * sin + vy * cos;

          const pIdx = entities.create(5, bx, by);
          if (pIdx !== -1) {
            const idx = entities.getIndex(pIdx);
            soa.vx[idx] = finalVx;
            soa.vy[idx] = finalVy;
            soa.attack[idx] = 10 + phase * 5;
            soa.lastAttackTime[idx] = now; // 생성 시간 (performance.now)
            soa.width[idx] = 24;
            soa.height[idx] = 24;
          }
        }
      }
      soa.lastAttackTime[bossIdx] = now;
      soa.state[bossIdx] = 0; // 평상시 상태로 복구
    }
  } else {
    // 아직 공격 주기가 아니면 상태 초기화
    if (soa.state[bossIdx] === 1) soa.state[bossIdx] = 0;
  }

  // --- 패턴 2: Storm Surge (Phase 2, 3) ---
  if (phase >= 2) {
    const pullStrength = phase === 3 ? 0.08 : 0.04;
    const dx = bx - px;
    const dy = by - py;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < TILE_SIZE * 10) {
      // 일정 거리 안에서만 작동
      world.environmentalForce.vx = (dx / dist) * pullStrength;
      world.environmentalForce.vy = (dy / dist) * pullStrength;
    } else {
      world.environmentalForce.vx = 0;
      world.environmentalForce.vy = 0;
    }
  } else {
    world.environmentalForce = { vx: 0, vy: 0 };
  }

  // --- 패턴 3: Lure (Phase 3) ---
  if (phase === 3) {
    // 5초 주기로 2초간 혼란 상태 부여
    const lureCycle = now % 5000;
    if (lureCycle < 2000) {
      // CONFUSION 효과가 없으면 추가
      if (!player.stats.activeEffects?.some((e) => e.type === 'CONFUSION')) {
        if (!player.stats.activeEffects) player.stats.activeEffects = [];
        player.stats.activeEffects.push({
          type: 'CONFUSION',
          startTime: now,
          endTime: now + 2000,
        });
      }
    }
  }
};
