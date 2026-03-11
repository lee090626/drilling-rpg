export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Radiant' | 'Legendary' | 'Mythic' | 'Ancient';

export type TileType =
  | 'dirt'
  | 'stone'
  | 'coal'
  | 'iron'
  | 'gold'
  | 'diamond'
  | 'emerald'
  | 'ruby'
  | 'sapphire'
  | 'uranium'
  | 'obsidian'
  | 'lava'
  | 'dungeon_bricks'
  | 'boss_core'
  | 'boss_skin'
  | 'monster_nest'
  | 'empty'
  | 'wall'
  | 'portal';

export interface Tile {
  type: TileType;
  health: number;
  maxHealth: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirement: {
    type: TileType | 'depth';
    target: number;
    current: number;
  };
  reward: {
    items?: string[];
  };
  status: 'available' | 'active' | 'completed';
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePower: number;
  cooldownMs: number;
  specialEffect?: 'lucky' | 'explosive' | 'efficient' | 'speed';
  moveSpeedMult?: number;
  miningArea?: number; // For future multi-tile mining
  price?: { [key: string]: number }; // For shop/crafting
}

export interface PlayerStats {
  depth: number;
  // Drill System
  equippedDrillId: string;
  ownedDrillIds: string[];

  // Exploration
  maxDepthReached: number;
  artifacts: string[];

  // Combat Stats
  hp: number;
  maxHp: number;
  attackPower: number;

  inventory: {
    dirt: number;
    stone: number;
    coal: number;
    iron: number;
    gold: number;
    diamond: number;
    emerald: number;
    ruby: number;
    sapphire: number;
    uranium: number;
    obsidian: number;
  };
  goldCoins: number;
  mapSeed: number;
  activeQuests: Quest[];
  completedQuestIds: string[];
  discoveredMinerals: string[];
  encounteredBossIds: string[];
  dimension: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: 'npc' | 'object';
  name: string;
  x: number;
  y: number;
  spriteIndex?: number; // Optional if using imagePath
  imagePath?: string; // Optional if using tileset index
  width?: number; // In tile units (e.g., 2)
  height?: number; // In tile units (e.g., 2)
  interactionType: 'shop' | 'dialog' | 'quest' | 'crafting';
}

export interface GameAssets {
  player: HTMLImageElement | null;
  tileset: HTMLImageElement | null;
  baseTileset: HTMLImageElement | null;
  boss: HTMLImageElement | null;
  entities: { [path: string]: HTMLImageElement };
  resources: { [type: string]: HTMLImageElement };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  startY?: number;
  life: number;
}
