/**
 * 게임 내 몬스터 및 보스 데이터 정의입니다.
 * 이 파일은 scripts/genData.js에 의해 자동으로 생성됩니다.
 */
export interface MonsterDefinition {
  /** 몬스터의 고유 식별자 (예: 'c2_asmodeus') */
  id: string;
  /** 영어 이름 */
  name: string;
  /** 한국어 이름 */
  nameKo: string;
  /** 몬스터 유형 (일반 몬스터 또는 보스) */
  type: 'monster' | 'boss';
  /** 아틀라스 키 (atlasMap.ts 참조) */
  imagePath: string;
  /** 몬스터 설명 */
  description: string;
  /** 전투 메커니즘 설명 (선택사항) */
  mechanic?: string;
  /** 희귀도 (선택사항) */
  rarity?: string;
  /** 스탯 정보 */
  stats: {
    /** 최대 체력 */
    maxHp: number;
    /** 공격력 */
    power: number;
    /** 방어력 */
    defense: number;
    /** 이동 속도 */
    speed: number;
    /** 공격 쿨타임 (밀리초) */
    attackCooldown: number;
  };
  /** 보상 정보 */
  rewards: {
    /** 경험치 */
    exp: number;
    /** 골드 */
    gold: number;
    /** 드롭 아이템 목록 */
    drops: Array<{
      /** 아이템 ID */
      itemId: string;
      /** 드롭 확률 (0.0 ~ 1.0) */
      chance: number;
      /** 최소 드롭 수량 */
      minAmount: number;
      /** 최대 드롭 수량 */
      maxAmount: number;
    }>;
  };
  /** 행동 패턴 */
  behavior: {
    /** 이동 패턴: 추적, 배회, 고정, 도망 */
    movementType: 'chase' | 'wander' | 'stationary' | 'flee';
    /** 공격 사거리 (타일 단위) */
    attackRange: number;
    /** 어그로 범위 (타일 단위) - 플레이어가 이 범위 안에 들어오면 적대적 행동 시작 */
    aggroRange: number;
    /** 투사체 ID (선택사항, 투사체를 사용하는 몬스터만) */
    projectileId?: string;
  };
}

