import { GameWorld } from '../../entities/world/model';

export const inputSystem = (world: GameWorld) => {
  // Reset intent
  world.intent.moveX = 0;
  world.intent.moveY = 0;
  world.intent.action = 'none';

  // Check if any modal is open
  const { ui } = world;
  const isAnyModalOpen = ui.isShopOpen || ui.isInventoryOpen || ui.isSettingsOpen || 
                         ui.isCraftingOpen || ui.isElevatorOpen || ui.isStatusOpen || ui.isEncyclopediaOpen;
  if (isAnyModalOpen) return;

  const keys = world.keys;

  // Vertical movement takes priority
  if (keys['arrowup'] || keys['w'] || keys['ArrowUp']) {
    world.intent.moveY = -1;
  } else if (keys['arrowdown'] || keys['s'] || keys['ArrowDown']) {
    world.intent.moveY = 1;
  }

  // Horizontal movement if no vertical movement or for future sliding
  if (keys['arrowleft'] || keys['a'] || keys['ArrowLeft']) {
    world.intent.moveX = -1;
  } else if (keys['arrowright'] || keys['d'] || keys['ArrowRight']) {
    world.intent.moveX = 1;
  }

  // Enforce 4-way move intent if desired, or let physics handle sliding
  if (world.intent.moveY !== 0) {
    world.intent.moveX = 0;
  }

  if (keys[' '] || keys['Spacebar']) {
    world.intent.action = 'interact';
  }
};
