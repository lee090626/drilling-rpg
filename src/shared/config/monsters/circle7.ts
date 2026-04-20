import { MonsterDefinition } from './types';

export const circle7Monsters: MonsterDefinition[] = [
  {
    id: 'c7_centaur',
    name: 'Centaur Archer',
    nameKo: '켄타우로스 궁수',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Violence 서클의 하급 영혼입니다.',
    stats: { maxHp: 120000, power: 2500, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 12000,
      gold: 2400,
      drops: [
        { itemId: 'essence_violence', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c7_guard',
    name: 'Blood-soaked Guard',
    nameKo: '선혈의 경비병',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Violence 서클의 하급 영혼입니다.',
    stats: { maxHp: 180000, power: 3000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 18000,
      gold: 3600,
      drops: [
        { itemId: 'essence_violence', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c7_spawn',
    name: 'Minotaur Spawn',
    nameKo: '미노타우로스 하수인',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Violence 서클의 하급 영혼입니다.',
    stats: { maxHp: 250000, power: 4500, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 25000,
      gold: 5000,
      drops: [
        { itemId: 'essence_violence', chance: 1, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c7_belial',
    name: 'Belial',
    nameKo: '벨리알',
    type: 'boss',
    imagePath: 'Asmodeus',
    description: '불꽃 전차를 탄 타락천사, 두 개의 검은 날개, 온몸이 불꽃으로 이루어진 형태',
    stats: { maxHp: 3000000, power: 15000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 1500000,
      gold: 300000,
      drops: [
        { itemId: 'essence_violence', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
        { itemId: 'relic_leviathan_mirror', chance: 0.15, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
];
