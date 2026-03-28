/**
 * 광물 및 아이템의 희귀 등급을 정의합니다.
 */
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Radiant' | 'Legendary' | 'Mythic' | 'Ancient';

/**
 * 게임 내 타일의 종류를 정의합니다.
 */
export type TileType =
  | 'dirt'            // 흙
  | 'stone'           // 돌
  | 'coal'            // 석탄
  | 'iron'            // 철
  | 'gold'            // 금
  | 'diamond'         // 다이아몬드
  | 'emerald'         // 에메랄드
  | 'ruby'            // 루비
  | 'sapphire'        // 사파이어
  | 'uranium'         // 우라늄
  | 'obsidian'        // 옵시디언
  | 'lava'            // 용암
  | 'dungeon_bricks'  // 던전 벽돌
  | 'boss_core'       // 보스 코어
  | 'boss_skin'       // 보스 외피
  | 'monster_nest'    // 몬스터 둥지
  | 'empty'           // 빈 공간
  | 'wall'            // 파괴 불가능한 벽
  | 'portal'          // 차원 관문
  | 'iron_ingot'      // 가공된 철 주괴
  | 'gold_ingot'      // 가공된 금 주괴
  | 'polished_diamond'; // 가공된 다이아몬드

/**
 * 타일 객체의 구조를 정의합니다.
 */
export interface Tile {
  /** 타일의 종류 */
  type: TileType;
  /** 현재 내구도 (0이 되면 파괴됨) */
  health: number;
  /** 최대 내구도 */
  maxHealth: number;
}

/**
 * 플레이어의 인벤토리 구조입니다.
 * 광물 종류별로 수량을 저장합니다.
 */
export type Inventory = {
  [K in Exclude<TileType, 'empty' | 'wall' | 'portal' | 'boss_core' | 'boss_skin' | 'monster_nest' | 'lava' | 'dungeon_bricks'>]: number;
} & {
  [key: string]: number;
};

/**
 * 스킬 정보를 정의합니다.
 */
export interface Skill {
  /** 스킬 고유 ID */
  id: string;
  /** 스킬 이름 */
  name: string;
  /** 스킬 상세 설명 */
  description: string;
  /** 재사용 대기 시간 (초 단위) */
  cooldown: number;
  /** 스킬 타입 (능동형 또는 수동형) */
  type: 'active' | 'passive';
  /** 발동될 효과의 ID */
  effectId: string;
}

/**
 * 연구(스킬트리) 효과의 종류와 수치를 정의합니다.
 */
export interface ResearchEffect {
  type: 'attackPower' | 'miningSpeed' | 'moveSpeed' | 'luck' | 'maxHp' | 'defense' | 'goldBonus';
  value: number;
}

/**
 * 연구소의 개별 연구 노드를 정의합니다.
 */
export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: { [key: string]: number };
  effect: ResearchEffect;
  position?: { x: number; y: number };
  dependencies: string[]; // 선행 연구 ID 목록
}

/**
 * 특정 장비의 강화 및 스킬 장착 상태를 관리합니다.
 */
export interface EquipmentState {
  /** 장비 ID */
  id: string;
  /** 장착된 스킬룬의 인스턴스 ID 목록 (인덱스는 슬롯 위치를 의미함) */
  slottedRunes: (string | null)[];
  /** 현재 장비가 획득한 경험치 */
  exp: number;
  /** 장비의 숙련도 레벨 */
  level: number;
}

/**
 * 드릴 또는 곡괭이 장비의 기본 명세를 정의합니다.
 */
