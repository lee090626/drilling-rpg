
export interface MonsterDefinition {
  id: string;
  name: string;
  type: 'monster' | 'boss';
  imagePath: string; // atlas key
  description: string;
  stats: {
    maxHp: number;
    power: number;
    defense: number;
    speed: number;
    attackCooldown: number;
  };
  rewards: {
    exp: number;
    gold: number;
    drops: Array<{
      itemId: string;
      chance: number;
      minAmount: number;
      maxAmount: number;
    }>;
  };
  behavior: {
    movementType: 'chase' | 'wander' | 'stationary' | 'flee';
    attackRange: number;
    aggroRange: number;
    projectileId?: string; // TBD
  };
  mechanic?: any;
  rarity?: string;
}

export const MONSTERS: Record<number, MonsterDefinition> = {};
export const MONSTER_DEFINITIONS: MonsterDefinition[] = [];

// Temporarily mapping old bosses and monsters to keep it compiling for now, or just leave it empty if we are refactoring.
// Let's create dummy definitions for all 24 monsters and 8 bosses so the array can be used.

export const MONSTER_LIST: MonsterDefinition[] = [
  {
    id: 'c2_soul',
    name: 'Lust Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 500, power: 20, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c2_shade',
    name: 'Lust Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 500, power: 20, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c2_wraith',
    name: 'Lust Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 500, power: 20, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c2_boss',
    name: 'Boss of Lust',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 5000, power: 60, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c3_soul',
    name: 'Gluttony Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 1000, power: 30, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c3_shade',
    name: 'Gluttony Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 1000, power: 30, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c3_wraith',
    name: 'Gluttony Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 1000, power: 30, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c3_boss',
    name: 'Boss of Gluttony',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 10000, power: 90, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c4_soul',
    name: 'Greed Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 2000, power: 45, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c4_shade',
    name: 'Greed Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 2000, power: 45, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c4_wraith',
    name: 'Greed Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 2000, power: 45, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c4_boss',
    name: 'Boss of Greed',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 20000, power: 135, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c5_soul',
    name: 'Wrath Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 4000, power: 67.5, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c5_shade',
    name: 'Wrath Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 4000, power: 67.5, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c5_wraith',
    name: 'Wrath Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 4000, power: 67.5, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c5_boss',
    name: 'Boss of Wrath',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 40000, power: 202.5, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c6_soul',
    name: 'Heresy Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 8000, power: 101.25, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c6_shade',
    name: 'Heresy Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 8000, power: 101.25, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c6_wraith',
    name: 'Heresy Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 8000, power: 101.25, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c6_boss',
    name: 'Boss of Heresy',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 80000, power: 303.75, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c7_soul',
    name: 'Violence Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 16000, power: 151.875, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c7_shade',
    name: 'Violence Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 16000, power: 151.875, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c7_wraith',
    name: 'Violence Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 16000, power: 151.875, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c7_boss',
    name: 'Boss of Violence',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 160000, power: 455.625, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c8_soul',
    name: 'Fraud Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 32000, power: 227.8125, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c8_shade',
    name: 'Fraud Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 32000, power: 227.8125, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c8_wraith',
    name: 'Fraud Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 32000, power: 227.8125, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c8_boss',
    name: 'Boss of Fraud',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 320000, power: 683.4375, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c9_soul',
    name: 'Treachery Soul',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 64000, power: 341.71875, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c9_shade',
    name: 'Treachery Shade',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 64000, power: 341.71875, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c9_wraith',
    name: 'Treachery Wraith',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: 64000, power: 341.71875, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c9_boss',
    name: 'Boss of Treachery',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: 640000, power: 1025.15625, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  }
];
MONSTER_LIST.forEach((m, i) => { MONSTERS[i] = m; MONSTER_DEFINITIONS.push(m); });
