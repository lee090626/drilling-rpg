import { GameWorld } from '@/entities/world/model';
import { MOVEMENT_DELAY_MS } from '@/shared/config/constants';
import { statusEffector, processMovementSideEffects } from './physics/StatusEffector';
import { environmentalPhysics } from './physics/EnvironmentalPhysics';
import { playerDynamics } from './physics/PlayerDynamics';

/**
 * 플레이어의 이동, 충돌 체크, 환경 물리 및 보간을 관리하는 메인 시스템(오케스트레이터)입니다.
 * 모든 연산은 관심사의 분리에 따라 하위 도메인 시스템에 위임합니다.
 */
export const physicsSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  // 사망 시 물리 연산 중단
  if (player.stats.hp <= 0) {
    player.isDrilling = false;
    return;
  }

  // 1. [SoC: 상태 이상] 물리 변조 파라미터 계산
  const { movementDelay } = statusEffector(world, now);

  // 시각적 보간(Lerp) 속도 설정
  const lerpFactor = isFinite(50 / movementDelay) ? Math.min(0.95, 50 / movementDelay) : 0.25;

  // 2. [SoC: 환경 물리] 외부 힘 및 월드 경계 처리
  environmentalPhysics(world);

  // 3. [SoC: 이동 메카닉] 그리드 이동, 보간, 펫 드론 추적
  playerDynamics(world, now, movementDelay, lerpFactor);

  // 4. [SoC: 부수 효과] 이동 시 발생하는 상태 이상 처리 (출혈 등)
  // 이동이 확정된 후 (lastMove가 갱신된 틱에만 실행하거나 매 프레임 체크)
  if (now === world.timestamp.lastMove) {
    processMovementSideEffects(world);
  }
};
