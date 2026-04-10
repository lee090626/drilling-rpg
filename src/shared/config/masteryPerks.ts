/**
 * 마스터리 돌파 특성 보너스 효과의 세부 명세입니다.
 */
export interface MasteryPerkEffect {
  /** 효과 종류 (이동 속도, 채굴력, 채굴 속도, 체력, 행운, 골드 등) */
  type: 'moveSpeed' | 'miningPower' | 'miningSpeed' | 'hpRegen' | 'maxHp' | 'luck' | 'goldBonus' | 'masteryExp';
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
  // --- 흙 (Dirt) 특성 (테마: 이동성) ---
  {
    id: 'perk_dirt_50',
    tileType: 'dirt',
    requiredLevel: 50,
    name: '손쉬운 개간',
    description: '플레이어의 이동 속도가 영구적으로 5 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 5, isMultiplier: false }]
  },
  {
    id: 'perk_dirt_100',
    tileType: 'dirt',
    requiredLevel: 100,
    name: '대지의 기운',
    description: '플레이어의 최대 체력이 영구적으로 10 증가합니다.',
    effects: [{ type: 'maxHp', value: 10, isMultiplier: false }]
  },
  {
    id: 'perk_dirt_150',
    tileType: 'dirt',
    requiredLevel: 150,
    name: '쾌속의 발굴',
    description: '플레이어의 이동 속도가 10% 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 0.1, isMultiplier: true }]
  },
  {
    id: 'perk_dirt_200',
    tileType: 'dirt',
    requiredLevel: 200,
    name: '대지의 화신',
    description: '플레이어의 이동 속도가 15% 증가합니다.',
    effects: [{ type: 'moveSpeed', value: 0.15, isMultiplier: true }]
  },

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

  // --- 석탄 (Coal) 특성 (테마: 엔진 효율) ---
  {
    id: 'perk_coal_50',
    tileType: 'coal',
    requiredLevel: 50,
    name: '화력 조절',
    description: '채굴 속도가 5% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.05, isMultiplier: true }]
  },
  {
    id: 'perk_coal_100',
    tileType: 'coal',
    requiredLevel: 100,
    name: '과열 가동',
    description: '채굴 속도가 10% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.1, isMultiplier: true }]
  },
  {
    id: 'perk_coal_150',
    tileType: 'coal',
    requiredLevel: 150,
    name: '고급 원료',
    description: '채굴 속도가 15% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.15, isMultiplier: true }]
  },
  {
    id: 'perk_coal_200',
    tileType: 'coal',
    requiredLevel: 200,
    name: '증기 혁명',
    description: '채굴 속도가 20% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.2, isMultiplier: true }]
  },

  // --- 철 (Iron) 특성 (테마: 순수한 위력) ---
  {
    id: 'perk_iron_50',
    tileType: 'iron',
    requiredLevel: 50,
    name: '강철의 맥박',
    description: '기본 채굴 위력이 10 증가합니다.',
    effects: [{ type: 'miningPower', value: 10, isMultiplier: false }]
  },
  {
    id: 'perk_iron_100',
    tileType: 'iron',
    requiredLevel: 100,
    name: '무거운 타격',
    description: '기본 채굴 위력이 10% 증가합니다.',
    effects: [{ type: 'miningPower', value: 0.1, isMultiplier: true }]
  },
  {
    id: 'perk_iron_150',
    tileType: 'iron',
    requiredLevel: 150,
    name: '제련된 힘',
    description: '기본 채굴 위력이 30 증가합니다.',
    effects: [{ type: 'miningPower', value: 30, isMultiplier: false }]
  },
  {
    id: 'perk_iron_200',
    tileType: 'iron',
    requiredLevel: 200,
    name: '강철의 지배자',
    description: '기본 채굴 위력이 20% 증가합니다.',
    effects: [{ type: 'miningPower', value: 0.2, isMultiplier: true }]
  },

