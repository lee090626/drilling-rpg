/**
 * 마스터리 돌파 특성 보너스 효과의 세부 명세입니다.
 */
export interface MasteryPerkEffect {
  /** 효과 종류 (이동 속도, 채굴력, 채굴 속도, 체력, 행운 등) */
  type: 'moveSpeed' | 'miningPower' | 'miningSpeed' | 'hpRegen' | 'maxHp' | 'luck' | 'masteryExp' | 'critRate' | 'critDmg';
  /** 보너스 수치 */
  value: number;
  /** 배율(Multiplier) 적용 여부 (true면 기존 스탯에 곱해지고, false면 더해짐) */
  isMultiplier: boolean;
  /** 발동 확률 (0~1, 확률형 효과인 경우) */
  chance?: number;
}

/**
 * 마스터리 돌파 특성 정보를 정의하는 데이터 설정 파일입니다.
 */
export interface MasteryPerkDef {
  /** 특성 고유 식별자 */
  id: string;
  /** 관련 타일 종류 */
  tileType: string;
  /** 해금에 필요한 마스터리 레벨 */
  requiredLevel: number;
  /** 플레이어에게 표시될 특성 이름 */
  name: string;
  /** 특성 상세 설명 */
  description: string;
  /** 실제 적용될 효과 목록 */
  effects: MasteryPerkEffect[];
}

/**
 * 게임 내 모든 마스터리 돌파 특성 목록
 */
