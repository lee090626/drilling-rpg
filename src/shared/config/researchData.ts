import { ResearchNode } from '../types/game';

/**
 * 연구소 스킬트리의 전체 노드 구성입니다.
 * 좌표(position)는 UI상에서의 배치(px)를 나타냅니다.
 */
export const RESEARCH_NODES: ResearchNode[] = [
  // --- Root Node ---
  {
    id: 'root',
    name: 'Drilling Basics',
    description: 'The foundation of all mining techniques.',
    icon: '⚙️',
    cost: { goldCoins: 0 },
    effect: { type: 'power', value: 0 },
    dependencies: [],
  },

  // --- Attack Power Path (UPWARDS Branch) ---
  {
    id: 'power_1',
    name: 'Sharpened Bits',
    description: 'Increases base power by 10.',
    icon: '⚔️',
    cost: { stone: 50, goldCoins: 1000 },
    effect: { type: 'power', value: 10 },
    dependencies: ['root'],
  },
  {
    id: 'power_2',
    name: 'Tungsten Coating',
    description: 'Increases base power by 25.',
    icon: '🧨',
    cost: { iron: 100, goldCoins: 5000 },
    effect: { type: 'power', value: 25 },
    dependencies: ['power_1'],
  },
  {
    id: 'power_3',
    name: 'Diamond Tipped',
    description: 'Increases base power by 60.',
    icon: '💎',
    cost: { diamond: 50, goldCoins: 20000 },
    effect: { type: 'power', value: 60 },
    dependencies: ['power_1'],
  },

  // --- Mining Speed Path (DOWNWARDS Branch) ---
  {
    id: 'speed_1',
    name: 'High-Torque Motor',
    description: 'Reduces mining cooldown by 5%.',
    icon: '🌀',
    cost: { coal: 50, goldCoins: 1000 },
    effect: { type: 'miningSpeed', value: 0.05 },
    dependencies: ['root'],
  },
  {
    id: 'speed_2',
    name: 'Overclocked Rotors',
    description: 'Reduces mining cooldown by 10%.',
    icon: '⚡',
    cost: { iron: 100, goldCoins: 5000 },
    effect: { type: 'miningSpeed', value: 0.1 },
    dependencies: ['speed_1'],
  },
  {
    id: 'speed_3',
    name: 'Uranium Fuel Cell',
    description: 'Reduces mining cooldown by 20%.',
    icon: '☢️',
    cost: { uranium: 50, goldCoins: 50000 },
    effect: { type: 'miningSpeed', value: 0.2 },
    dependencies: ['speed_1'],
  },

  // --- Utility Path (SIDES Branch) ---
  {
    id: 'util_1',
    name: 'Better Suspension',
    description: 'Increases movement speed by 10%.',
    icon: '🏎️',
    cost: { dirt: 200, goldCoins: 500 },
    effect: { type: 'moveSpeed', value: 0.1 },
    dependencies: ['root'],
  },
  {
    id: 'exp_1',
    name: 'Quick Learning',
    description: 'Increases mastery experience gain by 15%.',
    icon: '📖',
    cost: { coal: 300, iron: 100, goldCoins: 5000 },
    effect: { type: 'masteryExp', value: 0.15 },
    dependencies: ['util_1'],
  },
  {
    id: 'exp_2',
    name: 'Analytical Drilling',
    description: 'Increases mastery experience gain by 30%.',
    icon: '🧪',
    cost: { uranium: 100, diamond: 30, goldCoins: 25000 },
    effect: { type: 'masteryExp', value: 0.3 },
    dependencies: ['exp_1'],
  },
  {
    id: 'util_2',
    name: 'Cargo Expansion',
    description: 'Increases gold gains from selling by 15%.',
    icon: '💰',
    cost: { gold: 100, goldCoins: 10000 },
    effect: { type: 'goldBonus', value: 0.15 },
    dependencies: ['root'],
  },
  {
    id: 'util_3',
    name: 'Geological Scanner',
    description: 'Increases luck (rare spawn chance) by 20%.',
    icon: '📡',
    cost: { sapphire: 50, emerald: 50, goldCoins: 30000 },
    effect: { type: 'luck', value: 0.2 },
    dependencies: ['util_2'],
  },
];
