import { GameWorld } from '../../entities/world/model';
import { MAP_WIDTH } from '../../shared/config/constants';

export const interactionSystem = (world: GameWorld) => {
  const { player, entities, tileMap, intent } = world;

  // 1. Check for nearby entities (NPCs) to show/hide prompt
  const INTERACTION_DISTANCE = 1.5;
  let nearbyEntity = null;

  for (const entity of entities) {
    const entW = entity.width || 1;
    const entH = entity.height || 1;
    
    // Distance check based on entity center (approx)
    const centerX = entity.x;
    const centerY = entity.y - entH / 2;

    const dx = centerX - player.pos.x;
    const dy = centerY - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Dynamic distance based on entity size
    const interactionDist = Math.max(2.5, Math.max(entW, entH) / 1.5);

    if (dist < interactionDist) {
      nearbyEntity = entity;
      break;
    }
  }

  if (nearbyEntity) {
    world.ui.showInteractionPrompt = true;
    world.ui.activeInteractionType = nearbyEntity.interactionType;

    // Handle interaction intent (Space key)
    if (intent.action === 'interact') {
      handleEntityInteraction(world, nearbyEntity);
    }
  } else {
    world.ui.showInteractionPrompt = false;
    world.ui.activeInteractionType = null;
  }

  // 2. Check for portal interaction (standing on a portal)
  const currentTileX = Math.floor(player.pos.x + 0.5);
  const currentTileY = Math.floor(player.pos.y + 0.5);
  const currentTile = tileMap.getTile(currentTileX, currentTileY);
  if (currentTile && currentTile.type === 'portal') {
    handlePortalInteraction(world);
  }
};

const handleEntityInteraction = (world: GameWorld, entity: any) => {
  if (entity.interactionType === 'shop') {
    world.ui.isShopOpen = true;
  } else if (entity.interactionType === 'dialog') {
    // For now, dialog might just log something or open a small window
    console.log(`Talking to ${entity.name}`);
  } else if (entity.interactionType === 'quest') {
    // Handle quest giving NPC
    world.ui.isShopOpen = true; // Quests are often in the shop UI in this game
  } else if (entity.interactionType === 'crafting') {
    world.ui.isCraftingOpen = true;
  }
};

const handlePortalInteraction = (world: GameWorld) => {
  // This usually requires a confirmed prompt which is handled by the Orchestrator (React component)
  // because window.confirm is blocking and side-effect heavy for a System.
  // We can set a state to trigger the Orchestrator to show the confirm.
  // For now, we'll let the Orchestrator handle the heavy lifting of dimension switching.
};
