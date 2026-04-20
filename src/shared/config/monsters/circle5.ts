import { MonsterDefinition } from './types';

export const circle5Monsters: MonsterDefinition[] = [
  {
    id: 'c5_dweller',
    name: 'Styx Dweller',
    nameKo: '스틱스의 거주자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 12000, power: 300, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 1200,
      gold: 240,
      drops: [
        { itemId: 'essence_wrath', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c5_fury',
    name: 'Raging Fury',
    nameKo: '격노한 복수심',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 10000, power: 450, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 1000,
      gold: 200,
      drops: [
        { itemId: 'essence_wrath', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c5_golem',
    name: 'Mud Golem',
    nameKo: '진흙 골렘',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 25000, power: 250, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 2500,
      gold: 500,
      drops: [
        { itemId: 'essence_wrath', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c5_azazel',
    name: 'Azazel',
    nameKo: '아자젤',
    type: 'boss',
    imagePath: 'Player',
    description: '타락한 천사, 검게 그을린 날개, 온몸에 쇠사슬이 감겨있음. 눈에서 붉은 불꽃',
    stats: { maxHp: 350000, power: 1200, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 175000,
      gold: 35000,
      drops: [
        { itemId: 'essence_wrath', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_satan_heart', chance: 0.3, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
];