export interface Drill {
  /** 장비 고유 ID */
  id: string;
  /** 장비 이름 */
  name: string;
  /** 장비 설명 */
  description: string;
  /** UI에 표시될 아이콘 */
  icon: string;
  /** 장비 이미지 (StaticImageData 또는 HTMLImageElement) */
  image?: any;
  /** 장비 종류 */
  equipmentType: 'drill' | 'pickaxe';
  /** 기본 채굴 위력 */
  basePower: number;
  /** 기본 공격 간격 (밀리초 단위) */
  cooldownMs: number;
  /** 장착 시 부여되는 특수 효과 */
  specialEffect?: 'lucky' | 'explosive' | 'efficient' | 'speed';
  /** 이동 속도 배수 */
  moveSpeedMult?: number;
  /** 채굴 범위 (미래 확장을 위한 옵션) */
  miningArea?: number;
  /** 구매/제작 시 필요한 재료 및 비용 */
  price?: { [key: string]: number };
  /** 장비에 장착 가능한 최대 스킬룬 슬롯 수 */
  maxSkillSlots?: number;
}

/**
 * 플레이어와 동행하며 보조 채굴을 돕는 펫 드론의 명세입니다.
 */
export interface Drone {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'mining' | 'support'; // 드론 유형: 채굴형 또는 보조형
  basePower: number; // 1회 채굴당 타일 대미지
  cooldownMs: number; // 채굴 주기 (밀리초)
  miningRadius: number; // 탐색 및 채굴 가능 반경 (타일 단위)
  specialEffect?: 'magnet' | 'light' | 'combat' | 'auto_smelt'; // 특화 효과
  smeltSpeedMult?: number; // 제련 속도 배율 (예: 0.8일 경우 20% 단축)
  smeltSlotBonus?: number; // 추가 제련 슬롯 수
  price?: { [key: string]: number };
}

/**
 * 자원 가공소(용광로)에서 진행 중인 가공 작업 정보입니다.
 */
export interface SmeltingJob {
  id: string; // 작업 고유 ID
  inputMineral: string; // 소모한 원석
  outputItem: string; // 얻게 될 주괴/보석
  amount: number; // 수량
  startTime: number; // 시작 시간 (Date.now())
  durationMs: number; // 소요 시간 (밀리초)
}

/**
 * 스킬룬의 기본 데이터 구조입니다.
 */
export interface SkillRune {
  /** 베이스 스킬룬 ID (예: 'attack_rune') */
  id: string;
  /** 스킬룬 이름 */
  name: string;
  /** 효과 설명 */
  description: string;
  /** 효과 타입 */
  effectType: 'passive' | 'active';
  /** 희귀 등급 */
  rarity: Rarity | 'Unique';
  /** 직접 정의된 공격력 보너스 (희귀도 기반 기본값보다 우선함) */
  powerBonus?: number;
  /** 직접 정의된 채굴 속도 배율 가산치 (0.01 = 1%) */
  speedMult?: number;
  /** 특수 효과 발동 확률 (0~1) */
  effectChance?: number;
  /** 특수 효과 수치 */
  effectValue?: number;
}

/**
 * 인벤토리에 보관되는 실제 스킬룬 인스턴스 정보입니다.
 */
export interface SkillRuneItem {
  /** 획득 시 부여된 고유 인스턴스 ID (예: "rune_12345") */
  id: string;
  /** 베이스 스킬룬 ID 지칭 */
  runeId: string;
  /** 개별 스킬룬의 희귀 등급 */
  rarity: Rarity | 'Unique';
}

/**
 * 플레이어의 전체적인 통계 및 진행 상태를 저장합니다.
 */
export interface PlayerStats {
  /** 현재 도달한 깊이 (y 좌표 기반) */
  depth: number;
  
  /** 현재 장착 중인 드릴의 ID */
  equippedDrillId: string;
  /** 보유하고 있는 모든 드릴의 ID 목록 */
  ownedDrillIds: string[];
  
  /** 현재 장착 중인 드론의 ID (장착 해제 시 null) */
  equippedDroneId: string | null;
  /** 보유하고 있는 모든 드론의 ID 목록 */
  ownedDroneIds: string[];

  /** 진행 중인 제련 작업 목록 */
  activeSmeltingJobs: SmeltingJob[];
  /** 해제된 용광로 제련 슬롯 수 */
  refinerySlots: number;

  /** 탐험 정보 */
  /** 지금까지 도달한 최대 깊이 */
  maxDepthReached: number;
  /** 획득한 고대 유물 목록 */
  artifacts: string[];

