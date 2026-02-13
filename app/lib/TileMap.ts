import { Tile, TileType } from '../types/game';

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 1000;
export const TILE_SIZE = 40;

export class TileMap {
  grid: Tile[][];

  constructor() {
    this.grid = this.generateMap();
  }

  generateMap(): Tile[][] {
    const grid: Tile[][] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        row.push(this.generateTile(x, y));
      }
      grid.push(row);
    }
    return grid;
  }

  generateTile(x: number, y: number): Tile {
    // Top layers are air/surface (matching BASE_DEPTH in GameEngine)
    if (y < 10) {
      return { type: 'empty', health: 0, maxHealth: 0, value: 0 };
    }

    // Border walls
    if (x === 0 || x === MAP_WIDTH - 1) {
      return { type: 'wall', health: Infinity, maxHealth: Infinity, value: 0 };
    }

    // Procedural generation based on depth
    const rand = Math.random();
    let type: TileType = 'dirt';
    let health = 40;
    let value = 1;

    if (y < 20) {
      if (rand < 0.05) {
        type = 'coal';
        health = 100;
        value = 10;
      }
    } else if (y < 50) {
      if (rand < 0.1) {
        type = 'stone';
        health = 250;
        value = 0;
      } else if (rand < 0.15) {
        type = 'coal';
        health = 100;
        value = 10;
      } else if (rand < 0.17) {
        type = 'iron';
        health = 600;
        value = 50;
      }
    } else {
      // 50+ Depth
      if (rand < 0.2) {
        type = 'stone';
        health = 250;
        value = 0;
      } else if (rand < 0.25) {
        type = 'iron';
        health = 600;
        value = 50;
      } else if (rand < 0.27) {
        type = 'gold';
        health = 1500;
        value = 200;
      } else if (rand < 0.29 && y > 50) {
        // Diamond 2% (0.27~0.29)
        type = 'diamond';
        health = 4000;
        value = 1000;
      } else if (rand < 0.31 && y > 100) {
        // Emerald 2% (0.29~0.31)
        type = 'emerald';
        health = 8000;
        value = 500;
      } else if (rand < 0.33 && y > 150) {
        // Ruby 2% (0.31~0.33)
        type = 'ruby';
        health = 15000;
        value = 800;
      } else if (rand < 0.345 && y > 200) {
        // Sapphire 1.5% (0.33~0.345)
        type = 'sapphire';
        health = 25000;
        value = 1200;
      } else if (rand < 0.355 && y > 300) {
        // Uranium 1% (0.345~0.355)
        type = 'uranium';
        health = 45000;
        value = 2000;
      } else if (rand < 0.36 && y > 500) {
        // Obsidian 0.5% (0.355~0.36)
        type = 'obsidian';
        health = 80000;
        value = 5000;
      }

      // --- RPG Dungeon Overrides (Now fixed at 1000m) ---
      if (y >= 990 && y <= 1010) {
        // Dungeon Walls (Castle boundaries)
        if (x === 1 || x === MAP_WIDTH - 2) {
          type = 'dungeon_bricks';
          health = 1000;
        }

        // Fixed Floor/Ceiling
        if (y === 990 || y === 1010) {
          type = 'dungeon_bricks';
          health = 1000;
        }

        // Fixed Boss Core at the center of 1000m
        if (y === 1000 && x === Math.floor(MAP_WIDTH / 2)) {
          type = 'boss_core';
          health = 10000;
        } else if (
          y === 1000 &&
          (x === Math.floor(MAP_WIDTH / 2) - 1 ||
            x === Math.floor(MAP_WIDTH / 2) + 1)
        ) {
          // Guard nests near boss
          type = 'monster_nest';
          health = 200;
        }
      }
    }

    return { type, health, maxHealth: health, value };
  }

  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return null;
    return this.grid[y][x];
  }

  damageTile(x: number, y: number, amount: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile || tile.type === 'empty' || tile.type === 'wall') return false;

    tile.health -= amount;
    if (tile.health <= 0) {
      tile.type = 'empty';
      tile.health = 0;
      return true; // Tile destroyed
    }
    return false; // Tile damaged but not destroyed
  }

  // --- Persistence Logic ---

  // Compact format: [typeIndex, health] per tile, flattened or row-by-row
  // Optimization: 30x1000 = 30,000 tiles.
  // JSON of 30k arrays [1, 100] is roughly 300KB. Acceptable for LocalStorage.

  serialize(): number[][][] {
    const data: number[][][] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row: number[][] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.grid[y][x];
        const typeIdx = TILE_TYPE_TO_ID[tile.type] ?? 0;
        row.push([typeIdx, tile.health]);
      }
      data.push(row);
    }
    return data;
  }

  deserialize(data: number[][][]): void {
    if (!data || data.length !== MAP_HEIGHT || data[0].length !== MAP_WIDTH) {
      console.error('Invalid save data dimensions');
      // Fallback to regen if invalid? For now, just keep current or regen.
      // this.grid = this.generateMap();
      return;
    }

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const [typeIdx, health] = data[y][x];
        const type = ID_TO_TILE_TYPE[typeIdx] || 'dirt';

        // Reconstruct tile
        // Note: maxHealth and value are static based on type in our current logic,
        // but if we want to be perfect we might need them.
        // For now, let's derive them from a helper or assume defaults.
        // To avoid duplicating logic, we can look up default stats.
        const stats = getTileStats(type);

        this.grid[y][x] = {
          type,
          health,
          maxHealth: stats.health, // defaulting to max, but health stores current
          value: stats.value,
        };
      }
    }
  }

  // --- Regeneration System ---
  regenerateResources(playerX: number, playerY: number): void {
    const REGEN_CHANCE = 0.0005; // 0.05% chance per empty tile per tick
    const SAFE_RADIUS = 5; // Do not regen within 5 tiles of player

    // Iterate map - optimization: skip top surface layers
    for (let y = 10; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.grid[y][x];

        // Only regenerate empty tiles
        if (tile.type !== 'empty') continue;

        // Check safety radius
        const dx = x - playerX;
        const dy = y - playerY;
        if (dx * dx + dy * dy < SAFE_RADIUS * SAFE_RADIUS) continue;

        // Random check
        if (Math.random() < REGEN_CHANCE) {
          // Re-rolling random for type
          const rand = Math.random();
          let newType: TileType = 'stone'; // Default regen is stone
          let health = 60;
          let value = 0;

          if (y < 50) {
            if (rand < 0.8) newType = 'dirt';
            else if (rand < 0.95) newType = 'stone';
            else newType = 'coal';
          } else {
            if (rand < 0.7) {
              newType = 'stone';
            } else if (rand < 0.8) {
              newType = 'dirt';
            } else {
              // 20% chance for mineral roll
              // Use a fresh generic tile generation call to get appropriate mineral for depth
              const freshTile = this.generateTile(x, y);

              if (freshTile.type !== 'empty' && freshTile.type !== 'wall') {
                newType = freshTile.type;
                health = freshTile.health;
                value = freshTile.value;
              }
            }
          }

          // Apply change
          // Update stats based on type if we set it manually above
          if (newType === 'stone') {
            health = 60;
            value = 0;
          } else if (newType === 'dirt') {
            health = 10;
            value = 1;
          } else if (newType === 'coal' && value === 0) {
            health = 20;
            value = 10;
          } // Fallback if manually set

          this.grid[y][x] = {
            type: newType,
            health: health,
            maxHealth: health,
            value: value,
          };
        }
      }
    }
  }
}

