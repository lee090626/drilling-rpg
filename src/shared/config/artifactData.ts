export type ArtifactType = 'stackable' | 'unique';

export interface ArtifactDefinition {
  id: string;
  name: string;
  nameKo: string;
  type: ArtifactType;
  description: string;
  descriptionKo: string;
  icon?: string; // 레거시: 이모지 아이콘
  image?: string; // 아틀라스 이미지 키 (PascalCaseEssence / PascalCaseRelic)

  // 공통: 기본 스탯 보너스 (stackable의 경우 개당 수치, unique의 경우 고정 수치)
  bonus?: {
    stat:
      | 'power'
      | 'maxHp'
      | 'moveSpeed'
      | 'luck'
      | 'critRate'
      | 'critDamage'
      | 'defense'
      | 'miningSpeed';
    value: number; // stackable의 경우 valuePerEssence 역할을 함
  };

  // unique 전용: 특수 성장/편의성 효과
  effectId?: string;
  /** 스택 효과 설명 (영문) */
  effectDescription?: string;
  /** 스택 효과 설명 (한국어) */
  effectDescriptionKo?: string;

  // unique 전용: 조합 레시피 (몬스터 전리품 위주)
  requirements?: {
    [key: string]: number;
  };
}

/**
 * 모든 유물 데이터 통합 정의 (구 정수 + 구 성물)
 */
