import { GameWorld } from '@/entities/world/model';
import { ActiveEffect, StatusType } from '@/shared/types/game';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { TILE_SIZE } from '@/shared/config/constants';
import { getCircleConfig } from '@/shared/config/circleData';

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

  // 1. 환경 디버프(Circle Hazards) 체크 및 갱신 (1초마다 수행)
  if (!world.timestamp) (world as any).timestamp = {};
  const lastHazardCheck = (world.timestamp as any).lastHazardCheck || 0;

  if (now - lastHazardCheck > 1000) {
    (world.timestamp as any).lastHazardCheck = now;
    applyEnvironmentHazards(world, now);

    // 자연 회복 (Passive Regen): 매 초당 최대 체력의 1% 회복 (단, 완전 사망 상태가 아닐 때만)
    if (player.stats.hp > 0 && player.stats.hp < player.stats.maxHp) {
      const regenAmount = Math.max(1, Math.floor(player.stats.maxHp * 0.01));
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + regenAmount);
    }
  }

  // 2. 플레이어 상태 이상 업데이트 및 만료 처리
  player.stats.activeEffects = player.stats.activeEffects.filter((effect) => {
    const isExpired = now >= effect.endTime;
    if (isExpired) return false;

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
};

/**
 * 플레이어의 현재 깊이에 따라 환경 상태이상을 부여합니다.
 */
const applyEnvironmentHazards = (world: GameWorld, now: number) => {
  const { player } = world;
  const config = getCircleConfig(player.stats.depth);
  if (!config) return;

  // 서클별 고유 상태이상 정의 (지속시간 2초로 계속 갱신)
  let hazardType: StatusType | null = null;
  let hazardValue = 1;

  switch (config.id) {
    case 3: // Gluttony
      hazardType = 'POISON';
      break;
    case 4: // Greed
      hazardType = 'FATIGUE';
      hazardValue = 0.7; // 채굴 속도 30% 감소
      break;
    case 5: // Wrath
      hazardType = 'ENRAGE';
      hazardValue = 1.25; // 받는 피해 25% 증가 (공격력도 증가할 수 있음)
      break;
    case 6: // Heresy
      hazardType = 'CURSE';
      break;
    case 7: // Violence
      hazardType = 'BLEED';
      break;
    case 8: // Fraud
      hazardType = 'CONFUSION';
      break;
    case 9: // Treachery
      hazardType = 'FREEZE'; // 여기서는 이동속도 대폭 저하로 작동
      break;
  }

  if (hazardType) {
    applyStatusEffect(world, { type: hazardType, value: hazardValue }, 2000);
  }
};

/**
 * 대상에게 상태 이상을 부여하는 유틸리티 함수
 */
export const applyStatusEffect = (
  world: GameWorld,
  effect: Omit<ActiveEffect, 'endTime' | 'startTime'>,
  durationMs: number,
) => {
  const { player } = world;
  const now = Date.now();

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
  }

  const existing = player.stats.activeEffects.find((e) => e.type === effect.type);
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
