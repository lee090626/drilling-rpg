import { PlayerStats, Position } from '../../shared/types/game';

export interface Player {
  stats: PlayerStats;
  pos: Position;
  velocity: Position;
  visualPos: Position;
  isDrilling: boolean;
  lastHitTime: number; // 타격 흔들림 효과를 위해 마지막 타격 시간 기록
}

export const createInitialPlayer = (seed: number): Player => ({
  stats: {
    depth: 0,
    equippedDrillId: 'rusty_drill',
    ownedDrillIds: ['rusty_drill'],
    maxDepthReached: 0,
    artifacts: [],
    hp: 200,
    maxHp: 200,
    attackPower: 10,
    inventory: {
      dirt: 0, stone: 0, coal: 0, iron: 0, gold: 0, diamond: 0,
      emerald: 0, ruby: 0, sapphire: 0, uranium: 0, obsidian: 0,
    },
    goldCoins: 0,
    mapSeed: seed,
    activeQuests: [],
    completedQuestIds: [],
    discoveredMinerals: [],
    encounteredBossIds: [],
    dimension: 0,
  },
  pos: { x: 15, y: 8 }, // Default to MAP_WIDTH / 2
  velocity: { x: 0, y: 0 },
  visualPos: { x: 15, y: 8 },
  isDrilling: false,
  lastHitTime: 0,
});
