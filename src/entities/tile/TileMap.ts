import { Tile, TileType } from '../../shared/types/game';
import { getMineralStats } from '../../shared/lib/tileUtils';
import { MAP_WIDTH, BASE_DEPTH } from '../../shared/config/constants';

export const MAP_HEIGHT = 1011;

export class TileMap {
  grid: Tile[][];
  seed: number;
  dimension: number;
  private rng: number;

  constructor(seed: number = 12345, dimension: number = 0) {
    this.seed = seed;
    this.dimension = dimension;
    this.rng = seed;
    this.grid = this.generateMap();
  }

  // Seeded Random Helper (LCG)
  private seededRandom(): number {
    this.rng = (1664525 * this.rng + 1013904223) % 4294967296;
    return this.rng / 4294967296;
  }

  generateMap(): Tile[][] {
    this.rng = this.seed; // Reset RNG for deterministic generation
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
    // Top layers are air/surface
    if (y < BASE_DEPTH) {
      return { type: 'empty', health: 0, maxHealth: 0 };
    }

    // Procedural generation based on depth
    const rand = this.seededRandom();
    const stats = getMineralStats('dirt');
    let type: TileType = 'dirt';
    let health = stats.health;

    if (y < 20) {
      if (rand < 0.05) {
        type = 'coal';
        const s = getMineralStats('coal');
        health = s.health;
      }
    } else if (y < 50) {
      if (rand < 0.1) {
        type = 'stone';
        const s = getMineralStats('stone');
        health = s.health;
      } else if (rand < 0.15) {
        type = 'coal';
        const s = getMineralStats('coal');
        health = s.health;
      } else if (rand < 0.17) {
        type = 'iron';
        const s = getMineralStats('iron');
        health = s.health;
      }
    } else {
      // 50+ Depth
      if (rand < 0.2) {
        type = 'stone';
        const s = getMineralStats('stone');
        health = s.health;
      } else if (rand < 0.25) {
        type = 'iron';
        const s = getMineralStats('iron');
        health = s.health;
      } else if (rand < 0.27) {
        type = 'gold';
        const s = getMineralStats('gold');
        health = s.health;
      } else if (rand < 0.29 && y > 50) {
        type = 'diamond';
        const s = getMineralStats('diamond');
        health = s.health;
      } else if (rand < 0.31 && y > 100) {
        type = 'emerald';
        const s = getMineralStats('emerald');
        health = s.health;
      } else if (rand < 0.33 && y > 150) {
        type = 'ruby';
        const s = getMineralStats('ruby');
        health = s.health;
      } else if (rand < 0.345 && y > 200) {
        type = 'sapphire';
        const s = getMineralStats('sapphire');
        health = s.health;
      } else if (rand < 0.355 && y > 300) {
        type = 'uranium';
        const s = getMineralStats('uranium');
        health = s.health;
      } else if (rand < 0.36 && y > 500) {
        type = 'obsidian';
        const s = getMineralStats('obsidian');
        health = s.health;
      }

      // Boss Core 5x5 Logic at 1000m
      const bossCenterY = 1010;
      const bossCenterX = Math.floor(MAP_WIDTH / 2);

      if (
        Math.abs(x - bossCenterX) <= 2 &&
        Math.abs(y - bossCenterY) <= 2
      ) {
        type = 'boss_core'; 
        health = 20000;
      } 
      else if (
        this.dimension > 0 &&
        y === bossCenterY &&
        (x === bossCenterX - 3 || x === bossCenterX + 3)
      ) {
        type = 'monster_nest';
        health = 200 + this.dimension * 200;
      }
    }

    return { type, health, maxHealth: health };
  }

  getTile(x: number, y: number): Tile | null {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (iy < 0 || iy >= MAP_HEIGHT || ix < 0 || ix >= MAP_WIDTH) return null;
    return this.grid[iy][ix];
  }

  damageTile(x: number, y: number, amount: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile || tile.type === 'empty' || tile.type === 'wall') return false;

