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
  | 'monster_nest'
  | 'empty'
  | 'wall';

export interface Tile {
  type: TileType;
  health: number;
  maxHealth: number;
  value: number;
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
    fuel?: number;
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
  fuelConsumption: number;
  specialEffect?: 'lucky' | 'explosive' | 'efficient' | 'speed';
  price?: { [key: string]: number }; // For shop/crafting
}

export interface PlayerStats {
  fuel: number;
  maxFuel: number;
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
  activeQuests: Quest[];
  completedQuestIds: string[];
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
  interactionType: 'shop' | 'dialog' | 'quest';
}