// Stats helper
function getTileStats(type: TileType): { health: number; value: number } {
  switch (type) {
    case 'dirt':
      return { health: 10, value: 1 };
    case 'stone':
      return { health: 60, value: 0 }; // Avg stone health
    case 'coal':
      return { health: 20, value: 10 };
    case 'iron':
      return { health: 50, value: 50 };
    case 'gold':
      return { health: 150, value: 200 };
    case 'diamond':
      return { health: 400, value: 1000 };
    case 'emerald':
      return { health: 1550, value: 500 };
    case 'ruby':
      return { health: 1400, value: 800 };
    case 'sapphire':
      return { health: 2500, value: 1200 };
    case 'uranium':
      return { health: 3000, value: 2000 };
    case 'obsidian':
      return { health: 5000, value: 5000 };
    case 'lava':
      return { health: Infinity, value: 0 };
    case 'dungeon_bricks':
      return { health: 500, value: 0 };
    case 'boss_core':
      return { health: 10000, value: 0 };
    case 'monster_nest':
      return { health: 200, value: 0 };
    case 'wall':
      return { health: Infinity, value: 0 };
    case 'empty':
      return { health: 0, value: 0 };
    default:
      return { health: 10, value: 1 };
  }
}

// Mapping
const TILE_TYPE_TO_ID: Record<TileType, number> = {
  empty: 0,
  dirt: 1,
  stone: 2,
  coal: 3,
  iron: 4,
  gold: 5,
  diamond: 6,
  emerald: 7,
  ruby: 8,
  sapphire: 9,
  uranium: 10,
  obsidian: 11,
  lava: 12,
  dungeon_bricks: 13,
  boss_core: 14,
  monster_nest: 15,
  wall: 16,
};

const ID_TO_TILE_TYPE: Record<number, TileType> = Object.entries(
  TILE_TYPE_TO_ID,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key as TileType;
    return acc;
  },
  {} as Record<number, TileType>,
);
