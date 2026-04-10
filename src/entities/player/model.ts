import { PlayerStats, Position } from '@/shared/types/game';

/**
 * 게임 내 플레이어 캐릭터의 상태를 나타내는 인터페이스입니다.
 */
export interface Player {
  /** 플레이어의 통계 및 게임 진행 데이터 */
  stats: PlayerStats;
  /** 논리적인 그리드 상의 위치 */
  pos: Position;
  /** 플레이어의 현재 이동 속도 (미사용 가능성 있음) */
  velocity: Position;
  /** 화면에 부드럽게 렌더링하기 위한 시각적 위치 */
  visualPos: Position;
  /** 현재 드릴을 사용 중(채굴 중)인지 여부 */
  isDrilling: boolean;
  /** 타격 흔들림 효과를 위해 마지막으로 타격이 발생한 시간 (밀리초) */
  lastHitTime: number;
  /** 마지막 공격 시간 */
  lastAttackTime: number;
  /** 런타임 버프 및 일시적 상태 관리 */
  buffs: {
    /** 이동 속도 증가 만료 시간 (타임스탬프) */
    speedBoostUntil: number;
    /** 이동 속도 배율 (예: 1.2 = 20% 증가) */
    speedBoostMultiplier: number;
  };
}

/**
 * 새로운 게임 시작 시 초기 플레이어 상태를 생성합니다.
 * 
 * @param seed - 월드 생성을 위한 시드 값 (통계 저장용)
 * @returns 초기화된 Player 객체
 */
export const createInitialPlayer = (seed: number): Player => ({
  stats: {
    depth: 0,
    equippedDrillId: 'rusty_drill',
    ownedDrillIds: ['rusty_drill'],
    maxDepthReached: 0,
    artifacts: [],
    equippedArtifactId: null,
    artifactCooldowns: {},
    hp: 200,
    maxHp: 200,
    power: 10,
    moveSpeed: 100,
    inventory: {
      dirt: 0, stone: 0, coal: 0, iron: 0, gold: 0, diamond: 0,
      emerald: 0, ruby: 0, sapphire: 0, uranium: 0, obsidian: 0,
      iron_ingot: 0, gold_ingot: 0, polished_diamond: 0,
    },
    equippedDroneId: null,
    ownedDroneIds: [],
    activeSmeltingJobs: [],
    refinerySlots: 1,
    inventoryRunes: [],
    goldCoins: 0,
    mapSeed: seed,
    discoveredMinerals: [],
    encounteredBossIds: [],
    dimension: 0,
    equipmentStates: {},
    tileMastery: {},
    unlockedResearchIds: ['root'],
    unlockedMasteryPerks: [],
  },
  pos: { x: 15, y: 8 }, // 보스 센터(x=15) 근처에서 시작
  velocity: { x: 0, y: 0 },
  visualPos: { x: 15, y: 8 },
  isDrilling: false,
  lastHitTime: 0,
  lastAttackTime: 0,
  buffs: {
    speedBoostUntil: 0,
    speedBoostMultiplier: 1.0,
  },
});
