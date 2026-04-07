import { Rarity } from '../types/game';

export interface MonsterDefinition {
  id: string;
  name: string;
  icon: string;
  minDepth: number;
  maxDepth: number;
  rarity: Rarity;
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
    id: 'cave_slime',
    name: 'Cave Slime',
    icon: '🦠',
    minDepth: 50,
    maxDepth: 500,
    rarity: 'Common',
    stats: {
      hp: 30000,
      attack: 0,
      speed: 0.02,
      defense: 0,
    },
    spawnWeight: 0.1,
  },
  {
    id: 'rock_crawler',
    name: 'Rock Crawler',
    icon: '🦂',
    minDepth: 300,
    maxDepth: 1000,
    rarity: 'Common',
    stats: {
      hp: 80,
      attack: 25,
      speed: 0.03,
      defense: 5,
    },
    spawnWeight: 0.08,
  },
  {
    id: 'void_bat',
    name: 'Void Bat',
    icon: '🦇',
    minDepth: 800,
    maxDepth: 2000,
    rarity: 'Common',
    stats: {
      hp: 250,
      attack: 40,
      speed: 0.05,
      defense: 0,
    },
    spawnWeight: 0.05,
  },
  {
    id: 'ancient_shard',
    name: 'Ancient Shard',
    icon: '💎',
    minDepth: 1200,
    maxDepth: 3000,
    rarity: 'Common',
    stats: {
      hp: 2500,
      attack: 100,
      speed: 0.01,
      defense: 50,
    },
    spawnWeight: 0.02,
  },
];

/**
 * 특정 깊이에서 생성 가능한 몬스터 목록을 반환합니다.
 */
export const getAvailableMonsters = (depth: number): MonsterDefinition[] => {
  return MONSTERS.filter(m => depth >= m.minDepth && depth <= m.maxDepth);
};
