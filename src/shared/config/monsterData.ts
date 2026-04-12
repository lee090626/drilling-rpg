
/**
 * 게임 내 몬스터 및 보스 데이터 정의입니다.
 * 이 파일은 scripts/genData.js에 의해 자동으로 생성됩니다.
 */
export interface MonsterDefinition {
  id: string;
  name: string;
  nameKo: string;
  type: 'monster' | 'boss';
  imagePath: string; // atlas key
  description: string;
  mechanic?: string;
  rarity?: string;
  stats: {
    maxHp: number;
    power: number;
    defense: number;
    speed: number;
    attackCooldown: number;
  };
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
  behavior: {
    movementType: 'chase' | 'wander' | 'stationary' | 'flee';
    attackRange: number;
    aggroRange: number;
    projectileId?: string;
  };
}

export const MONSTER_LIST: MonsterDefinition[] = [
  {
    id: 'c2_whisperer',
    name: 'Lustful Whisperer',
    nameKo: '유혹하는 속삭임',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 500, power: 25, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c2_wind_soul',
    name: 'Wind-torn Soul',
    nameKo: '바람에 찢긴 영혼',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 600, power: 30, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 60, gold: 12, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c2_gale_bat',
    name: 'Gale Bat',
    nameKo: '돌풍 박쥐',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Lust 서클의 하급 영혼입니다.',
    stats: { maxHp: 450, power: 35, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 45, gold: 9, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c2_asmodeus',
    name: 'Asmodeus',
    nameKo: '아스모데우스',
    type: 'boss',
    imagePath: 'oros_face',
    description: '3개의 머리 (황소, 인간, 숫양), 불꽃 날개, 뱀 꼬리. 몸 전체에서 붉은 열기가 뿜어져 나옴',
    stats: { maxHp: 15000, power: 120, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 7500, gold: 1500, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c3_devourer',
    name: 'Bloated Devourer',
    nameKo: '비대한 포식자',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1500, power: 60, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 150, gold: 30, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c3_worm',
    name: 'Carrion Worm',
    nameKo: '부패 벌레',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1200, power: 70, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 120, gold: 24, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c3_mud_shade',
    name: 'Mud-stained Shade',
    nameKo: '진흙에 잠긴 그림자',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Gluttony 서클의 하급 영혼입니다.',
    stats: { maxHp: 1800, power: 50, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 180, gold: 36, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c3_beelzebub',
    name: 'Beelzebub',
    nameKo: '벨제붑',
    type: 'boss',
    imagePath: 'oros_face',
    description: '거대한 파리 형태, 썩은 날개, 복부가 비정상적으로 부풀어있음. 주변에 파리 떼가 항상 들끓음',
    stats: { maxHp: 45000, power: 250, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 22500, gold: 4500, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c4_hoarder',
    name: 'Hoarding Specter',
    nameKo: '수집가 망령',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 4000, power: 120, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 400, gold: 80, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c4_sinner',
    name: 'Gilded Sinner',
    nameKo: '황금 죄인',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 5500, power: 150, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 550, gold: 110, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c4_mimic',
    name: 'Fortune Mimic',
    nameKo: '운명의 미믹',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Greed 서클의 하급 영혼입니다.',
    stats: { maxHp: 3500, power: 200, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 350, gold: 70, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c4_mammon',
    name: 'Mammon',
    nameKo: '마몬',
    type: 'boss',
    imagePath: 'oros_face',
    description: '황금 갑옷으로 뒤덮인 거대 인간형, 눈이 황금 동전. 몸에서 금화가 흘러내림',
    stats: { maxHp: 120000, power: 500, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 60000, gold: 12000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c5_dweller',
    name: 'Styx Dweller',
    nameKo: '스틱스의 거주자',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 12000, power: 300, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 1200, gold: 240, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c5_fury',
    name: 'Raging Fury',
    nameKo: '격노한 복수심',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 10000, power: 450, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 1000, gold: 200, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c5_golem',
    name: 'Mud Golem',
    nameKo: '진흙 골렘',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Wrath 서클의 하급 영혼입니다.',
    stats: { maxHp: 25000, power: 250, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 2500, gold: 500, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c5_azazel',
    name: 'Azazel',
    nameKo: '아자젤',
    type: 'boss',
    imagePath: 'oros_face',
    description: '타락한 천사, 검게 그을린 날개, 온몸에 쇠사슬이 감겨있음. 눈에서 붉은 불꽃',
    stats: { maxHp: 350000, power: 1200, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 175000, gold: 35000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c6_priest',
    name: 'Heretic Priest',
    nameKo: '이단 사제',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 35000, power: 800, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 3500, gold: 700, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c6_flame',
    name: 'Eternal Flame Soul',
    nameKo: '영겁의 불꽃 영혼',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 30000, power: 1200, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 3000, gold: 600, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c6_angel',
    name: 'Fallen Angel',
    nameKo: '타락한 천사',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Heresy 서클의 하급 영혼입니다.',
    stats: { maxHp: 50000, power: 900, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c6_samael',
    name: 'Samael',
    nameKo: '사마엘',
    type: 'boss',
    imagePath: 'oros_face',
    description: '검게 물든 천사 날개, 온몸에 독이 흘러내림. 피부는 창백하고 균열이 가득하며 틈에서 보라빛 독액이 흘러나옴. 부러진 후광, 독이 묻은 검',
    stats: { maxHp: 900000, power: 3500, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 450000, gold: 90000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c7_centaur',
    name: 'Centaur Archer',
    nameKo: '켄타우로스 궁수',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Violence 서클의 하급 영혼입니다.',
    stats: { maxHp: 120000, power: 2500, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 12000, gold: 2400, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c7_guard',
    name: 'Blood-soaked Guard',
    nameKo: '선혈의 경비병',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Violence 서클의 하급 영혼입니다.',
    stats: { maxHp: 180000, power: 3000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 18000, gold: 3600, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c7_spawn',
    name: 'Minotaur Spawn',
    nameKo: '미노타우로스 하수인',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Violence 서클의 하급 영혼입니다.',
    stats: { maxHp: 250000, power: 4500, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 25000, gold: 5000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c7_belial',
    name: 'Belial',
    nameKo: '벨리알',
    type: 'boss',
    imagePath: 'oros_face',
    description: '불꽃 전차를 탄 타락천사, 두 개의 검은 날개, 온몸이 불꽃으로 이루어진 형태',
    stats: { maxHp: 3000000, power: 15000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 1500000, gold: 300000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c8_malebranche',
    name: 'Malebranche',
    nameKo: '말레브랑케',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 600000, power: 10000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 60000, gold: 12000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c8_prophet',
    name: 'False Prophet',
    nameKo: '거짓 예언자',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 500000, power: 15000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50000, gold: 10000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c8_illusionist',
    name: 'Illusionist Shade',
    nameKo: '환술사의 그림자',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Fraud 서클의 하급 영혼입니다.',
    stats: { maxHp: 450000, power: 12000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 45000, gold: 9000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c8_abaddon',
    name: 'Abaddon',
    nameKo: '아바돈',
    type: 'boss',
    imagePath: 'oros_face',
    description: '거대한 메뚜기 형태, 전갈 꼬리, 철 갑옷을 두른 날개. 주변에 메뚜기 군단이 들끓음',
    stats: { maxHp: 12000000, power: 45000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 6000000, gold: 1200000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  },
  {
    id: 'c9_sinner',
    name: 'Ice-bound Sinner',
    nameKo: '빙결된 죄인',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Treachery 서클의 하급 영혼입니다.',
    stats: { maxHp: 2500000, power: 40000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 250000, gold: 50000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c9_specter',
    name: 'Cocytus Specter',
    nameKo: '코키토스 망령',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Treachery 서클의 하급 영혼입니다.',
    stats: { maxHp: 2000000, power: 55000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 200000, gold: 40000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c9_shadow',
    name: 'Treacherous Shadow',
    nameKo: '배신의 그림자',
    type: 'monster',
    imagePath: 'pebble_golem',
    description: 'Treachery 서클의 하급 영혼입니다.',
    stats: { maxHp: 3000000, power: 35000, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 300000, gold: 60000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  },
  {
    id: 'c9_lucifer',
    name: 'Lucifer',
    nameKo: '루시퍼',
    type: 'boss',
    imagePath: 'oros_face',
    description: '3개의 얼굴, 거대한 얼음에 하반신이 갇혀있음. 6개의 날개는 부러지고 검게 타있음. 눈물이 얼어붙어 있음',
    stats: { maxHp: 100000000, power: 250000, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 50000000, gold: 10000000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  }
];

export const MONSTERS: Record<string, MonsterDefinition> = {};
export const MONSTER_DEFINITIONS: MonsterDefinition[] = [];
MONSTER_LIST.forEach((m) => { MONSTERS[m.id] = m; MONSTER_DEFINITIONS.push(m); });
