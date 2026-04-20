import { MonsterDefinition } from './types';

export const circle6Monsters: MonsterDefinition[] = [
  {
    id: 'c6_priest',
    name: 'Heretic Priest',
    nameKo: '이단 사제',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 35000, power: 800, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 3500,
      gold: 700,
      drops: [
        { itemId: 'essence_heresy', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c6_flame',
    name: 'Eternal Flame Soul',
    nameKo: '영겁의 불꽃 영혼',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 30000, power: 1200, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 3000,
      gold: 600,
      drops: [
        { itemId: 'essence_heresy', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c6_angel',
    name: 'Fallen Angel',
    nameKo: '타락한 천사',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 50000, power: 900, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 5000,
      gold: 1000,
      drops: [
        { itemId: 'essence_heresy', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c6_samael',
    name: 'Samael',
    nameKo: '사마엘',
    type: 'boss',
    imagePath: 'Asmodeus',
    description:
      '검게 물든 천사 날개, 온몸에 독이 흘러내림. 피부는 창백하고 균열이 가득하며 틈에서 보라빛 독액이 흘러나옴. 부러진 후광, 독이 묻은 검',
    stats: { maxHp: 900000, power: 3500, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 450000,
      gold: 90000,
      drops: [
        { itemId: 'essence_heresy', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_belphegor_eye', chance: 0.2, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
];
