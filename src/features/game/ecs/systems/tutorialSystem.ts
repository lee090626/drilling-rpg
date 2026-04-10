import { GameWorld } from '@/entities/world/model';

/**
 * 플레이어의 진행 상황을 모니터링하고 가이드(튜토리얼)를 트리거하는 시스템입니다.
 * 특정 마일스톤 도달 시 메인 스레드로 메시지를 전송합니다.
 */
export const tutorialSystem = (world: GameWorld) => {
  const { player } = world;
  const { stats } = player;

  // 튜토리얼 트리거 상태 관리
  if (!stats.tutorialFlags) {
    stats.tutorialFlags = {};
  }

  const tFlags = stats.tutorialFlags;

  // 1. 환영 인사 및 조작법 (게임 시작 즉시)
  if (!tFlags.welcome && stats.maxDepthReached < 5) {
    tFlags.welcome = true;
    triggerGuide('guide_welcome');
  }
};

/**
 * 메인 스레드로 가이드 트리거 메시지를 전송합니다.
 */
function triggerGuide(guideId: string) {
  // 메인 스레드의 UI 가이드를 트리거함
  if (typeof self !== 'undefined' && self.postMessage) {
    self.postMessage({
      type: 'TUTORIAL_TRIGGER',
      payload: { guideId: guideId }
    });
  }
}
