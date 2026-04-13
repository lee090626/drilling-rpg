/**
 * 마스터리 돌파 특성 보너스 효과의 세부 명세입니다.
 */
export interface MasteryPerkEffect {
  type: 'moveSpeed' | 'miningPower' | 'miningSpeed' | 'hpRegen' | 'maxHp' | 'luck' | 'masteryExp' | 'critRate' | 'critDmg';
  value: number;
  isMultiplier: boolean;
  chance?: number;
}

/**
 * 마스터리 돌파 특성 정보를 정의하는 데이터 설정 파일입니다.
 */
export interface MasteryPerkDef {
  id: string;
  tileType: string;
  requiredLevel: number;
  name: string;
  description: string;
  effects: MasteryPerkEffect[];
}

/**
 * 게임 내 모든 마스터리 돌파 특성 목록 (24종 광물 x 4단계 = 96개)
 */
export const MASTERY_PERKS: MasteryPerkDef[] = [
  // --- Stone (Index 0) ---
  { id: 'perk_stone_50', tileType: 'stone', requiredLevel: 50, name: '단단한 근력', description: '채굴 위력이 5 증가합니다.', effects: [{ type: 'miningPower', value: 5, isMultiplier: false }] },
  { id: 'perk_stone_100', tileType: 'stone', requiredLevel: 100, name: '태산의 가호', description: '최대 체력이 20% 증가합니다.', effects: [{ type: 'maxHp', value: 0.2, isMultiplier: true }] },
  { id: 'perk_stone_150', tileType: 'stone', requiredLevel: 150, name: '견고한 장비', description: '채굴 위력이 15 증가합니다.', effects: [{ type: 'miningPower', value: 15, isMultiplier: false }] },
  { id: 'perk_stone_200', tileType: 'stone', requiredLevel: 200, name: '불멸의 의지', description: '최대 체력이 30% 증가합니다.', effects: [{ type: 'maxHp', value: 0.3, isMultiplier: true }] },

  // --- Circle 2: Lust (Index 1-3) - Themes: MoveSpeed, MiningSpeed ---
  // crimsonstone
  { id: 'perk_crimsonstone_50', tileType: 'crimsonstone', requiredLevel: 50, name: '핏빛 질주', description: '이동 속도가 10 증가합니다.', effects: [{ type: 'moveSpeed', value: 10, isMultiplier: false }] },
  { id: 'perk_crimsonstone_100', tileType: 'crimsonstone', requiredLevel: 100, name: '욕망의 신속', description: '이동 속도가 10% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.1, isMultiplier: true }] },
  { id: 'perk_crimsonstone_150', tileType: 'crimsonstone', requiredLevel: 150, name: '붉은 가속', description: '채굴 속도가 5% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.05, isMultiplier: true }] },
  { id: 'perk_crimsonstone_200', tileType: 'crimsonstone', requiredLevel: 200, name: '색욕의 현신', description: '이동 속도가 20% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.2, isMultiplier: true }] },
  // galestone
  { id: 'perk_galestone_50', tileType: 'galestone', requiredLevel: 50, name: '미풍의 가호', description: '이동 속도가 15 증가합니다.', effects: [{ type: 'moveSpeed', value: 15, isMultiplier: false }] },
  { id: 'perk_galestone_100', tileType: 'galestone', requiredLevel: 100, name: '바람의 인도', description: '채굴 속도가 10% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.1, isMultiplier: true }] },
  { id: 'perk_galestone_150', tileType: 'galestone', requiredLevel: 150, name: '돌풍의 의지', description: '이동 속도가 15% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.15, isMultiplier: true }] },
  { id: 'perk_galestone_200', tileType: 'galestone', requiredLevel: 200, name: '폭풍의 군주', description: '이동 및 채굴 속도가 15% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.15, isMultiplier: true }, { type: 'miningSpeed', value: 0.15, isMultiplier: true }] },
  // fervorstone
  { id: 'perk_fervorstone_50', tileType: 'fervorstone', requiredLevel: 50, name: '열정의 불꽃', description: '채굴 속도가 5% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.05, isMultiplier: true }] },
  { id: 'perk_fervorstone_100', tileType: 'fervorstone', requiredLevel: 100, name: '끓는 피', description: '채굴 공격력이 10% 증가합니다.', effects: [{ type: 'miningPower', value: 0.1, isMultiplier: true }] },
  { id: 'perk_fervorstone_150', tileType: 'fervorstone', requiredLevel: 150, name: '광란의 채굴', description: '채굴 속도가 15% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.15, isMultiplier: true }] },
  { id: 'perk_fervorstone_200', tileType: 'fervorstone', requiredLevel: 200, name: '타오르는 집념', description: '채굴 속도가 25% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.25, isMultiplier: true }] },

  // --- Circle 3: Gluttony (Index 4-6) - Themes: HP, HPRegen ---
  // moldstone
  { id: 'perk_moldstone_50', tileType: 'moldstone', requiredLevel: 50, name: '포자의 회복', description: 'HP 재생이 2 증가합니다.', effects: [{ type: 'hpRegen', value: 2, isMultiplier: false }] },
  { id: 'perk_moldstone_100', tileType: 'moldstone', requiredLevel: 100, name: '질긴 균사', description: '최대 체력이 50 증가합니다.', effects: [{ type: 'maxHp', value: 50, isMultiplier: false }] },
  { id: 'perk_moldstone_150', tileType: 'moldstone', requiredLevel: 150, name: '증식하는 생명', description: 'HP 재생이 5 증가합니다.', effects: [{ type: 'hpRegen', value: 5, isMultiplier: false }] },
  { id: 'perk_moldstone_200', tileType: 'moldstone', requiredLevel: 200, name: '불사의 곰팡이', description: '최대 체력이 20% 증가합니다.', effects: [{ type: 'maxHp', value: 0.2, isMultiplier: true }] },
  // siltstone
  { id: 'perk_siltstone_50', tileType: 'siltstone', requiredLevel: 50, name: '침전된 기력', description: '최대 체력이 100 증가합니다.', effects: [{ type: 'maxHp', value: 100, isMultiplier: false }] },
  { id: 'perk_siltstone_100', tileType: 'siltstone', requiredLevel: 100, name: '퇴적된 근육', description: '최대 체력이 15% 증가합니다.', effects: [{ type: 'maxHp', value: 0.15, isMultiplier: true }] },
  { id: 'perk_siltstone_150', tileType: 'siltstone', requiredLevel: 150, name: '단단한 침전', description: 'HP 재생이 8 증가합니다.', effects: [{ type: 'hpRegen', value: 8, isMultiplier: false }] },
  { id: 'perk_siltstone_200', tileType: 'siltstone', requiredLevel: 200, name: '대지의 요새', description: '최대 체력이 40% 증가합니다.', effects: [{ type: 'maxHp', value: 0.4, isMultiplier: true }] },
  // gorestone
  { id: 'perk_gorestone_50', tileType: 'gorestone', requiredLevel: 50, name: '피의 치유', description: 'HP 재생이 10% 증가합니다.', effects: [{ type: 'hpRegen', value: 0.1, isMultiplier: true }] },
  { id: 'perk_gorestone_100', tileType: 'gorestone', requiredLevel: 100, name: '선혈의 장막', description: '최대 체력이 200 증가합니다.', effects: [{ type: 'maxHp', value: 200, isMultiplier: false }] },
  { id: 'perk_gorestone_150', tileType: 'gorestone', requiredLevel: 150, name: '넘치는 생기', description: 'HP 재생이 20% 증가합니다.', effects: [{ type: 'hpRegen', value: 0.2, isMultiplier: true }] },
  { id: 'perk_gorestone_200', tileType: 'gorestone', requiredLevel: 200, name: '탐식의 끝', description: '최대 체력이 25% 증가하고 재생이 15 증가합니다.', effects: [{ type: 'maxHp', value: 0.25, isMultiplier: true }, { type: 'hpRegen', value: 15, isMultiplier: false }] },

  // --- Circle 4: Greed (Index 7-9) - Themes: Luck, Gold (Gold is represented via Luck now) ---
  // goldstone
  { id: 'perk_goldstone_50', tileType: 'goldstone', requiredLevel: 50, name: '황금의 안목', description: '행운이 20 증가합니다.', effects: [{ type: 'luck', value: 20, isMultiplier: false }] },
  { id: 'perk_goldstone_100', tileType: 'goldstone', requiredLevel: 100, name: '빛나는 직감', description: '행운이 50 증가합니다.', effects: [{ type: 'luck', value: 50, isMultiplier: false }] },
  { id: 'perk_goldstone_150', tileType: 'goldstone', requiredLevel: 150, name: '재화의 부름', description: '행운이 20% 증가합니다.', effects: [{ type: 'luck', value: 0.2, isMultiplier: true }] },
  { id: 'perk_goldstone_200', tileType: 'goldstone', requiredLevel: 200, name: '황금의 축복', description: '행운이 100% 증가합니다.', effects: [{ type: 'luck', value: 1.0, isMultiplier: true }] },
  // luststone
  { id: 'perk_luststone_50', tileType: 'luststone', requiredLevel: 50, name: '소유의 욕구', description: '행운이 30 증가합니다.', effects: [{ type: 'luck', value: 30, isMultiplier: false }] },
  { id: 'perk_luststone_100', tileType: 'luststone', requiredLevel: 100, name: '탐욕의 통찰', description: '행운이 80 증가합니다.', effects: [{ type: 'luck', value: 80, isMultiplier: false }] },
  { id: 'perk_luststone_150', tileType: 'luststone', requiredLevel: 150, name: '갈망하는 손길', description: '행운이 30% 증가합니다.', effects: [{ type: 'luck', value: 0.3, isMultiplier: true }] },
  { id: 'perk_luststone_200', tileType: 'luststone', requiredLevel: 200, name: '탐심의 정점', description: '행운이 150% 증가합니다.', effects: [{ type: 'luck', value: 1.5, isMultiplier: true }] },
  // midasite
  { id: 'perk_midasite_50', tileType: 'midasite', requiredLevel: 50, name: '미다스의 손길', description: '행운이 50 증가합니다.', effects: [{ type: 'luck', value: 50, isMultiplier: false }] },
  { id: 'perk_midasite_100', tileType: 'midasite', requiredLevel: 100, name: '황금 변환', description: '행운이 150 증가합니다.', effects: [{ type: 'luck', value: 150, isMultiplier: false }] },
  { id: 'perk_midasite_150', tileType: 'midasite', requiredLevel: 150, name: '연금술의 극의', description: '행운이 50% 증가합니다.', effects: [{ type: 'luck', value: 0.5, isMultiplier: true }] },
  { id: 'perk_midasite_200', tileType: 'midasite', requiredLevel: 200, name: '전설의 미다스', description: '행운이 300% 증가합니다.', effects: [{ type: 'luck', value: 3.0, isMultiplier: true }] },

  // --- Circle 5: Wrath (Index 10-12) - Themes: CritRate, CritDmg ---
  // ragestone
  { id: 'perk_ragestone_50', tileType: 'ragestone', requiredLevel: 50, name: '분노의 일격', description: '치명타 확률이 2% 증가합니다.', effects: [{ type: 'critRate', value: 0.02, isMultiplier: false }] },
  { id: 'perk_ragestone_100', tileType: 'ragestone', requiredLevel: 100, name: '폭발적 분출', description: '치명타 피해량이 20% 증가합니다.', effects: [{ type: 'critDmg', value: 0.2, isMultiplier: false }] },
  { id: 'perk_ragestone_150', tileType: 'ragestone', requiredLevel: 150, name: '격렬한 분노', description: '치명타 확률이 5% 증가합니다.', effects: [{ type: 'critRate', value: 0.05, isMultiplier: false }] },
  { id: 'perk_ragestone_200', tileType: 'ragestone', requiredLevel: 200, name: '진노의 현신', description: '치명타 피해량이 50% 증가합니다.', effects: [{ type: 'critDmg', value: 0.5, isMultiplier: false }] },
  // cinderstone
  { id: 'perk_cinderstone_50', tileType: 'cinderstone', requiredLevel: 50, name: '잿더미 속 예리함', description: '치명타 확률이 3% 증가합니다.', effects: [{ type: 'critRate', value: 0.03, isMultiplier: false }] },
  { id: 'perk_cinderstone_100', tileType: 'cinderstone', requiredLevel: 100, name: '검은 고통', description: '치명타 피해량이 30% 증가합니다.', effects: [{ type: 'critDmg', value: 0.3, isMultiplier: false }] },
  { id: 'perk_cinderstone_150', tileType: 'cinderstone', requiredLevel: 150, name: '꺼지지 않는 불꽃', description: '치명타 확률이 8% 증가합니다.', effects: [{ type: 'critRate', value: 0.08, isMultiplier: false }] },
  { id: 'perk_cinderstone_200', tileType: 'cinderstone', requiredLevel: 200, name: '잿빛 학살자', description: '치명타 확률 10%, 피해량 40% 증가합니다.', effects: [{ type: 'critRate', value: 0.1, isMultiplier: false }, { type: 'critDmg', value: 0.4, isMultiplier: false }] },
  // furystone
  { id: 'perk_furystone_50', tileType: 'furystone', requiredLevel: 50, name: '격노의 타격', description: '치명타 피해량이 40% 증가합니다.', effects: [{ type: 'critDmg', value: 0.4, isMultiplier: false }] },
  { id: 'perk_furystone_100', tileType: 'furystone', requiredLevel: 100, name: '광폭 충격', description: '치명타 확률이 10% 증가합니다.', effects: [{ type: 'critRate', value: 0.1, isMultiplier: false }] },
  { id: 'perk_furystone_150', tileType: 'furystone', requiredLevel: 150, name: '학살의 의지', description: '치명타 피해량이 100% 증가합니다.', effects: [{ type: 'critDmg', value: 1.0, isMultiplier: false }] },
  { id: 'perk_furystone_200', tileType: 'furystone', requiredLevel: 200, name: '영원한 복수자', description: '치명타 확률 20%, 피해량 150% 증가합니다.', effects: [{ type: 'critRate', value: 0.2, isMultiplier: false }, { type: 'critDmg', value: 1.5, isMultiplier: false }] },

  // --- Circle 6: Heresy (Index 13-15) - Themes: Mastery EXP ---
  // ashstone
  { id: 'perk_ashstone_50', tileType: 'ashstone', requiredLevel: 50, name: '낙진의 지식', description: '마스터리 경험치가 5% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.05, isMultiplier: true }] },
  { id: 'perk_ashstone_100', tileType: 'ashstone', requiredLevel: 100, name: '메마른 연구', description: '마스터리 경험치가 10% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.1, isMultiplier: true }] },
  { id: 'perk_ashstone_150', tileType: 'ashstone', requiredLevel: 150, name: '잿빛 깨달음', description: '마스터리 경험치가 20% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.2, isMultiplier: true }] },
  { id: 'perk_ashstone_200', tileType: 'ashstone', requiredLevel: 200, name: '이단의 성자', description: '마스터리 경험치가 40% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.4, isMultiplier: true }] },
  // blightstone
  { id: 'perk_blightstone_50', tileType: 'blightstone', requiredLevel: 50, name: '저주받은 통찰', description: '마스터리 경험치가 10% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.1, isMultiplier: true }] },
  { id: 'perk_blightstone_100', tileType: 'blightstone', requiredLevel: 100, name: '금지된 서적', description: '마스터리 경험치가 25% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.25, isMultiplier: true }] },
  { id: 'perk_blightstone_150', tileType: 'blightstone', requiredLevel: 150, name: '타락한 예언', description: '마스터리 경험치가 50% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.5, isMultiplier: true }] },
  { id: 'perk_blightstone_200', tileType: 'blightstone', requiredLevel: 200, name: '암흑의 현자', description: '마스터리 경험치 획득량이 100% 증가합니다.', effects: [{ type: 'masteryExp', value: 1.0, isMultiplier: true }] },
  // vexite
  { id: 'perk_vexite_50', tileType: 'vexite', requiredLevel: 50, name: '고뇌의 배움', description: '마스터리 경험치가 15% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.15, isMultiplier: true }] },
  { id: 'perk_vexite_100', tileType: 'vexite', requiredLevel: 100, name: '비통한 탐구', description: '마스터리 경험치가 40% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.4, isMultiplier: true }] },
  { id: 'perk_vexite_150', tileType: 'vexite', requiredLevel: 150, name: '고통의 극의', description: '마스터리 경험치가 75% 증가합니다.', effects: [{ type: 'masteryExp', value: 0.75, isMultiplier: true }] },
  { id: 'perk_vexite_200', tileType: 'vexite', requiredLevel: 200, name: '초월적 불신자', description: '마스터리 경험치 획득량이 150% 증가합니다.', effects: [{ type: 'masteryExp', value: 1.5, isMultiplier: true }] },

  // --- Circle 7: Violence (Index 16-18) - Themes: Mining Power ---
  // thornstone
  { id: 'perk_thornstone_50', tileType: 'thornstone', requiredLevel: 50, name: '가시 박힌 드릴', description: '채굴 위력이 50 증가합니다.', effects: [{ type: 'miningPower', value: 50, isMultiplier: false }] },
  { id: 'perk_thornstone_100', tileType: 'thornstone', requiredLevel: 100, name: '부식성 가시', description: '채굴 위력이 150 증가합니다.', effects: [{ type: 'miningPower', value: 150, isMultiplier: false }] },
  { id: 'perk_thornstone_150', tileType: 'thornstone', requiredLevel: 150, name: '출혈 타격', description: '채굴 위력이 20% 증가합니다.', effects: [{ type: 'miningPower', value: 0.2, isMultiplier: true }] },
  { id: 'perk_thornstone_200', tileType: 'thornstone', requiredLevel: 200, name: '파멸의 가시', description: '채굴 위력이 40% 증가합니다.', effects: [{ type: 'miningPower', value: 0.4, isMultiplier: true }] },
  // bloodstone
  { id: 'perk_bloodstone_50', tileType: 'bloodstone', requiredLevel: 50, name: '혈액 주입', description: '채굴 위력이 100 증가합니다.', effects: [{ type: 'miningPower', value: 100, isMultiplier: false }] },
  { id: 'perk_bloodstone_100', tileType: 'bloodstone', requiredLevel: 100, name: '응고된 힘', description: '채굴 위력이 300 증가합니다.', effects: [{ type: 'miningPower', value: 300, isMultiplier: false }] },
  { id: 'perk_bloodstone_150', tileType: 'bloodstone', requiredLevel: 150, name: '선혈의 축제', description: '채굴 위력이 50% 증가합니다.', effects: [{ type: 'miningPower', value: 0.5, isMultiplier: true }] },
  { id: 'perk_bloodstone_200', tileType: 'bloodstone', requiredLevel: 200, name: '피의 폭군', description: '채굴 위력이 80% 증가합니다.', effects: [{ type: 'miningPower', value: 0.8, isMultiplier: true }] },
  // cruelite
  { id: 'perk_cruelite_50', tileType: 'cruelite', requiredLevel: 50, name: '잔혹한 충격', description: '채굴 위력이 250 증가합니다.', effects: [{ type: 'miningPower', value: 250, isMultiplier: false }] },
  { id: 'perk_cruelite_100', tileType: 'cruelite', requiredLevel: 100, name: '무자비한 파쇄', description: '채굴 위력이 700 증가합니다.', effects: [{ type: 'miningPower', value: 700, isMultiplier: false }] },
  { id: 'perk_cruelite_150', tileType: 'cruelite', requiredLevel: 150, name: '학살자의 위용', description: '채굴 위력이 100% 증가합니다.', effects: [{ type: 'miningPower', value: 1.0, isMultiplier: true }] },
  { id: 'perk_cruelite_200', tileType: 'cruelite', requiredLevel: 200, name: '절대적 폭력', description: '채굴 위력이 200% 증가합니다.', effects: [{ type: 'miningPower', value: 2.0, isMultiplier: true }] },

  // --- Circle 8: Fraud (Index 19-21) - Themes: MoveSpeed, Luck, MiningSpeed Mixed ---
  // mimicite
  { id: 'perk_mimicite_50', tileType: 'mimicite', requiredLevel: 50, name: '의태의 전술', description: '이동 속도가 20% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.2, isMultiplier: true }] },
  { id: 'perk_mimicite_100', tileType: 'mimicite', requiredLevel: 100, name: '유령 드릴', description: '채굴 속도가 15% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.15, isMultiplier: true }] },
  { id: 'perk_mimicite_150', tileType: 'mimicite', requiredLevel: 150, name: '거짓된 무게', description: '이동 속도가 40% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.4, isMultiplier: true }] },
  { id: 'perk_mimicite_200', tileType: 'mimicite', requiredLevel: 200, name: '완전한 의태', description: '이동 및 채굴 속도가 30% 증가합니다.', effects: [{ type: 'moveSpeed', value: 0.3, isMultiplier: true }, { type: 'miningSpeed', value: 0.3, isMultiplier: true }] },
  // lurerstone
  { id: 'perk_lurerstone_50', tileType: 'lurerstone', requiredLevel: 50, name: '유혹의 비늘', description: '행운이 100 증가합니다.', effects: [{ type: 'luck', value: 100, isMultiplier: false }] },
  { id: 'perk_lurerstone_100', tileType: 'lurerstone', requiredLevel: 100, name: '환각의 행운', description: '행운이 300 증가합니다.', effects: [{ type: 'luck', value: 300, isMultiplier: false }] },
  { id: 'perk_lurerstone_150', tileType: 'lurerstone', requiredLevel: 150, name: '기만의 향기', description: '행운이 50% 증가합니다.', effects: [{ type: 'luck', value: 0.5, isMultiplier: true }] },
  { id: 'perk_lurerstone_200', tileType: 'lurerstone', requiredLevel: 200, name: '강탈자의 환상', description: '행운이 200% 증가합니다.', effects: [{ type: 'luck', value: 2.0, isMultiplier: true }] },
  // phantomite
  { id: 'perk_phantomite_50', tileType: 'phantomite', requiredLevel: 50, name: '망령의 신속함', description: '채굴 속도가 20% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.2, isMultiplier: true }] },
  { id: 'perk_phantomite_100', tileType: 'phantomite', requiredLevel: 100, name: '실체 없는 타격', description: '채굴 공격력이 40% 증가합니다.', effects: [{ type: 'miningPower', value: 0.4, isMultiplier: true }] },
  { id: 'perk_phantomite_150', tileType: 'phantomite', requiredLevel: 150, name: '그림자 파동', description: '채굴 속도가 50% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.5, isMultiplier: true }] },
  { id: 'perk_phantomite_200', tileType: 'phantomite', requiredLevel: 200, name: '심연의 망령', description: '채굴 속도 60%, 공격력 60% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.6, isMultiplier: true }, { type: 'miningPower', value: 0.6, isMultiplier: true }] },

  // --- Circle 9: Treachery (Index 22-24) - Themes: God-like stats ---
  // froststone
  { id: 'perk_froststone_50', tileType: 'froststone', requiredLevel: 50, name: '동토의 단단함', description: '최대 체력이 100% 증가합니다.', effects: [{ type: 'maxHp', value: 1.0, isMultiplier: true }] },
  { id: 'perk_froststone_100', tileType: 'froststone', requiredLevel: 100, name: '영결의 숨결', description: '전체 공격력이 50% 증가합니다.', effects: [{ type: 'miningPower', value: 0.5, isMultiplier: true }] },
  { id: 'perk_froststone_150', tileType: 'froststone', requiredLevel: 150, name: '절대 영도', description: '최대 체력이 200% 증가합니다.', effects: [{ type: 'maxHp', value: 2.0, isMultiplier: true }] },
  { id: 'perk_froststone_200', tileType: 'froststone', requiredLevel: 200, name: '배신의 고독', description: '공격력 100%, 체력 100% 증가합니다.', effects: [{ type: 'miningPower', value: 1.0, isMultiplier: true }, { type: 'maxHp', value: 1.0, isMultiplier: true }] },
  // glacialite
  { id: 'perk_glacialite_50', tileType: 'glacialite', requiredLevel: 50, name: '빙하의 무게', description: '채굴 공격력이 100% 증가합니다.', effects: [{ type: 'miningPower', value: 1.0, isMultiplier: true }] },
  { id: 'perk_glacialite_100', tileType: 'glacialite', requiredLevel: 100, name: '영겁의 냉기', description: '채굴 속도가 50% 증가합니다.', effects: [{ type: 'miningSpeed', value: 0.5, isMultiplier: true }] },
  { id: 'perk_glacialite_150', tileType: 'glacialite', requiredLevel: 150, name: '거대 빙산', description: '채굴 공격력이 200% 증가합니다.', effects: [{ type: 'miningPower', value: 2.0, isMultiplier: true }] },
  { id: 'perk_glacialite_200', tileType: 'glacialite', requiredLevel: 200, name: '절대 권력자', description: '채굴 공격력 300%, 속도 100% 증가합니다.', effects: [{ type: 'miningPower', value: 3.0, isMultiplier: true }, { type: 'miningSpeed', value: 1.0, isMultiplier: true }] },
  // abyssstone
  { id: 'perk_abyssstone_50', tileType: 'abyssstone', requiredLevel: 50, name: '심연의 부름', description: '모든 스탯이 50% 상승합니다.', effects: [{ type: 'miningPower', value: 0.5, isMultiplier: true }, { type: 'maxHp', value: 0.5, isMultiplier: true }, { type: 'luck', value: 0.5, isMultiplier: true }] },
  { id: 'perk_abyssstone_100', tileType: 'abyssstone', requiredLevel: 100, name: '어둠의 지배', description: '채굴 속도가 100% 증가합니다.', effects: [{ type: 'miningSpeed', value: 1.0, isMultiplier: true }] },
  { id: 'perk_abyssstone_150', tileType: 'abyssstone', requiredLevel: 150, name: '공허의 제왕', description: '치명타 확률 20%, 치명타 피해 200% 증가합니다.', effects: [{ type: 'critRate', value: 0.2, isMultiplier: false }, { type: 'critDmg', value: 2.0, isMultiplier: false }] },
  { id: 'perk_abyssstone_200', tileType: 'abyssstone', requiredLevel: 200, name: '심연의 신', description: '모든 성능이 500% 폭증합니다.', effects: [{ type: 'miningPower', value: 5.0, isMultiplier: true }, { type: 'miningSpeed', value: 2.0, isMultiplier: true }, { type: 'luck', value: 5.0, isMultiplier: true }] }
];
