import { MonsterDefinition } from './types';

export const circle2Monsters: MonsterDefinition[] = [
  {
    id: 'c2_whisperer',
    name: 'Lustful Whisperer',
    nameKo: '유혹하는 속삭임',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 80, power: 5, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 50,
      gold: 20,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c2_wind_soul',
    name: 'Wind-torn Soul',
    nameKo: '바람에 찢긴 영혼',
    type: 'monster',
    imagePath: 'WindTornSoul',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 250, power: 20, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 60,
      gold: 12,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c2_gale_bat',
    name: 'Gale Bat',
    nameKo: '돌풍 박쥐',
    type: 'monster',
    imagePath: 'GaleBat',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 150, power: 18, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 45,
      gold: 9,
      drops: [
        { itemId: 'essence_lust', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c2_asmodeus',
    name: 'Asmodeus',
    nameKo: '아스모데우스',
    type: 'boss',
    imagePath: 'Asmodeus',
    description:
      '3개의 머리 (황소, 인간, 숫양), 불꽃 날개, 뱀 꼬리. 몸 전체에서 붉은 열기가 뿜어져 나옴',
    stats: { maxHp: 12000, power: 85, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 7500,
      gold: 1500,
      drops: [
        { itemId: 'essence_lust', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_asmodeus_ring', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: {
      movementType: 'stationary',
      attackRange: 2.5,
      aggroRange: 10,
      projectileId: 'FireBall',
      respawnMs: 10000,
    },
    patterns: [
      {
        type: 'shot',
        cooldown: 5500,
        warningLeadTime: 1000,
        projectileCount: 1,
        projectileSpeed: 5,
        projectilePower: 15,
        projectileSize: 128,
        phaseOverrides: [
          { projectileCount: 1, projectileSpeed: 5,  projectilePower: 15 },
          { projectileCount: 3, projectileSpeed: 8,  projectilePower: 23 },
          { projectileCount: 5, projectileSpeed: 12, projectilePower: 31 },
        ],
      },
      {
        type: 'cross',
        cooldown: 4000,
        warningLeadTime: 1000,
        minPhase: 2,
        projectileSpeed: 7,
        projectilePower: 23,
        projectileSize: 128,
        phaseOverrides: [
          { projectileSpeed: 7,  projectilePower: 23 },
          { projectileSpeed: 7,  projectilePower: 23 },
          { projectileSpeed: 10, projectilePower: 39 },
        ],
      },
      {
        type: 'lure',
        cooldown: 5000,
        minPhase: 3,
        lureDuration: 2000,
        lureCycle: 5000,
      },
    ],
    phases: [
      { phase: 2, hpThreshold: 70 },
      { phase: 3, hpThreshold: 40 },
    ],
  },
];