export const MASTERY_PERKS: MasteryPerkDef[] = [
  // --- 돌 (Stone) 특성 (테마: 내구 및 위력) ---
  {
    id: 'perk_stone_50',
    tileType: 'stone',
    requiredLevel: 50,
    name: '단단한 근력',
    description: '기본 채굴 위력이 5 증가합니다.',
    effects: [{ type: 'miningPower', value: 5, isMultiplier: false }]
  },
  {
    id: 'perk_stone_100',
    tileType: 'stone',
    requiredLevel: 100,
    name: '태산의 가호',
    description: '최대 체력이 20% 증가합니다.',
    effects: [{ type: 'maxHp', value: 0.2, isMultiplier: true }]
  },
  {
    id: 'perk_stone_150',
    tileType: 'stone',
    requiredLevel: 150,
    name: '견고한 장비',
    description: '기본 채굴 위력이 15 증가합니다.',
    effects: [{ type: 'miningPower', value: 15, isMultiplier: false }]
  },
  {
    id: 'perk_stone_200',
    tileType: 'stone',
    requiredLevel: 200,
    name: '불멸의 의지',
    description: '최대 체력이 30% 증가합니다.',
    effects: [{ type: 'maxHp', value: 0.3, isMultiplier: true }]
  },

  // --- Circle 2: Lust (테마: 이동성 및 기초 체력) ---
  {
    id: 'perk_crimsonstone_50',
    tileType: 'crimsonstone',
    requiredLevel: 50,
    name: '가벼운 발걸음',
    description: '이동 속도가 10 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 10, isMultiplier: false }]
  },
  {
    id: 'perk_galestone_100',
    tileType: 'galestone',
    requiredLevel: 100,
    name: '바람의 인도',
    description: '이동 속도가 15% 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 0.15, isMultiplier: true }]
  },
  {
    id: 'perk_fervorstone_150',
    tileType: 'fervorstone',
    requiredLevel: 150,
    name: '끓어오르는 열정',
    description: '공격 속도가 10% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.1, isMultiplier: true }]
  },

  // --- Circle 3: Gluttony (테마: 체력 및 방어) ---
  {
    id: 'perk_moldstone_50',
    tileType: 'moldstone',
    requiredLevel: 50,
    name: '질긴 생명력',
    description: '최대 체력이 50 증가합니다.',
    effects: [{ type: 'maxHp', value: 50, isMultiplier: false }]
  },
  {
    id: 'perk_siltstone_100',
    tileType: 'siltstone',
    requiredLevel: 100,
    name: '침전된 단단함',
    description: '최대 체력이 30% 증가합니다.',
    effects: [{ type: 'maxHp', value: 0.3, isMultiplier: true }]
  },
  {
    id: 'perk_gorestone_150',
    tileType: 'gorestone',
    requiredLevel: 150,
    name: '피의 의지',
    description: '체력 재생 효율이 상승합니다.',
    effects: [{ type: 'hpRegen', value: 5, isMultiplier: false }]
  },

  // --- Circle 4: Greed (테마: 행운 및 재화) ---
  {
    id: 'perk_goldstone_50',
    tileType: 'goldstone',
    requiredLevel: 50,
    name: '황금빛 예리함',
    description: '행운이 50 증가합니다.',
    effects: [{ type: 'luck', value: 50, isMultiplier: false }]
  },
  {
    id: 'perk_luststone_100',
    tileType: 'luststone',
    requiredLevel: 100,
    name: '탐욕의 안목',
    description: '행운이 100% 증가합니다.',
    effects: [{ type: 'luck', value: 1.0, isMultiplier: true }]
  },
  {
    id: 'perk_midasite_200',
    tileType: 'midasite',
    requiredLevel: 200,
    name: '미다스의 축복',
    description: '행운이 200 증가합니다.',
    effects: [{ type: 'luck', value: 200, isMultiplier: false }]
  },

  // --- Circle 5: Wrath (테마: 치명타 및 위력) ---
  {
    id: 'perk_ragestone_50',
    tileType: 'ragestone',
    requiredLevel: 50,
    name: '폭발하는 분노',
    description: '치명타 확률이 5% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.05, isMultiplier: false }]
  },
  {
    id: 'perk_cinderstone_100',
    tileType: 'cinderstone',
    requiredLevel: 100,
    name: '잿빛 정밀함',
    description: '치명타 피해량이 25% 증가합니다.',
    effects: [{ type: 'critDmg', value: 0.25, isMultiplier: false }]
  },
  {
    id: 'perk_furystone_150',
    tileType: 'furystone',
    requiredLevel: 150,
    name: '광폭화',
    description: '치명타 확률이 10% 증가합니다.',
    effects: [{ type: 'critRate', value: 0.1, isMultiplier: false }]
  },

  // --- Circle 6: Heresy (테마: 지식 및 경험) ---
  {
    id: 'perk_ashstone_50',
    tileType: 'ashstone',
    requiredLevel: 50,
    name: '이단의 지혜',
    description: '숙련도 경험치 획득량이 20% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.2, isMultiplier: true }]
  },
  {
    id: 'perk_blightstone_100',
    tileType: 'blightstone',
    requiredLevel: 100,
    name: '금기된 연구',
    description: '숙련도 경험치 획득량이 30% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.3, isMultiplier: true }]
  },
  {
    id: 'perk_vexite_200',
    tileType: 'vexite',
    requiredLevel: 200,
    name: '깨달음의 고뇌',
    description: '숙련도 경험치 획득량이 50% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.5, isMultiplier: true }]
  },

  // --- Circle 7: Violence (테마: 절대적 파괴력) ---
  {
    id: 'perk_thornstone_50',
    tileType: 'thornstone',
    requiredLevel: 50,
    name: '가시 돋친 타격',
    description: '채굴 공격력이 100 증가합니다.',
    effects: [{ type: 'miningPower', value: 100, isMultiplier: false }]
  },
  {
    id: 'perk_bloodstone_100',
    tileType: 'bloodstone',
    requiredLevel: 100,
    name: '선혈의 위력',
    description: '채굴 공격력이 50% 증가합니다.',
    effects: [{ type: 'miningPower', value: 0.5, isMultiplier: true }]
  },
  {
    id: 'perk_cruelite_150',
    tileType: 'cruelite',
    requiredLevel: 150,
    name: '무자비한 파괴',
    description: '채굴 공격력이 200 증가합니다.',
    effects: [{ type: 'miningPower', value: 200, isMultiplier: false }]
  },

  // --- Circle 8: Fraud (테마: 기만적 성능 향상) ---
  {
    id: 'perk_mimicite_50',
    tileType: 'mimicite',
    requiredLevel: 50,
    name: '의태의 전술',
    description: '이동 속도가 20% 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 0.2, isMultiplier: true }]
  },
  {
    id: 'perk_lurerstone_100',
    tileType: 'lurerstone',
    requiredLevel: 100,
    name: '환각의 행운',
    description: '행운이 200 증가합니다.',
    effects: [{ type: 'luck', value: 200, isMultiplier: false }]
  },
  {
    id: 'perk_phantomite_200',
    tileType: 'phantomite',
    requiredLevel: 200,
    name: '망령의 신속함',
    description: '채굴 속도가 30% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.3, isMultiplier: true }]
  },

  // --- Circle 9: Treachery (테마: 최강의 장비 강화) ---
  {
    id: 'perk_froststone_50',
    tileType: 'froststone',
    requiredLevel: 50,
    name: '동토의 단단함',
    description: '최대 체력이 100% 증가합니다.',
    effects: [{ type: 'maxHp', value: 1.0, isMultiplier: true }]
  },
  {
    id: 'perk_glacialite_100',
    tileType: 'glacialite',
    requiredLevel: 100,
    name: '영겁의 빙하',
    description: '채굴 공격력이 100% 증가합니다.',
    effects: [{ type: 'miningPower', value: 1.0, isMultiplier: true }]
  },
  {
    id: 'perk_abyssstone_200',
    tileType: 'abyssstone',
    requiredLevel: 200,
    name: '심연의 지배자',
    description: '모든 채굴 성능이 대폭 상승합니다.',
    effects: [
      { type: 'miningPower', value: 500, isMultiplier: false },
      { type: 'miningSpeed', value: 0.5, isMultiplier: true }
    ]
  }
];