export const ARTIFACT_DATA: Record<string, ArtifactDefinition> = {
  // === 1. 일반 유물 (Stackable / 구 정수) ===
  essence_lust: {
    id: 'essence_lust',
    name: 'Essence of Lust',
    nameKo: '정욕의 유물',
    type: 'stackable',
    description: 'Increases Power slightly.',
    descriptionKo: '채굴 위력이 미세하게 증가합니다.',
    image: 'LustEssence',
    bonus: { stat: 'power', value: 0.5 },
  },
  essence_gluttony: {
    id: 'essence_gluttony',
    name: 'Essence of Gluttony',
    nameKo: '폭식의 유물',
    type: 'stackable',
    description: 'Increases Max HP.',
    descriptionKo: '최대 체력이 증가합니다.',
    image: 'GluttoyEssence',
    bonus: { stat: 'maxHp', value: 5.0 },
  },
  essence_greed: {
    id: 'essence_greed',
    name: 'Essence of Greed',
    nameKo: '탐욕의 유물',
    type: 'stackable',
    description: 'Increases Luck slightly.',
    descriptionKo: '행운이 극히 미세하게 증가합니다.',
    image: 'GreedEssence',
    bonus: { stat: 'luck', value: 0.05 },
  },
  essence_wrath: {
    id: 'essence_wrath',
    name: 'Essence of Wrath',
    nameKo: '분노의 유물',
    type: 'stackable',
    description: 'Increases Critical Damage.',
    descriptionKo: '치명타 피해량이 증가합니다.',
    image: 'WrathEssence',
    bonus: { stat: 'critDamage', value: 0.01 },
  },
  essence_heresy: {
    id: 'essence_heresy',
    name: 'Essence of Heresy',
    nameKo: '이단의 유물',
    type: 'stackable',
    description: 'Increases Mining Speed.',
    descriptionKo: '채굴 속도가 미세하게 증가합니다.',
    image: 'HeresyEssence',
    bonus: { stat: 'miningSpeed', value: 0.005 },
  },
  essence_violence: {
    id: 'essence_violence',
    name: 'Essence of Violence',
    nameKo: '폭력의 유물',
    type: 'stackable',
    description: 'Increases Critical Rate.',
    descriptionKo: '치명타 확률이 미세하게 증가합니다.',
    image: 'ViolenceEssence',
    bonus: { stat: 'critRate', value: 0.001 },
  },
  essence_fraud: {
    id: 'essence_fraud',
    name: 'Essence of Fraud',
    nameKo: '기만의 유물',
    type: 'stackable',
    description: 'Increases Movement Speed.',
    descriptionKo: '이동 속도가 증가합니다.',
    image: 'FraudEssence',
    bonus: { stat: 'moveSpeed', value: 0.2 },
  },
  essence_treachery: {
    id: 'essence_treachery',
    name: 'Essence of Treachery',
    nameKo: '배신의 유물',
    type: 'stackable',
    description: 'Increases Defense.',
    descriptionKo: '방어력이 증가합니다.',
    image: 'TreacheryEssence',
    bonus: { stat: 'defense', value: 0.5 },
  },

  // === 2. 보스 드롭 유물 (Stackable형으로 통합) ===
  relic_asmodeus_ring: {
    id: 'relic_asmodeus_ring',
    name: "Asmodeus's Ring",
    nameKo: '아스모데우스의 반지',
    type: 'stackable',
    image: 'AsmodeusRingRelic',
    description: 'Increases EXP gain slightly per stack.',
    descriptionKo: '보유량에 따라 처치 시 획득 경험치(EXP)가 중첩 증가합니다.',
    bonus: { stat: 'critRate', value: 0.002 },
    effectId: 'EXP_BOOST',
    effectDescription: 'Increases EXP gain',
    effectDescriptionKo: '경험치 획득량 증가',
  },
  relic_beelzebub_needle: {
    id: 'relic_beelzebub_needle',
    name: "Beelzebub's Needle",
    nameKo: '벨제붑의 독니',
    type: 'stackable',
    image: 'BeelzebubNeedleRelic',
    description: 'Heals HP on kill per stack.',
    descriptionKo: '몬스터 처치 시 체력이 회복됩니다. (중첩 가능)',
    bonus: { stat: 'maxHp', value: 10 },
    effectId: 'LIFE_STEAL_PERCENT',
    effectDescription: 'HP Recovery on Kill',
    effectDescriptionKo: '처치 시 HP 회복',
  },
  relic_mammon_coin: {
    id: 'relic_mammon_coin',
    name: "Mammon's Golden Coin",
    nameKo: '마몬의 황금 주화',
    type: 'stackable',
    image: 'MammonCoinRelic',
    description: 'Increases gold from minerals per stack.',
    descriptionKo: '광물 판매 가격이 중첩 증가합니다.',
    bonus: { stat: 'luck', value: 0.2 },
    effectId: 'GOLD_SELL_BOOST',
    effectDescription: 'Increases Mineral Sell Price',
    effectDescriptionKo: '광물 판매가 증가',
  },
  relic_satan_heart: {
    id: 'relic_satan_heart',
    name: "Satan's Burning Heart",
    nameKo: '사탄의 타오르는 심장',
    type: 'stackable',
    image: 'SatanHeartRelic',
    description: 'Increases mining speed per stack.',
    descriptionKo: '기본 채굴 속도가 중첩 증가합니다.',
    bonus: { stat: 'miningSpeed', value: 0.05 },
    effectId: 'MINING_SPEED_BOOST',
    effectDescription: 'Increases Mining Speed',
    effectDescriptionKo: '채굴 속도 증가',
  },
  relic_belphegor_eye: {
    id: 'relic_belphegor_eye',
    name: "Belphegor's Shadow Eye",
    nameKo: '벨페고르의 눈',
    type: 'stackable',
    image: 'BelphegorEyeRelic',
    description: 'Increases mastery gain speed per stack.',
    descriptionKo: '모든 숙련도 획득 속도가 중첩 증가합니다.',
    bonus: { stat: 'power', value: 5 },
    effectId: 'MASTERY_BOOST',
    effectDescription: 'Increases Mastery Gain Speed',
    effectDescriptionKo: '숙련도 획득 속도 증가',
  },
  relic_abaddon_blade: {
    id: 'relic_abaddon_blade',
    name: "Abaddon's Broken Blade",
    nameKo: '아바돈의 부러진 칼날',
    type: 'stackable',
    image: 'AbaddonBladeRelic',
    description: 'Increases loot amount per stack.',
    descriptionKo: '몬스터 처치 시 전리품 획득량이 중첩 증가합니다.',
    bonus: { stat: 'power', value: 10 },
    effectId: 'LOOT_QUANTITY_BOOST',
    effectDescription: 'Increases Loot Quantity',
    effectDescriptionKo: '전리품 획득량 증가',
  },
  relic_leviathan_mirror: {
    id: 'relic_leviathan_mirror',
    name: "Leviathan's Deceptive Mirror",
    nameKo: '레비아탄의 뒤틀린 투영',
    type: 'stackable',
    image: 'LeviathanMirrorRelic',
    description: 'Increases damage/mining speed based on missing HP.',
    descriptionKo: '잃은 체력에 비례하여 위력이 강화됩니다.',
    bonus: { stat: 'defense', value: 5 },
    effectId: 'TWISTED_PROJECTION',
    effectDescription: 'Enhances Berserk Effect',
    effectDescriptionKo: '광전사 효과 강화',
  },
  relic_lucifer_ice: {
    id: 'relic_lucifer_ice',
    name: "Lucifer's Eternal Ice",
    nameKo: '루시퍼의 영겁 서리',
    type: 'stackable',
    image: 'LuciferIceRelic',
    description: 'Increases all stats for every 100m reached.',
    descriptionKo: '깊이 도달에 따른 보너스가 중첩 강화됩니다.',
    bonus: { stat: 'maxHp', value: 50 },
    effectId: 'INFINITE_SCALING',
    effectDescription: 'Enhances Infinite Growth Effect',
    effectDescriptionKo: '무한 성장 효과 강화',
  },
};

/**
 * 도감이나 UI 렌더링에 사용할 유물 리스트 배열
 */
export const ARTIFACT_LIST = Object.values(ARTIFACT_DATA);
