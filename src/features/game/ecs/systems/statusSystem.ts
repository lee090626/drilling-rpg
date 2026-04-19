import { GameWorld } from '@/entities/world/model';
import { ActiveEffect, StatusType } from '@/shared/types/game';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 캐릭터(플레이어 및 엔티티)의 상태 이상을 관리하는 시스템입니다.
 * - 지속 시간 체크 및 만료된 효과 제거
 * - 도트 대미지(화상, 독) 처리
 * - 환경 디버프(Hazards) 처리
 */
export const statusSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 1. 주기적 효과 체크 및 자연 회복 (1초마다 수행)
  if (!world.timestamp) (world as any).timestamp = {};
  const lastRegenCheck = (world.timestamp as any).lastRegenCheck || 0;

  if (now - lastRegenCheck > 1000) {
    (world.timestamp as any).lastRegenCheck = now;

    // 자연 회복 (Passive Regen): 매 초당 최대 체력의 1% 회복 (단, 완전 사망 상태가 아닐 때만)
    if (player.stats.hp > 0 && player.stats.hp < player.stats.maxHp) {
      const regenAmount = Math.max(1, Math.floor(player.stats.maxHp * 0.01));
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + regenAmount);
    }
  }

  // 2. 플레이어 상태 이상 업데이트 및 만료 처리
  player.stats.activeEffects = player.stats.activeEffects.filter((effect) => {
    const isExpired = now >= effect.endTime;
    if (isExpired) {
      // 스턴이 만료될 때 면역 시작 시간 기록
      if (effect.type === 'STUN') {
        (player.stats as any).lastStunEndTime = now;
      }
      return false;
    }

    const startTime = effect.startTime || now;
    const elapsed = now - startTime;

    // BURN (화상): 0.5초마다 최대 HP의 2% 대미지
    if (effect.type === 'BURN') {
      const interval = 500;
      const currentTicks = Math.floor(elapsed / interval);
      const prevTicks = Math.floor((elapsed - 20) / interval);

      if (currentTicks > prevTicks && currentTicks > 0) {
        const damage = Math.max(1, Math.floor(player.stats.maxHp * 0.02));
        player.stats.hp -= damage;
        createFloatingText(
          world,
          player.visualPos.x * TILE_SIZE,
          player.visualPos.y * TILE_SIZE - 20,
          '-' + damage,
          '#f97316',
        );
      }
    }

    // POISON (독): 1초마다 고정 대미지 (차원 비례)
    if (effect.type === 'POISON') {
      const interval = 1000;
      const currentTicks = Math.floor(elapsed / interval);
      const prevTicks = Math.floor((elapsed - 20) / interval);

      if (currentTicks > prevTicks && currentTicks > 0) {
        const damage = 5 + player.stats.dimension * 2;
        player.stats.hp -= damage;
        createFloatingText(
          world,
          player.visualPos.x * TILE_SIZE,
          player.visualPos.y * TILE_SIZE - 20,
          '-' + damage,
          '#a855f7',
        );
      }
    }

    // BLEED (선혈) 및 기타 도트 효과는 여기서 확장 가능

    return true;
  });

  // 3. 행동 제어 상태 체크 (STUN) - FREEZE는 속도 저하로 physicsSystem에서 처리
  const isActionBlocked = player.stats.activeEffects.some((e) => e.type === 'STUN');
  if (isActionBlocked) {
    world.intent.moveX = 0;
    world.intent.moveY = 0;
    world.intent.miningTarget = null;
    player.isDrilling = false;
  }

  // --- [v4 Emergency Fix] Stuck Stun Cleanser ---
  if (player.stats.activeEffects.length > 0) {
    player.stats.activeEffects = player.stats.activeEffects.filter(e => {
      if (e.type === 'STUN' && e.endTime > now + 3600000) return false; 
      return true;
    });
  }
};


/**
 * 대상에게 상태 이상을 부여하는 유틸리티 함수
 */
export const applyStatusEffect = (
  world: GameWorld,
  effect: Omit<ActiveEffect, 'endTime' | 'startTime'>,
  durationMs: number,
  nowArg?: number // 선택적 인자로 현재 시간 전달 가능
) => {
  const { player } = world;
  const now = nowArg || performance.now(); // Date.now() 대신 성능 기반 시간 사용

  const STUN_IMMUNITY_DURATION = 1000; // 스턴 종료 후 1초간 면역 (사용자 요청 반영)

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 1. 스턴(STUN) 특수 처리: 면역 체크 및 중복 방지
  if (effect.type === 'STUN') {
    const lastStunEndTime = (player.stats as any).lastStunEndTime || 0;
    const isImmune = now - lastStunEndTime < STUN_IMMUNITY_DURATION;
    const isAlreadyStunned = player.stats.activeEffects.some((e: any) => e.type === 'STUN');

    if (isImmune || isAlreadyStunned) {
      return; // 면역 상태거나 이미 스턴 중이면 무시
    }
  }

  const existing = player.stats.activeEffects.find((e: any) => e.type === effect.type);
  if (existing) {
    existing.endTime = now + durationMs;
    if (effect.value !== undefined) existing.value = effect.value;
  } else {
    player.stats.activeEffects.push({
      ...effect,
      startTime: now,
      endTime: now + durationMs,
    });
  }
};