  // --- 금 (Gold) 특성 (테마: 재화와 이득) ---
  {
    id: 'perk_gold_50',
    tileType: 'gold',
    requiredLevel: 50,
    name: '황금빛 행운',
    description: '행운 수치가 10 증가합니다.',
    effects: [{ type: 'luck', value: 10, isMultiplier: false }]
  },
  {
    id: 'perk_gold_100',
    tileType: 'gold',
    requiredLevel: 100,
    name: '상인의 안목',
    description: '광물 판매 가격이 10% 증가합니다.',
    effects: [{ type: 'goldBonus', value: 0.1, isMultiplier: true }]
  },
  {
    id: 'perk_gold_150',
    tileType: 'gold',
    requiredLevel: 150,
    name: '부의 축적',
    description: '행운 수치가 30 증가합니다.',
    effects: [{ type: 'luck', value: 30, isMultiplier: false }]
  },
  {
    id: 'perk_gold_200',
    tileType: 'gold',
    requiredLevel: 200,
    name: '미다스의 손',
    description: '광물 판매 가격이 20% 증가합니다.',
    effects: [{ type: 'goldBonus', value: 0.2, isMultiplier: true }]
  },

  // --- 다이아몬드 (Diamond) 특성 (테마: 극한의 행운 및 정밀도) ---
  {
    id: 'perk_diamond_50',
    tileType: 'diamond',
    requiredLevel: 50,
    name: '눈부신 예리함',
    description: '행운 수치가 20% 증가합니다.',
    effects: [{ type: 'luck', value: 0.2, isMultiplier: true }]
  },
  {
    id: 'perk_diamond_100',
    tileType: 'diamond',
    requiredLevel: 100,
    name: '다이아몬드 심장',
    description: '최대 체력이 50 증가합니다.',
    effects: [{ type: 'maxHp', value: 50, isMultiplier: false }]
  },
  {
    id: 'perk_diamond_150',
    tileType: 'diamond',
    requiredLevel: 150,
    name: '영롱한 광채',
    description: '행운 수치가 40% 증가합니다.',
    effects: [{ type: 'luck', value: 0.4, isMultiplier: true }]
  },
  {
    id: 'perk_diamond_200',
    tileType: 'diamond',
    requiredLevel: 200,
    name: '보석의 왕',
    description: '행운 수치가 50% 증가합니다.',
    effects: [{ type: 'luck', value: 0.5, isMultiplier: true }]
  },

  // --- 에메랄드 (Emerald) 특성 (테마: 지식 및 경험) ---
  {
    id: 'perk_emerald_50',
    tileType: 'emerald',
    requiredLevel: 50,
    name: '지식의 탐구',
    description: '마스터리 경험치 획득량이 10% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.1, isMultiplier: true }]
  },
  {
    id: 'perk_emerald_100',
    tileType: 'emerald',
    requiredLevel: 100,
    name: '효율적인 연구',
    description: '마스터리 경험치 획득량이 15% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.15, isMultiplier: true }]
  },
  {
    id: 'perk_emerald_150',
    tileType: 'emerald',
    requiredLevel: 150,
    name: '현자의 지혜',
    description: '마스터리 경험치 획득량이 20% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.2, isMultiplier: true }]
  },
  {
    id: 'perk_emerald_200',
    tileType: 'emerald',
    requiredLevel: 200,
    name: '마스터 오브 지식',
    description: '마스터리 경험치 획득량이 30% 증가합니다.',
    effects: [{ type: 'masteryExp', value: 0.3, isMultiplier: true }]
  },

  // --- 루비, 사파이어, 우라늄, 옵시디언 (종합 특성) ---
  {
    id: 'perk_ruby_100',
    tileType: 'ruby',
    requiredLevel: 100,
    name: '타오르는 의지',
    description: '최대 체력이 100 증가합니다.',
    effects: [{ type: 'maxHp', value: 100, isMultiplier: false }]
  },
  {
    id: 'perk_sapphire_100',
    tileType: 'sapphire',
    requiredLevel: 100,
    name: '냉정한 집중',
    description: '채굴 속도가 25% 증가합니다.',
    effects: [{ type: 'miningSpeed', value: 0.25, isMultiplier: true }]
  },
  {
    id: 'perk_uranium_100',
    tileType: 'uranium',
    requiredLevel: 100,
    name: '불안정한 힘',
    description: '기본 채굴 위력이 100 증가합니다.',
    effects: [{ type: 'miningPower', value: 100, isMultiplier: false }]
  },
  {
    id: 'perk_obsidian_100',
    tileType: 'obsidian',
    requiredLevel: 100,
    name: '금강불괴',
    description: '최대 체력이 100% 증가합니다.',
    effects: [{ type: 'maxHp', value: 1.0, isMultiplier: true }]
  }
];
