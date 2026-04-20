import { MonsterDefinition } from './types';

export const circle3Monsters: MonsterDefinition[] = [
  {
    id: 'c3_devourer',
    name: 'Bloated Devourer',
    nameKo: '비대한 포식자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1500, power: 60, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 150,
      gold: 30,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_worm',
    name: 'Starving Wraith',
    nameKo: '굶주린 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1200, power: 70, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 120,
      gold: 24,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_mud_shade',
    name: 'Greedy slaughter',
    nameKo: '탐식의 도살자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1800, power: 50, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 180,
      gold: 36,
      drops: [
        { itemId: 'essence_gluttony', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_Fenrir',
    name: 'Fenrir',
    nameKo: '펜리르',
    type: 'boss',
    imagePath: 'Asmodeus',
    description:
      '거대한 파리 형태, 썩은 날개, 복부가 비정상적으로 부풀어있음. 주변에 파리 떼가 항상 들끓음',
    stats: { maxHp: 45000, power: 250, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 22500,
      gold: 4500,
      drops: [
        { itemId: 'essence_gluttony', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_beelzebub_needle', chance: 0.5, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'stationary', attackRange: 2.5, aggroRange: 10, respawnMs: 15000 },
    patterns: [
      {
        type: 'swarm',
        cooldown: 4000,
        warningLeadTime: 1000,
        projectileCount: 15,
        projectileSpeed: 4,
        projectilePower: 25,
        projectileSize: 64,
        phaseOverrides: [
          { projectileCount: 15, projectileSpeed: 4 },
          { projectileCount: 25, projectileSpeed: 6 },
          { projectileCount: 40, projectileSpeed: 8 },
        ],
      },
      {
        type: 'gravity',
        cooldown: 100,
        minPhase: 2,
      },
      {
        type: 'aoe',
        cooldown: 6000,
        minPhase: 3,
        projectileCount: 24,
        projectileSpeed: 7,
        projectilePower: 120,
        projectileSize: 128,
        warningLeadTime: 1500,
      },
    ],
    phases: [
      { phase: 2, hpThreshold: 70 },
      { phase: 3, hpThreshold: 35 },
    ],
  },
];
