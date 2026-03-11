import { GameWorld } from '../../entities/world/model';
import { 
  TILE_SIZE, 
  PLAYER_ACCELERATION, 
  PLAYER_MAX_SPEED, 
  PLAYER_FRICTION,
  BASE_DEPTH,
  MAP_WIDTH,
  MOVEMENT_DELAY_MS
} from '../../shared/config/constants';
import { DRILLS } from '../../shared/config/drillData';

export const physicsSystem = (world: GameWorld, now: number) => {
  const { player, intent, tileMap } = world;
  
  // 1. Grid-based Smooth Sliding Logic
  const MOVEMENT_DELAY = MOVEMENT_DELAY_MS; // 100ms looks like sliding
  
  // Logical movement update
  if (now - world.timestamp.lastMove >= MOVEMENT_DELAY) {
    let moved = false;
    let drilling = false;

    // Handle Axis-aligned grid movement
    if (intent.moveX !== 0 || intent.moveY !== 0) {
      // Determine movement vector (Grid only)
      let dx = 0;
      let dy = 0;

      // Prioritize primary input but allow sliding feel
      if (intent.moveX !== 0) {
        dx = intent.moveX > 0 ? 1 : -1;
      } else if (intent.moveY !== 0) {
        dy = intent.moveY > 0 ? 1 : -1;
      }

      if (dx !== 0 || dy !== 0) {
        const targetX = Math.round(player.pos.x + dx);
        const targetY = Math.round(player.pos.y + dy);
        const tile = tileMap.getTile(targetX, targetY);

        if (tile && (tile.type === 'empty' || tile.type === 'portal')) {
          player.pos.x = targetX;
          player.pos.y = targetY;
          moved = true;
        } else if (tile && tile.type !== 'wall') {
          drilling = true;
          intent.miningTarget = { x: targetX, y: targetY };
        }
      }
    }

    if (moved) {
      world.timestamp.lastMove = now;
      player.isDrilling = false;
    } else if (drilling) {
      player.isDrilling = true;
    } else {
      player.isDrilling = false;
    }
  }

  // 2. Update stats and visual interpolation
  player.stats.depth = Math.max(0, Math.floor(player.pos.y) - BASE_DEPTH);
  if (player.stats.depth > player.stats.maxDepthReached) {
    player.stats.maxDepthReached = player.stats.depth;
  }

  // Smooth visual transition (Sliding effect)
  // Factor of 0.2-0.3 provides a nice "soft grid" feel
  const lerpFactor = 0.25;
  player.visualPos.x += (player.pos.x - player.visualPos.x) * lerpFactor;
  player.visualPos.y += (player.pos.y - player.visualPos.y) * lerpFactor;
};
