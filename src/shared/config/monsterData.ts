import { Rarity } from '../types/game';

export interface MonsterDefinition {
  id: string;
  name: string;
  imagePath: string;
  minDepth: number;
  maxDepth: number;
  rarity: Rarity;
  mechanic?: 'critical_only'; // 특수 기믹
  stats: {
    hp: number;
    attack: number;
    speed: number;
    defense: number;
  };
  spawnWeight: number;
}

export const MONSTERS: MonsterDefinition[] = [
  {
    id: 'pebble_golem',
    name: '꼬마 바위 골렘',
    imagePath: 'PebbleGolem.png',
    minDepth: 0,
    maxDepth: 500,
    rarity: 'Common',
    stats: {
      hp: 120,
      attack: 10,
      speed: 0,
      defense: 20,
    },
    spawnWeight: 0.1,
  },
  {
    id: 'thief_mole',
    name: '도둑 두더지',
    imagePath: 'ThiefMole.png',
    minDepth: 100,
    maxDepth: 600,
    rarity: 'Uncommon',
    stats: {
      hp: 80,
      attack: 5,
      speed: 0,
      defense: 5,
    },
    spawnWeight: 0.05,
  },
  {
    id: 'iron_scale_tortoise',
    name: '강철비늘 거북',
    imagePath: 'SteelScaleTurtle.png',
    minDepth: 200,
    maxDepth: 700,
    rarity: 'Rare',
    mechanic: 'critical_only',
    stats: {
      hp: 200,
      attack: 15,
      speed: 0,
      defense: 100,
    },
    spawnWeight: 0.03,
  },
  {
    id: 'oros_face',
    name: '태고의 바위 오로스',
    imagePath: 'OrosFace.png',
    minDepth: 480,
    maxDepth: 550,
    rarity: 'Legendary',
    stats: {
      hp: 1500, // 첫 보스다운 체력
      attack: 25,
      speed: 0,
      defense: 50,
    },
    spawnWeight: 0, // 수동 스폰되므로 0 설정
  },
];

/**
 * 특정 깊이에서 생성 가능한 몬스터 목록을 반환합니다.
 */
export const getAvailableMonsters = (depth: number): MonsterDefinition[] => {
  return MONSTERS.filter(m => depth >= m.minDepth && depth <= m.maxDepth);
};
