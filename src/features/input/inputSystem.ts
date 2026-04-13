import { GameWorld } from '@/entities/world/model';

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
  const isAnyModalOpen =
    ui.isShopOpen ||
    ui.isInventoryOpen ||
    ui.isSettingsOpen ||
    ui.isCraftingOpen ||
    ui.isElevatorOpen ||
    ui.isStatusOpen ||
    ui.isEncyclopediaOpen;

  // 모달이 열려있거나 사망 상태면 입력을 차단함
  if (isAnyModalOpen || world.player.stats.hp <= 0) return;

  const keys = world.keys;
  const mobile = world.mobileJoystick;

  // 1. Vertical Movement (e.code)
  if (keys['ArrowUp'] || keys['KeyW']) {
    world.intent.moveY = -1;
  } else if (keys['ArrowDown'] || keys['KeyS']) {
    world.intent.moveY = 1;
  }
  // Mobile joystick (y threshold 0.4)
  else if (mobile.active && Math.abs(mobile.y) > 0.4 && Math.abs(mobile.y) > Math.abs(mobile.x)) {
    world.intent.moveY = mobile.y > 0 ? 1 : -1;
  }

  // 2. Horizontal Movement (e.code)
  if (keys['ArrowLeft'] || keys['KeyA']) {
    world.intent.moveX = -1;
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    world.intent.moveX = 1;
  }
  // Mobile joystick
  else if (mobile.active && Math.abs(mobile.x) > 0.4 && Math.abs(mobile.x) > Math.abs(mobile.y)) {
    world.intent.moveX = mobile.x > 0 ? 1 : -1;
  }

  // cardinal direction only
  if (world.intent.moveY !== 0) {
    world.intent.moveX = 0;
  }

  // 3. Action intent (Space) and Artifact usage (KeyQ)
  if (keys['Space']) {
    world.intent.action = 'interact';
  } else if (keys['KeyQ']) {
    world.intent.action = 'artifact';
  }
};
