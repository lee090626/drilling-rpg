import { GameWorld } from '@/entities/world/model';
import { processActiveEffects } from './EffectProcessor';

/**
 * 캐릭터(플레이어 및 엔티티)의 상태 이상을 관리하는 도메인 오케스트레이터입니다.
 * - 자연 회복(Regen)
 * - 상태 이상 틱 처리 (EffectProcessor 위임)
 * - 행동 제약(Stun) 처리
 */
export const statusSystem = (world: GameWorld, now: number) => {
  const { player } = world;

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

  // 2. [Specialist] 개별 상태 이상 업데이트 및 처리 (BURN, POISON 등)
  processActiveEffects(world, now);

  // 3. 행동 제어 상태 체크 (STUN)
  const isActionBlocked = player.stats.activeEffects?.some((e) => e.type === 'STUN');
  if (isActionBlocked) {
    world.intent.moveX = 0;
    world.intent.moveY = 0;
    world.intent.miningTarget = null;
    player.isDrilling = false;
  }

  // --- [Emergency Fix] Stuck Stun Cleanser ---
  if (player.stats.activeEffects && player.stats.activeEffects.length > 0) {
    player.stats.activeEffects = player.stats.activeEffects.filter(e => {
      // 1시간 이상의 비정상적인 스턴 상태 제거
      if (e.type === 'STUN' && e.endTime > now + 3600000) return false; 
      return true;
    });
  }
};

export { applyStatusEffect } from './StatusUtils';
