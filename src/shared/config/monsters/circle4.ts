import { MonsterDefinition } from './types';

export const circle4Monsters: MonsterDefinition[] = [
  {
    id: 'c4_hoarder',
    name: 'Hoarding Specter',
    nameKo: '수집가 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 4000, power: 120, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 400,
      gold: 80,
      drops: [
        { itemId: 'essence_greed', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c4_sinner',
    name: 'Gilded Sinner',
    nameKo: '황금 죄인',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 5500, power: 150, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 550,
      gold: 110,
      drops: [
        { itemId: 'essence_greed', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c4_mimic',
    name: 'Fortune Mimic',
    nameKo: '운명의 미믹',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 3500, power: 200, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 350,
      gold: 70,
      drops: [
        { itemId: 'essence_greed', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c4_mammon',
    name: 'Mammon',
    nameKo: '마몬',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: '황금 갑옷으로 뒤덮인 거대 인간형, 눈이 황금 동전. 몸에서 금화가 흘러내림',
    stats: { maxHp: 120000, power: 500, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 60000,
      gold: 12000,
      drops: [
        { itemId: 'essence_greed', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_mammon_coin', chance: 0.4, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
];
