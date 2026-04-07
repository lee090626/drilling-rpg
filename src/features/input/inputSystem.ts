import { GameWorld } from '../../entities/world/model';

/**
 * 사용자의 키보드 입력을 해석하여 월드의 의도(Intent) 상태로 변환하는 시스템입니다.
 * @param world 현재 게임 월드 객체
 */
export const inputSystem = (world: GameWorld) => {
  // 의도(Intent) 초기화
  world.intent.moveX = 0;
  world.intent.moveY = 0;
  world.intent.action = 'none';
  world.intent.miningTarget = null;

  // 현재 모달창(상점, 인벤토리 등)이 하나라도 열려있는지 확인
  const { ui } = world;
  const isAnyModalOpen = ui.isShopOpen || ui.isInventoryOpen || ui.isSettingsOpen || 
                         ui.isCraftingOpen || ui.isElevatorOpen || ui.isStatusOpen || ui.isEncyclopediaOpen;
  
  // 모달이 열려있거나 사망 상태면 입력을 차단함
  if (isAnyModalOpen || world.player.stats.hp <= 0) return;

  const keys = world.keys;
  const mobile = world.mobileJoystick;

  // 1. 세로 이동 입력 (우선순위 높음)
  if (keys['arrowup'] || keys['w'] || keys['ArrowUp']) {
    world.intent.moveY = -1;
  } else if (keys['arrowdown'] || keys['s'] || keys['ArrowDown']) {
    world.intent.moveY = 1;
  }
  // 모바일 조이스틱 세로 처리 (임계값 0.4 설정)
  else if (mobile.active && Math.abs(mobile.y) > 0.4 && Math.abs(mobile.y) > Math.abs(mobile.x)) {
    world.intent.moveY = mobile.y > 0 ? 1 : -1;
  }

  // 2. 가로 이동 입력
  if (keys['arrowleft'] || keys['a'] || keys['ArrowLeft']) {
    world.intent.moveX = -1;
  } else if (keys['arrowright'] || keys['d'] || keys['ArrowRight']) {
    world.intent.moveX = 1;
  }
  // 모바일 조이스틱 가로 처리
  else if (mobile.active && Math.abs(mobile.x) > 0.4 && Math.abs(mobile.x) > Math.abs(mobile.y)) {
    world.intent.moveX = mobile.x > 0 ? 1 : -1;
  }

  // 상하좌우 4방향 이동만 허용 (대각선 이동 방지)
  if (world.intent.moveY !== 0) {
    world.intent.moveX = 0;
  }

  // 3. 상호작용 의도 (스페이스바) 및 유물 사용 (Q)
  if (keys[' '] || keys['Spacebar']) {
    world.intent.action = 'interact';
  } else if (keys['q']) {
    world.intent.action = 'artifact';
  }
};
