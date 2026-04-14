import { Equipment } from '../types/game';

/**
 * 장비 데이터베이스 (EQUIPMENTS)
 * 모든 드릴, 투구, 갑옷, 신발 데이터를 중앙 관리합니다.
 * 
 * @description
 * 각 Circle(지옥의 원)별로 4종류의 장비(드릴, 투구, 갑옷, 신발)를 제공합니다.
 * 각 장비는 특정 Circle의 테마와 난이도에 맞는 스탯을 제공합니다.
 * 
 * @property {string} id - 장비의 고유 식별자
 * @property {string} name - 장비의 이름
 * @property {string} description - 장비 설명
 * @property {string} part - 장비 부위 (drill, helmet, armor, boots)
 * @property {number} circle - 해당 Circle 번호 (2-9)
 * @property {string} icon - UI에 표시될 아이콘 (이모지)
 * @property {string} image - 아틀라스에 등록된 이미지 ID (AtlasIconName)
 * @property {Object} stats - 장비 스탯
 * @property {number} stats.power - 공격력/채굴력 (드릴 전용)
 * @property {number} stats.defense - 방어력 (투구, 갑옷, 신발)
 * @property {number} stats.maxHp - 최대 체력 (갑옷, 신발)
 * @property {number} stats.moveSpeed - 이동 속도 (신발)
 * @property {Object} price - 제작/구매 비용
 * @property {number} maxSkillSlots - 최대 스킬 슬롯 수 (드릴 전용)
 */