    tile.health -= amount;
    if (tile.health <= 0) {
      tile.type = 'empty';
      tile.health = 0;
      return true;
    }
    return false;
  }

  serialize(): Record<string, [number, number]> {
    const originalMap = new TileMap(this.seed, this.dimension);
    const modified: Record<string, [number, number]> = {};

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const current = this.grid[y][x];
        const original = originalMap.grid[y][x];

        if (current.type !== original.type || current.health !== original.health) {
          const typeIdx = TILE_TYPE_TO_ID[current.type] ?? 0;
          modified[`${x},${y}`] = [typeIdx, current.health];
        }
      }
    }
    return modified;
  }

  deserialize(data: any, seed?: number, dimension?: number): void {
    if (seed !== undefined) {
      this.seed = seed;
      this.rng = seed;
    }
    if (dimension !== undefined) {
      this.dimension = dimension;
    }
    
    this.grid = this.generateMap();

    if (!data) return;

    if (Array.isArray(data)) {
      for (let y = 0; y < Math.min(data.length, MAP_HEIGHT); y++) {
        for (let x = 0; x < Math.min(data[y]?.length || 0, MAP_WIDTH); x++) {
          const [typeIdx, health] = data[y][x];
          const type = ID_TO_TILE_TYPE[typeIdx] || 'dirt';
          const stats = getMineralStats(type);

          this.grid[y][x] = {
            type,
            health: health,
            maxHealth: stats.health,
          };
        }
      }
      return;
    }

    for (const [coord, tileData] of Object.entries(data as Record<string, [number, number]>)) {
      const [x, y] = coord.split(',').map(Number);
      if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) continue;

      const [typeIdx, health] = tileData;
      const type = ID_TO_TILE_TYPE[typeIdx] || 'dirt';
      const stats = getMineralStats(type);

      this.grid[y][x] = {
        type,
        health: health,
        maxHealth: stats.health,
      };
    }
  }

  regenerateAllResources(playerX: number, playerY: number): void {
    const SAFE_RADIUS = 5;
    for (let y = BASE_DEPTH; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.grid[y][x];
        if (tile.type !== 'empty') continue;

        const dx = x - playerX;
        const dy = y - playerY;
        if (dx * dx + dy * dy < SAFE_RADIUS * SAFE_RADIUS) continue;

        const rand = Math.random();
        let newType: TileType = 'dirt';

        if (y < 20) {
          if (rand < 0.1) newType = 'coal';
          else newType = 'dirt';
        } else if (y < 50) {
          if (rand < 0.1) newType = 'stone';
          else if (rand < 0.2) newType = 'coal';
          else if (rand < 0.25) newType = 'iron';
          else newType = 'dirt';
        } else {
          if (rand < 0.2) newType = 'stone';
          else if (rand < 0.3) newType = 'iron';
          else if (rand < 0.35) newType = 'gold';
          else if (rand < 0.39) newType = 'diamond';
          else if (rand < 0.43 && y > 100) newType = 'emerald';
          else if (rand < 0.46 && y > 150) newType = 'ruby';
          else if (rand < 0.49 && y > 200) newType = 'sapphire';
          else if (rand < 0.51 && y > 300) newType = 'uranium';
          else if (rand < 0.52 && y > 500) newType = 'obsidian';
          else newType = 'dirt';
        }

        const stats = getMineralStats(newType);

        this.grid[y][x] = {
          type: newType,
          health: stats.health,
          maxHealth: stats.health,
        };
      }
    }
  }
}

const TILE_TYPE_TO_ID: Record<TileType, number> = {
  empty: -1,
  dirt: 0,
  stone: 3,
  coal: 5,
  iron: 6,
  gold: 7,
  diamond: 8,
  emerald: 20,
  ruby: 21,
  sapphire: 22,
  uranium: 23,
  obsidian: 24,
  lava: 25,
  dungeon_bricks: 9,
  boss_core: 32,
  monster_nest: 31,
  wall: 4,
  portal: 10,
  boss_skin: 33,
};

const ID_TO_TILE_TYPE: Record<number, TileType> = Object.entries(TILE_TYPE_TO_ID).reduce((acc, [key, value]) => {
  acc[value as number] = key as TileType;
  return acc;
}, {} as Record<number, TileType>);