export const MONSTER_LIST: MonsterDefinition[] = [
  {
    id: 'c2_whisperer',
    name: 'Lustful Whisperer',
    nameKo: '유혹하는 속삭임',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 300, power: 20, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 50,
      gold: 10,
      drops: [
        { itemId: 'essence_lust', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_whisperer_fragment', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c2_wind_soul',
    name: 'Wind-torn Soul',
    nameKo: '바람에 찢긴 영혼',
    type: 'monster',
    imagePath: 'WindTornSoul',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 400, power: 25, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 60,
      gold: 12,
      drops: [
        { itemId: 'essence_lust', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_spectral_breath', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c2_gale_bat',
    name: 'Gale Bat',
    nameKo: '돌풍 박쥐',
    type: 'monster',
    imagePath: 'GaleBat',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 250, power: 25, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 45,
      gold: 9,
      drops: [
        { itemId: 'essence_lust', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_bat_wing', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c2_asmodeus',
    name: 'Asmodeus',
    nameKo: '아스모데우스',
    type: 'boss',
    imagePath: 'Asmodeus',
    description:
      '3개의 머리 (황소, 인간, 숫양), 불꽃 날개, 뱀 꼬리. 몸 전체에서 붉은 열기가 뿜어져 나옴',
    stats: { maxHp: 2500, power: 35, defense: 10, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 7500,
      gold: 1500,
      drops: [
        { itemId: 'essence_lust', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10, projectileId: 'FireBall' },
  },
  {
    id: 'c3_devourer',
    name: 'Bloated Devourer',
    nameKo: '비대한 포식자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1500, power: 60, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 150,
      gold: 30,
      drops: [
        { itemId: 'essence_gluttony', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_devourer_skin', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_worm',
    name: 'Starving Wraith',
    nameKo: '굶주린 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1200, power: 70, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 120,
      gold: 24,
      drops: [
        { itemId: 'essence_gluttony', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_worm_mucus', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_mud_shade',
    name: 'Greedy slaughter',
    nameKo: '탐식의 도살자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1800, power: 50, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 180,
      gold: 36,
      drops: [
        { itemId: 'essence_gluttony', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_muddy_soul', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c3_Fenrir',
    name: 'Fenrir',
    nameKo: '펜리르',
    type: 'boss',
    imagePath: 'oros_face',
    description:
      '거대한 파리 형태, 썩은 날개, 복부가 비정상적으로 부풀어있음. 주변에 파리 떼가 항상 들끓음',
    stats: { maxHp: 45000, power: 250, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 22500,
      gold: 4500,
      drops: [
        { itemId: 'essence_gluttony', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
  {
    id: 'c4_hoarder',
    name: 'Hoarding Specter',
    nameKo: '수집가 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 4000, power: 120, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 400,
      gold: 80,
      drops: [
        { itemId: 'essence_greed', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_hoarder_coin', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c4_sinner',
    name: 'Gilded Sinner',
    nameKo: '황금 죄인',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 5500, power: 150, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 550,
      gold: 110,
      drops: [
        { itemId: 'essence_greed', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_sinner_gold', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c4_mimic',
    name: 'Fortune Mimic',
    nameKo: '운명의 미믹',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 3500, power: 200, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 350,
      gold: 70,
      drops: [
        { itemId: 'essence_greed', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_mimic_tooth', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c4_mammon',
    name: 'Mammon',
    nameKo: '마몬',
    type: 'boss',
    imagePath: 'oros_face',
    description: '황금 갑옷으로 뒤덮인 거대 인간형, 눈이 황금 동전. 몸에서 금화가 흘러내림',
    stats: { maxHp: 120000, power: 500, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 60000,
      gold: 12000,
      drops: [
        { itemId: 'essence_greed', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
  {
    id: 'c5_dweller',
    name: 'Styx Dweller',
    nameKo: '스틱스의 거주자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 12000, power: 300, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 1200,
      gold: 240,
      drops: [
        { itemId: 'essence_wrath', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_dweller_eye', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c5_fury',
    name: 'Raging Fury',
    nameKo: '격노한 복수심',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 10000, power: 450, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 1000,
      gold: 200,
      drops: [
        { itemId: 'essence_wrath', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_fury_flame', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c5_golem',
    name: 'Mud Golem',
    nameKo: '진흙 골렘',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 25000, power: 250, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 2500,
      gold: 500,
      drops: [
        { itemId: 'essence_wrath', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_golem_core', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c5_azazel',
    name: 'Azazel',
    nameKo: '아자젤',
    type: 'boss',
    imagePath: 'Player',
    description: '타락한 천사, 검게 그을린 날개, 온몸에 쇠사슬이 감겨있음. 눈에서 붉은 불꽃',
    stats: { maxHp: 350000, power: 1200, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 175000,
      gold: 35000,
      drops: [
        { itemId: 'essence_wrath', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
  {
    id: 'c6_priest',
    name: 'Heretic Priest',
    nameKo: '이단 사제',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 35000, power: 800, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 3500,
      gold: 700,
      drops: [
        { itemId: 'essence_heresy', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_priest_seal', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c6_flame',
    name: 'Eternal Flame Soul',
    nameKo: '영겁의 불꽃 영혼',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 30000, power: 1200, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 3000,
      gold: 600,
      drops: [
        { itemId: 'essence_heresy', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_flame_soul', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c6_angel',
    name: 'Fallen Angel',
    nameKo: '타락한 천사',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 50000, power: 900, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 5000,
      gold: 1000,
      drops: [
        { itemId: 'essence_heresy', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_fallen_feather', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c6_samael',
    name: 'Samael',
    nameKo: '사마엘',
    type: 'boss',
    imagePath: 'oros_face',
    description:
      '검게 물든 천사 날개, 온몸에 독이 흘러내림. 피부는 창백하고 균열이 가득하며 틈에서 보라빛 독액이 흘러나옴. 부러진 후광, 독이 묻은 검',
    stats: { maxHp: 900000, power: 3500, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 450000,
      gold: 90000,
      drops: [
        { itemId: 'essence_heresy', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
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
        { itemId: 'essence_violence', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_centaur_hoof', chance: 0.25, minAmount: 1, maxAmount: 1 },
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
        { itemId: 'essence_violence', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_guard_blood', chance: 0.25, minAmount: 1, maxAmount: 1 },
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
        { itemId: 'essence_violence', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_spawn_horn', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c7_belial',
    name: 'Belial',
    nameKo: '벨리알',
    type: 'boss',
    imagePath: 'oros_face',
    description: '불꽃 전차를 탄 타락천사, 두 개의 검은 날개, 온몸이 불꽃으로 이루어진 형태',
    stats: { maxHp: 3000000, power: 15000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 1500000,
      gold: 300000,
      drops: [
        { itemId: 'essence_violence', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
  {
    id: 'c8_malebranche',
    name: 'Malebranche',
    nameKo: '말레브랑케',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 600000, power: 10000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 60000,
      gold: 12000,
      drops: [
        { itemId: 'essence_fraud', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_malebranche_claw', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c8_prophet',
    name: 'False Prophet',
    nameKo: '거짓 예언자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 500000, power: 15000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 50000,
      gold: 10000,
      drops: [
        { itemId: 'essence_fraud', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_prophet_tongue', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c8_illusionist',
    name: 'Illusionist Shade',
    nameKo: '환술사의 그림자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 450000, power: 12000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 45000,
      gold: 9000,
      drops: [
        { itemId: 'essence_fraud', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_illusion_shard', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c8_abaddon',
    name: 'Abaddon',
    nameKo: '아바돈',
    type: 'boss',
    imagePath: 'oros_face',
    description: '거대한 메뚜기 형태, 전갈 꼬리, 철 갑옷을 두른 날개. 주변에 메뚜기 군단이 들끓음',
    stats: { maxHp: 12000000, power: 45000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 6000000,
      gold: 1200000,
      drops: [
        { itemId: 'essence_fraud', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
  {
    id: 'c9_sinner',
    name: 'Ice-bound Sinner',
    nameKo: '빙결된 죄인',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Treachery 서클의 하급 영혼입니다.',
    stats: { maxHp: 2500000, power: 40000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 250000,
      gold: 50000,
      drops: [
        { itemId: 'essence_treachery', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_sinner_ice', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c9_specter',
    name: 'Cocytus Specter',
    nameKo: '코키토스 망령',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Treachery 서클의 하급 영혼입니다.',
    stats: { maxHp: 2000000, power: 55000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 200000,
      gold: 40000,
      drops: [
        { itemId: 'essence_treachery', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_specter_tear', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c9_shadow',
    name: 'Treacherous Shadow',
    nameKo: '배신의 그림자',
    type: 'monster',
    imagePath: 'LustfulWhisperer',
    description: 'Treachery 서클의 하급 영혼입니다.',
    stats: { maxHp: 3000000, power: 35000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: {
      exp: 300000,
      gold: 60000,
      drops: [
        { itemId: 'essence_treachery', chance: 0.02, minAmount: 1, maxAmount: 1 },
        { itemId: 'loot_shadow_essence', chance: 0.25, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 },
  },
  {
    id: 'c9_lucifer',
    name: 'Lucifer',
    nameKo: '루시퍼',
    type: 'boss',
    imagePath: 'oros_face',
    description:
      '3개의 얼굴, 거대한 얼음에 하반신이 갇혀있음. 6개의 날개는 부러지고 검게 타있음. 눈물이 얼어붙어 있음',
    stats: { maxHp: 100000000, power: 250000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: {
      exp: 50000000,
      gold: 10000000,
      drops: [
        { itemId: 'essence_treachery', chance: 1.0, minAmount: 5, maxAmount: 10 },
        { itemId: 'boss_core', chance: 1.0, minAmount: 1, maxAmount: 1 },
      ],
    },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 },
  },
];

export const MONSTERS: Record<string, MonsterDefinition> = {};
export const MONSTER_DEFINITIONS: MonsterDefinition[] = [];
MONSTER_LIST.forEach((m) => {
  MONSTERS[m.id] = m;
  MONSTER_DEFINITIONS.push(m);
});