  /** 전투 및 기본 스탯 */
  /** 현재 체력 */
  hp: number;
  /** 최대 체력 */
  maxHp: number;
  /** 기본 채굴 위력 (장비 위력과 합산됨) */
  attackPower: number;

  /** 자원 및 아이템 */
  /** 광물 인벤토리 */
  inventory: Inventory;
  /** 소지하고 있는 스킬룬 목록 */
  inventoryRunes: SkillRuneItem[];
  /** 보유 중인 골드 코인 수량 */
  goldCoins: number;
  /** 월드 생성을 위한 맵 시드 번호 */
  mapSeed: number;
  
  /** 발견한 광물 종류 목록 (도감용) */
  discoveredMinerals: string[];
  /** 조우한 보스 ID 목록 */
  encounteredBossIds: string[];
  /** 현재 탐험 중인 차원 번호 */
  dimension: number;
  
  /** 각 드릴별 숙련도 및 스킬 장착 상태 관리 */
  equipmentStates: { [drillId: string]: EquipmentState };
  
  /** 해금된 연구(스킬트리) ID 목록 */
  unlockedResearchIds: string[];
}

/**
 * 게임 내 위치를 좌표로 나타냅니다.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 월드 상에 존재하는 NPC 또는 오브젝트 엔티티 정보입니다.
 */
export interface Entity {
  /** 엔티티 고유 ID */
  id: string;
  /** 엔티티 종류 */
  type: 'npc' | 'object';
  /** 표시될 이름 */
  name: string;
  /** 가로 좌표 (타일 단위) */
  x: number;
  /** 세로 좌표 (타일 단위) */
  y: number;
  /** 타일셋 내의 스프라이트 인덱스 (옵션) */
  spriteIndex?: number;
  /** 이미지 파일 경로 (옵션) */
  imagePath?: string;
  /** 엔티티 너비 (타일 단위) */
  width?: number;
  /** 엔티티 높이 (타일 단위) */
  height?: number;
  /** 상호작용 시 발생할 행동 종류 */
  interactionType: 'shop' | 'dialog' | 'crafting' | 'elevator' | 'refinery';
}

/**
 * 상호작용 가능한 타입을 추출한 별칭입니다.
 */
export type InteractionType = Entity['interactionType'];

/**
 * 게임에서 사용되는 모든 그래픽 자원들을 관리하는 인터페이스입니다.
 */
export interface GameAssets {
  /** 플레이어 이미지 */
  player: HTMLImageElement | null;
  /** 타일셋 이미지 */
  tileset: HTMLImageElement | null;
  /** 베이스 캠프 타일셋 이미지 */
  baseTileset: HTMLImageElement | null;
  /** 보스 몬스터 이미지 */
  boss: HTMLImageElement | null;
  /** 추가 엔티티 이미지 맵 */
  entities: { [path: string]: HTMLImageElement };
  /** 아이템 및 자원 이미지 맵 */
  resources: { [type: string]: HTMLImageElement };
}

/**
 * 화면에 표시되는 파티클 효과 하나하나의 정보를 정의합니다.
 */
export interface Particle {
  x: number;
  y: number;
  vx: number; // x축 속도
  vy: number; // y축 속도
  life: number; // 남은 수명 (0~1)
  color: string;
  size: number;
}

/**
 * 화면에 떠다니는 텍스트(대미지 표시 등)의 정보를 정의합니다.
 */
export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  startY?: number; // 생성 당시의 초기 Y 위치
  life: number; // 남은 수명 (0~1)
}

/**
 * 게임 월드에 떨어져 물리 효과를 받는 아이템 객체입니다.
 */
export interface DroppedItem {
  id: string;
  type: TileType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/**
 * 제작 시 필요한 재료 명세입니다.
 */
export interface CraftRequirements {
  [resource: string]: number;
}

/**
 * 제작 결과물 정보입니다.
 */
export interface CraftResult {
  drillId?: string;
  itemId?: string;
}