export const EQUIPMENTS: Record<string, any> = {
  // === Circle 2 — Lust (색욕) ===
  'crimson_fang': {
    id: 'crimson_fang',
    name: 'Crimson Fang',
    description: 'A drill carved from lustrous red crystal. Focuses on pure mining power.',
    part: 'Drill',
    circle: 2,
    icon: '🦷',
    image: 'CrimsonFangDrill',
    stats: { power: 15 },
    price: { crimsonstone: 20, goldCoins: 1000 },
    maxSkillSlots: 1
  },
  'crimson_veil': {
    id: 'crimson_veil',
    name: 'Crimson Veil',
    description: 'A sleek helmet that sharpens the senses.',
    part: 'Helmet',
    circle: 2,
    icon: '🥽',
    image: 'CrimsonVeilHelmet',
    stats: { defense: 5 },
    price: { crimsonstone: 15, goldCoins: 800 }
  },
  'crimson_plate': {
    id: 'crimson_plate',
    name: 'Crimson Plate',
    description: 'Armor made from reinforced crimson crystal layers.',
    part: 'Armor',
    circle: 2,
    icon: '🛡️',
    image: 'CrimsonPlateArmor',
    stats: { maxHp: 100 },
    price: { crimsonstone: 25, goldCoins: 1200 }
  },
  'crimson_stride': {
    id: 'crimson_stride',
    name: 'Crimson Stride',
    description: 'Boots that provide a balance of speed and protection.',
    part: 'Boots',
    circle: 2,
    icon: '👢',
    image: 'CrimsonStrideBoots',
    stats: { moveSpeed: 10, defense: 2, maxHp: 30 },
    price: { crimsonstone: 15, goldCoins: 900 }
  },

  // === Circle 3 — Gluttony (탐식) ===
  'void_crusher': {
    id: 'void_crusher',
    name: 'Void Crusher',
    description: 'Consumes any resistance. Tremendous mining force.',
    part: 'Drill',
    circle: 3,
    icon: '🌑',
    stats: { power: 30 },
    price: { moldstone: 30, goldCoins: 3000 },
    maxSkillSlots: 2
  },
  'void_mask': {
    id: 'void_mask',
    name: 'Void Mask',
    description: 'Mask that devours incoming physical shock.',
    part: 'Helmet',
    circle: 3,
    icon: '🎭',
    stats: { defense: 12 },
    price: { moldstone: 20, goldCoins: 2500 }
  },
  'void_mantle': {
    id: 'void_mantle',
    name: 'Void Mantle',
    description: 'A heavy cloak containing the weight of the void.',
    part: 'Armor',
    circle: 3,
    icon: '🧥',
    stats: { maxHp: 250 },
    price: { moldstone: 40, goldCoins: 4000 }
  },
  'void_step': {
    id: 'void_step',
    name: 'Void Step',
    description: 'Move as if gravity does not exist.',
    part: 'Boots',
    circle: 3,
    icon: '👣',
    stats: { moveSpeed: 20, defense: 5, maxHp: 80 },
    price: { moldstone: 20, goldCoins: 3000 }
  },

  // === Circle 4 — Greed (탐욕) ===
  'crown_piercer': {
    id: 'crown_piercer',
    name: 'Crown Piercer',
    description: 'Golden drill designed to extract the most precious riches.',
    part: 'Drill',
    circle: 4,
    icon: '🔱',
    stats: { power: 55 },
    price: { midasite: 50, goldCoins: 10000 },
    maxSkillSlots: 3
  },
  'crown_helm': {
    id: 'crown_helm',
    name: 'Crown Helm',
    description: 'A royal headpiece offering absolute protection.',
    part: 'Helmet',
    circle: 4,
    icon: '👑',
    stats: { defense: 25 },
    price: { luststone: 40, goldCoins: 8000 }
  },
  'crown_vestment': {
    id: 'crown_vestment',
    name: 'Crown Vestment',
    description: 'Garments woven with golden threads of greed.',
    part: 'Armor',
    circle: 4,
    icon: '🥋',
    stats: { maxHp: 500 },
    price: { midasite: 60, goldCoins: 12000 }
  },
  'crown_treads': {
    id: 'crown_treads',
    name: 'Crown Treads',
    description: 'Walk upon the path of gold with haste.',
    part: 'Boots',
    circle: 4,
    icon: '👟',
    stats: { moveSpeed: 35, defense: 10, maxHp: 150 },
    price: { midasite: 30, goldCoins: 9000 }
  },

  // === Circle 5 — Wrath (분노) ===
  'ember_fang': {
    id: 'ember_fang',
    name: 'Ember Fang',
    description: 'Burning drill that melts through anything.',
    part: 'Drill',
    circle: 5,
    icon: '🔥',
    stats: { power: 90 },
    price: { furystone: 80, goldCoins: 25000 },
    maxSkillSlots: 3
  },
  'ember_visor': {
    id: 'ember_visor',
    name: 'Ember Visor',
    description: 'Red-hot visor that reveals weaknesses.',
    part: 'Helmet',
    circle: 5,
    icon: '🕶️',
    stats: { defense: 45 },
    price: { cinderstone: 60, goldCoins: 20000 }
  },
  'ember_plate': {
    id: 'ember_plate',
    name: 'Ember Plate',
    description: 'Armor forged in the deepest furnace of wrath.',
    part: 'Armor',
    circle: 5,
    icon: '🛡️',
    stats: { maxHp: 1000 },
    price: { furystone: 100, goldCoins: 35000 }
  },
  'ember_stride': {
    id: 'ember_stride',
    name: 'Ember Stride',
    description: 'Each step leaves a trail of burning anger.',
    part: 'Boots',
    circle: 5,
    icon: '🥾',
    stats: { moveSpeed: 55, defense: 15, maxHp: 300 },
    price: { cinderstone: 50, goldCoins: 22000 }
  },

  // === Circle 6 — Heresy (이단) ===
  'ash_bore': {
    id: 'ash_bore',
    name: 'Ash Bore',
    description: 'A drill that turned to ash but kept its edge.',
    part: 'Drill',
    circle: 6,
    icon: '🌪️',
    stats: { power: 150 },
    price: { vexite: 150, goldCoins: 80000 },
    maxSkillSlots: 4
  },
  'ash_cowl': {
    id: 'ash_cowl',
    name: 'Ash Cowl',
    description: 'Silence the screams of the past.',
    part: 'Helmet',
    circle: 6,
    icon: '👤',
    stats: { defense: 80 },
    price: { ashstone: 120, goldCoins: 60000 }
  },
  'ash_shroud': {
    id: 'ash_shroud',
    name: 'Ash Shroud',
    description: 'Light as dust, strong as obsidian.',
    part: 'Armor',
    circle: 6,
    icon: '🧥',
    stats: { maxHp: 2000 },
    price: { vexite: 200, goldCoins: 100000 }
  },
  'ash_glide': {
    id: 'ash_glide',
    name: 'Ash Glide',
    description: 'Slide through the air itself.',
    part: 'Boots',
    circle: 6,
    icon: '🛸',
    stats: { moveSpeed: 80, defense: 30, maxHp: 600 },
    price: { ashstone: 100, goldCoins: 75000 }
  }
};
