import { TileMap } from '../tile/TileMap';
import { Player } from '../player/model';
import { Entity, GameAssets, Particle, FloatingText, DroppedItem, InteractionType, TILE_TYPE_TO_ID, ID_TO_TILE_TYPE, TileType } from '@/shared/types/game';
import { ObjectPool } from '@/shared/lib/effectPool';
import { EntityManager } from '@/features/game/lib/EntityManager';
import { SpatialHash } from '@/features/game/lib/SpatialHash';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * [초고속] 드랍 아이템 관리 클래스 (SoA + Pooling)
 */
export class DroppedItemManager {
  public capacity: number;
  public active: Uint8Array;
  public generation: Uint16Array;
  public typeId: Uint8Array;
  public x: Float32Array;
  public y: Float32Array;
  public vx: Float32Array;
  public vy: Float32Array;
  public life: Float32Array;
  
  public blockedDropCount: number = 0;
  private nextIdx: number = 0;

  constructor(capacity: number = 500) {
    this.capacity = capacity;
    this.active = new Uint8Array(capacity);
    this.generation = new Uint16Array(capacity);
    this.typeId = new Uint8Array(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
  }

  /** 새로운 아이템을 풀에서 활성화 (generation-based ID 반환) */
  public spawn(type: TileType, x: number, y: number, vx: number, vy: number): number {
    const start = this.nextIdx;
    do {
      const idx = this.nextIdx;
      this.nextIdx = (this.nextIdx + 1) % this.capacity;

      if (!this.active[idx]) {
        this.active[idx] = 1;
        this.typeId[idx] = TILE_TYPE_TO_ID[type] || 0;
        this.x[idx] = x;
        this.y[idx] = y;
        this.vx[idx] = vx;
        this.vy[idx] = vy;
        this.life[idx] = 0;
        
        // 0xFFFF 오버플로우는 & 연산으로 안전하게 처리
        this.generation[idx] = (this.generation[idx] + 1) & 0xFFFF;
        
        return (this.generation[idx] << 16) | idx;
      }
    } while (this.nextIdx !== start);

    this.blockedDropCount++;
    return -1; // 풀 가득 참
  }

  /** 아이템 비활성화 */
  public kill(index: number) {
    if (index >= 0 && index < this.capacity) {
      this.active[index] = 0;
    }
  }

  /** 모든 아이템 초기화 (차원 이동 시) */
  public clear() {
    this.active.fill(0);
    this.blockedDropCount = 0;
    this.nextIdx = 0;
  }
}

/**
 * 게임의 모든 상태를 포함하는 최상위 월드 객체 인터페이스입니다.
 */
export interface GameWorld {
  /** 타일 맵 데이터 관리 객체 */
  tileMap: TileMap;
  /** 플레이어 캐릭터 상태 데이터 */
  player: Player;
  /** 월드 내에 존재하는 모든 엔티티(NPC 등) SoA 관리 객체 */
  entities: EntityManager;
  /** 기존 JSON 기반의 정적 NPC 및 상호작용 오브젝트 (상점, 제련소 등) */
  staticEntities: Entity[];
  /** 활성화된 시각적 파티클 리스트 (풀링 적용) */
  particlePool: ObjectPool<Particle>;
  /** 파티클 접근용 래퍼 (하위 호환성) */
  particles: Particle[];
  /** 화면에 표시 중인 플로팅 텍스트 리스트 (풀링 적용) */
  floatingTextPool: ObjectPool<FloatingText>;
  /** 텍스트 접근용 래퍼 (하위 호환성) */
  floatingTexts: FloatingText[];
  /** 드랍된 아이템 관리 객체 (TypedArray 풀링) */
  droppedItemPool: DroppedItemManager;
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
    action: 'none' | 'interact' | 'artifact';
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
    activeInteractionType: InteractionType | null;
    isShopOpen: boolean;
    isInventoryOpen: boolean;
    isSettingsOpen: boolean;
    isCraftingOpen: boolean;
    isElevatorOpen: boolean;
    isStatusOpen: boolean;
    isEncyclopediaOpen: boolean;
    isRefineryOpen: boolean;
    isLaboratoryOpen: boolean;
    isGuideOpen: boolean;
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
  /** 엔티티 충돌 최적화를 위한 공간 분할 그리드 */
  spatialHash: SpatialHash;
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
  const result: GameWorld = {
    tileMap,
    player: {
      stats: {
        depth: 0,
        equippedDrillId: 'rusty_drill',
        ownedDrillIds: ['rusty_drill'],
        equippedDroneId: null,
        ownedDroneIds: [],
        activeSmeltingJobs: [],
        refinerySlots: 1,
        maxDepthReached: 0,
        artifacts: [],
        equippedArtifactId: null,
        artifactCooldowns: {},
        hp: 200,
        maxHp: 200,
        power: 10,
        moveSpeed: 100,
        inventory: {
          crimsonstone: 0, galestone: 0, fervorstone: 0,
          moldstone: 0, siltstone: 0, gorestone: 0,
          goldstone: 0, luststone: 0, midasite: 0,
          ragestone: 0, cinderstone: 0, furystone: 0,
          ashstone: 0, blightstone: 0, vexite: 0,
          thornstone: 0, bloodstone: 0, cruelite: 0,
          mimicite: 0, lurerstone: 0, phantomite: 0,
          froststone: 0, glacialite: 0, abyssstone: 0, stone: 0,
        },
        inventoryRunes: [],
        goldCoins: 0,
        mapSeed: seed,
        discoveredMinerals: [],
        encounteredBossIds: [],
        dimension: 0,
        equipmentStates: {},
        unlockedResearchIds: ['root'],
        tileMastery: {},
        unlockedMasteryPerks: [],
      },
      pos: { x: 15, y: 8 },
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
    },
    entities: new EntityManager(5000),
    staticEntities: [],
    particlePool: new ObjectPool<Particle>(() => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '#fff', size: 2, active: false
    }), 1000),
    particles: [],
    floatingTextPool: new ObjectPool<FloatingText>(() => ({
      x: 0, y: 0, text: '', color: '#fff', life: 0, active: false
    }), 100),
    floatingTexts: [],
    droppedItemPool: new DroppedItemManager(500),
    activeDrone: null,
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
      isGuideOpen: false,
      isMobile: false,
    },
    mobileJoystick: {
      x: 0,
      y: 0,
      active: false,
    },
    shake: 0,
    spatialHash: new SpatialHash(120),
    spawnedCoords: new Set(),
  };

  result.particles = result.particlePool.getPool();
  result.floatingTexts = result.floatingTextPool.getPool();
  
  return result;
};
