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
  /** 스탯 동기화 여부 (런타임 전용 플래그) */
  _statsSynced?: boolean;
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
    // 장비 상태
    equipment: {
      drillId: null,
      helmetId: null,
      armorId: null,
      bootsId: null,
    },
    ownedEquipmentIds: [],
    maxDepthReached: 0,
    artifacts: [],
    equippedArtifactId: null,
    artifactCooldowns: {},
    hp: 200,
    maxHp: 200,
    power: 10,
    moveSpeed: 100,
    defense: 0,
    luck: 0,
    inventory: {
      crimsonstone: 0,
      galestone: 0,
      fervorstone: 0,
      moldstone: 0,
      siltstone: 0,
      gorestone: 0,
      goldstone: 0,
      luststone: 0,
      midasite: 0,
      ragestone: 0,
      cinderstone: 0,
      furystone: 0,
      ashstone: 0,
      blightstone: 0,
      vexite: 0,
      thornstone: 0,
      bloodstone: 0,
      cruelite: 0,
      mimicite: 0,
      lurerstone: 0,
      phantomite: 0,
      froststone: 0,
      glacialite: 0,
      abyssstone: 0,
      stone: 0,
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
  _statsSynced: false,
});
