/**
 * 보스가 사용할 수 있는 공격 패턴의 종류를 정의합니다.
 */
export type BossPatternType = 'shot' | 'cross' | 'lure' | 'aoe' | 'swarm' | 'gravity';

/**
 * 보스의 단일 공격 패턴 데이터 정의입니다.
 */
export interface BossPattern {
  /** 패턴 식별 타입 */
  type: BossPatternType;
  /** 이 패턴의 발동 주기 (밀리초) */
  cooldown: number;
  /** 이 패턴이 활성화되는 최소 페이즈 번호 (1-based) */
  minPhase?: number;
  /** 발사되는 투사체의 수 */
  projectileCount?: number;
  /** 투사체 이동 속도 (픽셀/틱) */
  projectileSpeed?: number;
  /** 투사체 공격력 */
  projectilePower?: number;
  /** 투사체 크기 (px) */
  projectileSize?: number;
  /** 페이즈별 스케일 오버라이드 배열 */
  phaseOverrides?: Array<{
    projectileCount?: number;
    projectileSpeed?: number;
    projectilePower?: number;
  }>;
  /** lure 패턴 전용: 혼란 효과 지속 시간 (밀리초) */
  lureDuration?: number;
  /** lure 패턴 전용: 혼란 효과 발동을 위한 주기 시작 시간 (밀리초) */
  lureCycle?: number;
  /** 공격 전조 표시 시작 시간 (밀리초) */
  warningLeadTime?: number;
}

/**
 * 보스의 특정 페이즈 설정 데이터입니다.
 */
export interface BossPhaseConfig {
  /** 이 페이즈의 번호 (1-based) */
  phase: number;
  /** 이 페이즈로 전환되는 HP 임계값 (%) */
  hpThreshold: number;
}

/**
 * 몬스터의 전체 정의 인터페이스입니다.
 */
export interface MonsterDefinition {
  /** 몬스터의 고유 식별자 */
  id: string;
  /** 영어 이름 */
  name: string;
  /** 한국어 이름 */
  nameKo: string;
  /** 몬스터 유형 */
  type: 'monster' | 'boss';
  /** 아틀라스 키 */
  imagePath: string;
  /** 몬스터 설명 */
  description: string;
  /** 전투 메커니즘 설명 */
  mechanic?: string;
  /** 희귀도 */
  rarity?: string;
  /** 스탯 정보 */
  stats: {
    maxHp: number;
    power: number;
    defense: number;
    speed: number;
    attackCooldown: number;
  };
  /** 보상 정보 */
  rewards: {
    exp: number;
    gold: number;
    drops: Array<{
      itemId: string;
      chance: number;
      minAmount: number;
      maxAmount: number;
    }>;
  };
  /** 행동 패턴 */
  behavior: {
    movementType: 'chase' | 'wander' | 'stationary' | 'flee';
    attackRange: number;
    aggroRange: number;
    projectileId?: string;
    /** 재생성 대기 시간 (밀리초, 보스 전용) */
    respawnMs?: number;
  };
  /** 보스 전용 공격 패턴 */
  patterns?: BossPattern[];
  /** 보스 전용 페이즈 전환 설정 */
  phases?: BossPhaseConfig[];
}
