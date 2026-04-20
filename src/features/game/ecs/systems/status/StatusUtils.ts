import { GameWorld } from '@/entities/world/model';
import { ActiveEffect } from '@/shared/types/game';

/**
 * 대상에게 상태 이상을 부여하는 유틸리티 함수
 */
export const applyStatusEffect = (
  world: GameWorld,
  effect: Omit<ActiveEffect, 'endTime' | 'startTime'>,
  durationMs: number,
  nowArg?: number
) => {
  const { player } = world;
  const now = nowArg || performance.now();

  const STUN_IMMUNITY_DURATION = 1000;

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 1. 스턴(STUN) 특수 처리: 면역 체크 및 중복 방지
  if (effect.type === 'STUN') {
    const lastStunEndTime = (player.stats as any).lastStunEndTime || 0;
    const isImmune = now - lastStunEndTime < STUN_IMMUNITY_DURATION;
    const isAlreadyStunned = player.stats.activeEffects.some((e: any) => e.type === 'STUN');

    if (isImmune || isAlreadyStunned) {
      return;
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
