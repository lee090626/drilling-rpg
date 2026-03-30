import { TileMap } from '../tile/TileMap';
import { Player } from '../player/model';
import { Entity, GameAssets, Particle, FloatingText, DroppedItem } from '../../shared/types/game';

/**
 * 게임의 모든 상태를 포함하는 최상위 월드 객체 인터페이스입니다.
 */
export interface GameWorld {
  /** 타일 맵 데이터 관리 객체 */
  tileMap: TileMap;
  /** 플레이어 캐릭터 상태 데이터 */
  player: Player;
  /** 월드 내에 존재하는 모든 엔티티(NPC 등) 리스트 */
  entities: Entity[];
  /** 활성화된 시각적 파티클 리스트 */
  particles: Particle[];
  /** 화면에 표시 중인 플로팅 텍스트 리스트 */
  floatingTexts: FloatingText[];
  /** 드랍된 아이템 리스트 */
  droppedItems: DroppedItem[];
  /** 활성화되어 플레이어를 따라다니는 펫 드론의 물리 및 애니메이션 상태 */
  activeDrone: {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetX: number | null;
    targetY: number | null;
    lastHitTime: number;
  } | null;
  /** 현재 눌려 있는 키보드 상태 맵 */
  keys: { [key: string]: boolean };
  /** 지상 베이스 캠프의 타일 레이아웃 데이터 */
  baseLayout: number[][] | null;
  /** 로드된 게임 자산(이미지 등) */
  assets: GameAssets;
  /** 플레이어의 게임 플레이 의도(이동 방향, 액션 등) */
  intent: {
    moveX: number;
    moveY: number;
    action: 'none' | 'interact';
    /** 현재 채굴 조준 중인 타일의 좌표 */
    miningTarget: { x: number, y: number } | null;
  };
  /** 각종 동작의 마지막 실행 시간을 관리하는 타임스탬프 객체 */
  timestamp: {
    lastMove: number;
    lastMiningTime: number; // 채굴 전용 타임스탬프 추가
    lastUiUpdate: number;
    lastGlobalRegen: number;
    lastLoop: number;
  };
  /** 각종 UI 모달창의 열림/닫힘 상태를 관리하는 객체 */
  ui: {
    showInteractionPrompt: boolean;
    activeInteractionType: 'shop' | 'dialog' | 'crafting' | 'elevator' | 'refinery' | null;
    isShopOpen: boolean;
    isInventoryOpen: boolean;
    isSettingsOpen: boolean;
    isCraftingOpen: boolean;
    isElevatorOpen: boolean;
    isStatusOpen: boolean;
    isEncyclopediaOpen: boolean;
    isRefineryOpen: boolean;
    isLaboratoryOpen: boolean;
    isMobile: boolean; // 모바일 모드 활성 여부
  };
  /** 모바일 가상 조이스틱 입력 상태 */
  mobileJoystick: {
    x: number;
    y: number;
    active: boolean;
  };
  /** 현재 화면 흔들림 강도 (0: 흔들림 없음) */
  shake: number;
  /** 이미 몬스터 생성이 확인된 타일 좌표 세트 ("x,y") */
  spawnedCoords: Set<string>;
}

/**
 * 게임 시작 시 사용할 초기 월드 상태를 생성합니다.
 * 
 * @param seed - 월드 생성을 위한 랜덤 시드
 * @returns 초기화된 GameWorld 객체
 */
export const createInitialWorld = (seed: number): GameWorld => {
  const tileMap = new TileMap(seed, 0);
  return {
    tileMap,
    player: {
      stats: {
        depth: 0,
        equippedDrillId: 'rusty_drill',
        ownedDrillIds: ['rusty_drill'],
        equippedDroneId: null, // 시작 시 드론 없음
        ownedDroneIds: [],
        activeSmeltingJobs: [], // 진행 중인 제련 작업 없음
        refinerySlots: 1,       // 기본 슬롯 1개
        maxDepthReached: 0,
        artifacts: [],
        hp: 200,
        maxHp: 200,
        attackPower: 10,
        moveSpeed: 100,
        inventory: {
          dirt: 0, stone: 0, coal: 0, iron: 0, gold: 0, diamond: 0,
          emerald: 0, ruby: 0, sapphire: 0, uranium: 0, obsidian: 0,
          iron_ingot: 0, gold_ingot: 0, polished_diamond: 0,
        },
        inventoryRunes: [],
        goldCoins: 0,
        mapSeed: seed,
        discoveredMinerals: [],
        encounteredBossIds: [],
        dimension: 0,
        equipmentStates: {},
        unlockedResearchIds: ['root'],
      },
      pos: { x: 15, y: 8 },
      velocity: { x: 0, y: 0 },
      visualPos: { x: 15, y: 8 },
      isDrilling: false,
      lastHitTime: 0,
      lastAttackTime: 0,
    },
    entities: [],
    particles: [],
    floatingTexts: [],
    droppedItems: [],
    activeDrone: null, // 처음엔 소환된 드론 없음
    keys: {},
    baseLayout: null,
    assets: {
      tileset: null,
      baseTileset: null,
      player: null,
      boss: null,
      entities: {},
      resources: {},
    },
    intent: {
      moveX: 0,
      moveY: 0,
      action: 'none',
      miningTarget: null,
    },
    timestamp: {
      lastMove: 0,
      lastMiningTime: 0,
      lastUiUpdate: 0,
      lastGlobalRegen: Date.now(),
      lastLoop: 0,
    },
    ui: {
      showInteractionPrompt: false,
      activeInteractionType: null,
      isShopOpen: false,
      isInventoryOpen: false,
      isSettingsOpen: false,
      isCraftingOpen: false,
      isElevatorOpen: false,
      isStatusOpen: false,
      isEncyclopediaOpen: false,
      isRefineryOpen: false,
      isLaboratoryOpen: false,
      isMobile: false,
    },
    mobileJoystick: {
      x: 0,
      y: 0,
      active: false,
    },
    shake: 0,
    spawnedCoords: new Set(),
  };
};
