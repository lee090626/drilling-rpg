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

  // 2. 첫 광물 채굴 시 (인벤토리 및 제련 안내)
  if (!tFlags.first_mining && stats.discoveredMinerals.length >= 1) {
    tFlags.first_mining = true;
    triggerGuide('guide_mining');
  }

  // 3. 일정 깊이 도달 (업그레이드 및 연구 안내)
  if (!tFlags.deeper_depth && stats.maxDepthReached >= 50) {
    tFlags.deeper_depth = true;
    triggerGuide('guide_upgrade');
  }
  
  // 4. 아이템 가공 (제련) 시작 시 가이드
  if (!tFlags.first_smelt && stats.activeSmeltingJobs.length > 0) {
    tFlags.first_smelt = true;
    triggerGuide('guide_refinery');
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
