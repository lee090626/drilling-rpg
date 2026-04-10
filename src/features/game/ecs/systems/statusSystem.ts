import { GameWorld } from '@/entities/world/model';
import { ActiveEffect } from '@/shared/types/game';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 캐릭터(플레이어 및 엔티티)의 상태 이상을 관리하는 시스템입니다.
 * - 지속 시간 체크 및 만료된 효과 제거
 * - 도트 대미지(화상, 독) 처리
 * - 행동 제한(기절, 빙결) 처리
 */
export const statusSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  // 1. 플레이어 상태 이상 업데이트 및 만료 처리
  player.stats.activeEffects = player.stats.activeEffects.filter(effect => {
    const isExpired = now >= effect.endTime;
    if (isExpired) return false;

    // --- 개별 효과 로직 (도트 대미지 등) ---
    // startTime이 없을 경우를 대비하여 방어 코드 추가
    const startTime = effect.startTime || now;
    const elapsed = now - startTime;
    
    // BURN (화상): 0.5초마다 최대 HP의 2% 대미지
    if (effect.type === 'BURN') {
      const interval = 500;
      const prevTicks = Math.floor((elapsed - 20) / interval); 
      const currentTicks = Math.floor(elapsed / interval);
      
      if (currentTicks > prevTicks && currentTicks > 0) {
        const damage = Math.max(1, Math.floor(player.stats.maxHp * 0.02));
        player.stats.hp -= damage;
        createFloatingText(world, player.visualPos.x * TILE_SIZE, player.visualPos.y * TILE_SIZE - 20, "-" + damage, '#f97316');
      }
    }

    // POISON (독): 1초마다 고정 대미지 (차원 비례)
    if (effect.type === 'POISON') {
      const interval = 1000;
      const prevTicks = Math.floor((elapsed - 20) / interval);
      const currentTicks = Math.floor(elapsed / interval);
      
      if (currentTicks > prevTicks && currentTicks > 0) {
        const damage = 5 + (player.stats.dimension * 2);
        player.stats.hp -= damage;
        createFloatingText(world, player.visualPos.x * TILE_SIZE, player.visualPos.y * TILE_SIZE - 20, "-" + damage, '#a855f7');
      }
    }

    return true;
  });

  // 2. 행동 제어 상태 체크 (STUN, FREEZE)
  const isActionBlocked = player.stats.activeEffects.some(e => e.type === 'STUN' || e.type === 'FREEZE');
  if (isActionBlocked) {
    world.intent.moveX = 0;
    world.intent.moveY = 0;
    world.intent.miningTarget = null;
    player.isDrilling = false;
  }
};

/**
 * 대상에게 상태 이상을 부여하는 유틸리티 함수
 */
export const applyStatusEffect = (world: GameWorld, effect: Omit<ActiveEffect, 'endTime' | 'startTime'>, durationMs: number) => {
  const { player } = world;
  const now = Date.now();
  
  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  const existing = player.stats.activeEffects.find(e => e.type === effect.type);
  if (existing) {
    // 이미 존재하는 효과는 종료 시간만 연장 (시작 시간 유지)
    existing.endTime = now + durationMs;
    if (effect.value !== undefined) existing.value = effect.value;
  } else {
    player.stats.activeEffects.push({
      ...effect,
      startTime: now,
      endTime: now + durationMs
    });
  }
};
