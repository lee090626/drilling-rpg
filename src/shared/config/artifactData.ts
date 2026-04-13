export type ArtifactType = 'stackable' | 'unique';

export interface ArtifactDefinition {
  id: string;
  name: string;
  nameKo: string;
  type: ArtifactType;
  description: string;
  descriptionKo: string;
  icon?: string; // 아이콘 에셋은 유저가 직접 준비 예정

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
    bonus: { stat: 'power', value: 0.05 },
  },
  essence_gluttony: {
    id: 'essence_gluttony',
    name: 'Essence of Gluttony',
    nameKo: '폭식의 유물',
    type: 'stackable',
    description: 'Increases Max HP.',
    descriptionKo: '최대 체력이 증가합니다.',
    bonus: { stat: 'maxHp', value: 0.5 },
  },
  essence_greed: {
    id: 'essence_greed',
    name: 'Essence of Greed',
    nameKo: '탐욕의 유물',
    type: 'stackable',
    description: 'Increases Luck slightly.',
    descriptionKo: '행운이 극히 미세하게 증가합니다.',
    bonus: { stat: 'luck', value: 0.01 },
  },
  essence_wrath: {
    id: 'essence_wrath',
    name: 'Essence of Wrath',
    nameKo: '분노의 유물',
    type: 'stackable',
    description: 'Increases Critical Damage.',
    descriptionKo: '치명타 피해량이 증가합니다.',
    bonus: { stat: 'critDamage', value: 0.001 },
  },
  essence_heresy: {
    id: 'essence_heresy',
    name: 'Essence of Heresy',
    nameKo: '이단의 유물',
    type: 'stackable',
    description: 'Increases Mining Speed.',
    descriptionKo: '채굴 속도가 미세하게 증가합니다.',
    bonus: { stat: 'miningSpeed', value: 0.0005 },
  },
  essence_violence: {
    id: 'essence_violence',
    name: 'Essence of Violence',
    nameKo: '폭력의 유물',
    type: 'stackable',
    description: 'Increases Critical Rate.',
    descriptionKo: '치명타 확률이 미세하게 증가합니다.',
    bonus: { stat: 'critRate', value: 0.0002 },
  },
  essence_fraud: {
    id: 'essence_fraud',
    name: 'Essence of Fraud',
    nameKo: '기만의 유물',
    type: 'stackable',
    description: 'Increases Movement Speed.',
    descriptionKo: '이동 속도가 증가합니다.',
    bonus: { stat: 'moveSpeed', value: 0.05 },
  },
  essence_treachery: {
    id: 'essence_treachery',
    name: 'Essence of Treachery',
    nameKo: '배신의 유물',
    type: 'stackable',
    description: 'Increases Defense.',
    descriptionKo: '방어력이 증가합니다.',
    bonus: { stat: 'defense', value: 0.1 },
  },

  // === 2. 고유 유물 (Unique / 구 성물) ===
  relic_asmodeus_ring: {
    id: 'relic_asmodeus_ring',
    name: "Asmodeus's Ring",
    nameKo: '아스모데우스의 반지',
    type: 'unique',
    description: 'Increases EXP gain by 30%.',
    descriptionKo: '모든 몬스터 처치 시 획득 경험치(EXP)가 30% 증가합니다.',
    effectId: 'EXP_BOOST',
    effectDescriptionKo: '획득 경험치 +30%',
    requirements: {
      boss_core: 1,
      loot_whisperer_fragment: 30,
      loot_spectral_breath: 20,
      goldCoins: 200000,
    },
  },
  relic_beelzebub_needle: {
    id: 'relic_beelzebub_needle',
    name: "Beelzebub's Needle",
    nameKo: '벨제붑의 독니',
    type: 'unique',
    description: 'Heals 5% Max HP on kill.',
    descriptionKo: '몬스터 처치 시 최대 체력의 5%를 즉시 회복합니다.',
    effectId: 'LIFE_STEAL_PERCENT',
    effectDescriptionKo: '처치 시 HP 5% 회복',
    requirements: {
      boss_core: 1,
      loot_devourer_skin: 25,
      loot_worm_mucus: 20,
      goldCoins: 400000,
    },
  },
  relic_mammon_coin: {
    id: 'relic_mammon_coin',
    name: "Mammon's Golden Coin",
    nameKo: '마몬의 황금 주화',
    type: 'unique',
    description: 'All minerals sell for 100% more gold.',
    descriptionKo: '모든 광물의 판매 가격이 100%(2배) 증가합니다.',
    effectId: 'GOLD_SELL_BOOST',
    effectDescriptionKo: '광물 판매가 +100%',
    requirements: {
      boss_core: 1,
      loot_hoarder_coin: 30,
      loot_sinner_gold: 20,
      goldCoins: 800000,
    },
  },
  relic_satan_heart: {
    id: 'relic_satan_heart',
    name: "Satan's Burning Heart",
    nameKo: '사탄의 타오르는 심장',
    type: 'unique',
    description: 'Increases mining speed by 25%.',
    descriptionKo: '기본 채굴 속도(Mining Speed)가 25% 증가합니다.',
    effectId: 'MINING_SPEED_BOOST',
    effectDescriptionKo: '채굴 속도 +25%',
    requirements: {
      boss_core: 2,
      loot_dweller_eye: 30,
      loot_fury_flame: 20,
      goldCoins: 1600000,
    },
  },
  relic_belphegor_eye: {
    id: 'relic_belphegor_eye',
    name: "Belphegor's Shadow Eye",
    nameKo: '벨페고르의 눈',
    type: 'unique',
    description: 'Mastery gain speed increased by 300%.',
    descriptionKo: '모든 숙련도(Mastery) 획득 속도가 300%(4배) 증가합니다.',
    effectId: 'MASTERY_BOOST',
    effectDescriptionKo: '숙련도 획득 속도 +300%',
    requirements: {
      boss_core: 2,
      loot_priest_seal: 30,
      loot_flame_soul: 20,
      goldCoins: 2000000,
    },
  },
  relic_abaddon_blade: {
    id: 'relic_abaddon_blade',
    name: "Abaddon's Broken Blade",
    nameKo: '아바돈의 부러진 칼날',
    type: 'unique',
    description: 'Loot amount increased by 25%.',
    descriptionKo: '몬스터 처치 시 전리품 획득량이 25% 증가합니다.',
    effectId: 'LOOT_QUANTITY_BOOST',
    effectDescriptionKo: '전리품 획득량 +25%',
    requirements: {
      boss_core: 3,
      loot_malebranche_claw: 30,
      loot_prophet_tongue: 20,
      goldCoins: 3000000,
    },
  },
  relic_leviathan_mirror: {
    id: 'relic_leviathan_mirror',
    name: "Leviathan's Deceptive Mirror",
    nameKo: '레비아탄의 뒤틀린 투영',
    type: 'unique',
    description: 'Damage & Mining speed +1% per 1% Missing HP.',
    descriptionKo: '잃은 체력 1%당 최종 대미지 및 채굴 속도가 1%씩 증가합니다.',
    effectId: 'TWISTED_PROJECTION',
    effectDescriptionKo: '광전사: 대미지/속도 증폭',
    requirements: {
      boss_core: 2,
      loot_centaur_hoof: 30,
      loot_guard_blood: 20,
      goldCoins: 2500000,
    },
  },
  relic_lucifer_ice: {
    id: 'relic_lucifer_ice',
    name: "Lucifer's Eternal Ice",
    nameKo: '루시퍼의 영겁 서리',
    type: 'unique',
    description: 'All stats increase by 1% for every 100m reached.',
    descriptionKo: '깊이 100m를 내려갈 때마다 모든 스탯이 1%씩 복리 증가합니다.',
    effectId: 'INFINITE_SCALING',
    effectDescriptionKo: '무한 성장 (100m당 1% 스탯)',
    requirements: {
      boss_core: 3,
      loot_sinner_ice: 30,
      loot_shadow_essence: 20,
      goldCoins: 5000000,
    },
  },
};

/**
 * 도감이나 UI 렌더링에 사용할 유물 리스트 배열
 */
export const ARTIFACT_LIST = Object.values(ARTIFACT_DATA);
