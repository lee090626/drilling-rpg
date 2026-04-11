const fs = require('fs');

const circles = [
  { id: 2, name: 'Lust', minerals: ['crimsonstone', 'galestone', 'fervorstone'], namesKo: ['핏빛석', '돌풍석', '열정석'], descKo: ['제2원 색욕의 층에서 발견되는 핏빛 광물입니다.', '강한 바람의 기운이 깃든 광물입니다.', '뜨거운 열망이 느껴지는 단단한 광물입니다.'] },
  { id: 3, name: 'Gluttony', minerals: ['moldstone', 'siltstone', 'gorestone'], namesKo: ['곰팡석', '침전석', '선혈석'], descKo: ['제3원 탐식의 층에서 발견되는 부패한 광물입니다.', '진흙과 오물이 섞여 굳어진 광물입니다.', '기괴한 붉은 색을 띠는 불결한 광물입니다.'] },
  { id: 4, name: 'Greed', minerals: ['goldstone', 'luststone', 'midasite'], namesKo: ['사금석', '욕망석', '미다스석'], descKo: ['제4원 탐심의 층에서 발견되는 빛나는 광물입니다.', '보는 이의 소유욕을 자극하는 아름다운 광물입니다.', '닿는 모든 것을 황금으로 바꿀 듯한 광채를 냅니다.'] },
  { id: 5, name: 'Wrath', minerals: ['ragestone', 'cinderstone', 'furystone'], namesKo: ['분노석', '잿빛석', '격노석'], descKo: ['제5원 분노의 층에서 발견되는 뜨거운 광물입니다.', '타버린 재가 뭉쳐진 듯한 거친 광물입니다.', '폭발적인 에너지를 머금고 있는 광물입니다.'] },
  { id: 6, name: 'Heresy', minerals: ['ashstone', 'blightstone', 'vexite'], namesKo: ['낙진석', '저주석', '고뇌석'], descKo: ['제6원 이단의 층에서 발견되는 메마른 광물입니다.', '불길한 원한이 느껴지는 어두운 광물입니다.', '파낼수록 알 수 없는 고통이 전해지는 광물입니다.'] },
  { id: 7, name: 'Violence', minerals: ['thornstone', 'bloodstone', 'cruelite'], namesKo: ['가시석', '혈석', '잔혹석'], descKo: ['제7원 폭력의 층에서 발견되는 날카로운 광물입니다.', '피가 응고된 듯한 짙은 붉은색의 광물입니다.', '차갑고 무자비한 기운을 내뿜는 단단한 광물입니다.'] },
  { id: 8, name: 'Fraud', minerals: ['mimicite', 'lurerstone', 'phantomite'], namesKo: ['의태석', '기만석', '망령석'], descKo: ['제8원 사기의 층에서 발견되는 기만적인 광물입니다.', '환각을 일으켜 탐험가를 유혹하는 광물입니다.', '실체가 없는 듯 흐릿하게 빛나는 신비한 광물입니다.'] },
  { id: 9, name: 'Treachery', minerals: ['froststone', 'glacialite', 'abyssstone'], namesKo: ['서리석', '빙하석', '심연석'], descKo: ['제9원 배신의 층에서 발견되는 얼어붙은 광물입니다.', '수만 년간의 냉기를 품고 있는 전설적인 광물입니다.', '지옥의 가장 깊은 곳, 절대적인 어둠을 상징하는 광물입니다.'] },
];

let mineralData = `import { TileType } from '../types/game';
import { AtlasIconName } from './atlasMap';

export interface MineralDefinition {
  key: TileType;
  name: string;
  nameKo: string;
  icon: string;
  description: string;
  descriptionKo: string;
  color: string;
  minDepth: number;
  basePrice: number;
  baseHealth: number;
  defense: number;
  image?: AtlasIconName | null | any;
  tileImage?: AtlasIconName | null | any;
  _cachedImage?: any;
  _cachedTileImage?: any;
}

export const MINERALS: MineralDefinition[] = [\n`;

circles.forEach((c, idx) => {
  const depthBase = (c.id - 1) * 300 + 10;
  const baseHp = 100 * Math.pow(2, idx);
  const basePrice = 5 * Math.pow(2, idx);
  
  c.minerals.forEach((m, mIdx) => {
    const minD = depthBase + mIdx * 100;
    const nameKo = c.namesKo[mIdx];
    const descKo = c.descKo[mIdx];
    mineralData += `  {
    key: '${m}',
    name: '${m.charAt(0).toUpperCase() + m.slice(1)}',
    nameKo: '${nameKo}',
    icon: '💎',
    description: 'Mineral from Circle ${c.id} - ${c.name}',
    descriptionKo: '${descKo}',
    color: '#94a3b8',
    minDepth: ${minD},
    basePrice: ${basePrice * (mIdx + 1)},
    baseHealth: ${baseHp * (mIdx + 1)},
    defense: ${10 * c.id + mIdx * 5},
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },\n`;
  });
});
mineralData += `];\n`;
fs.writeFileSync('/Users/ihyeongseog/drilling-game/src/shared/config/mineralData.ts', mineralData);

let monsterData = `
export interface MonsterDefinition {
  id: string;
  name: string;
  type: 'monster' | 'boss';
  imagePath: string; // atlas key
  description: string;
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
    projectileId?: string; // TBD
  };
}

export const MONSTERS: Record<number, MonsterDefinition> = {};
export const MONSTER_DEFINITIONS: MonsterDefinition[] = [];

// Temporarily mapping old bosses and monsters to keep it compiling for now, or just leave it empty if we are refactoring.
// Let's create dummy definitions for all 24 monsters and 8 bosses so the array can be used.
`;

let monsterList = [];
let mIdCounter = 1;

circles.forEach((c, idx) => {
  const baseHp = 500 * Math.pow(2, idx);
  const baseAtk = 20 * Math.pow(1.5, idx);
  const names = ['Soul', 'Shade', 'Wraith'];
  
  names.forEach((n, mIdx) => {
    let mobId = `c${c.id}_${n.toLowerCase()}`;
    monsterList.push(`  {
    id: '${mobId}',
    name: '${c.name} ${n}',
    type: 'monster',
    imagePath: 'pebble_golem', // Placeholder
    description: '',
    stats: { maxHp: ${baseHp}, power: ${baseAtk}, defense: 5, speed: 2, attackCooldown: 1000 },
    rewards: { exp: 50, gold: 10, drops: [] },
    behavior: { movementType: 'chase', attackRange: 1.5, aggroRange: 5 }
  }`);
  });
  
  // Boss
  let bossId = `c${c.id}_boss`;
  monsterList.push(`  {
    id: '${bossId}',
    name: 'Boss of ${c.name}',
    type: 'boss',
    imagePath: 'oros_face', // Placeholder
    description: '',
    stats: { maxHp: ${baseHp * 10}, power: ${baseAtk * 3}, defense: 20, speed: 1.5, attackCooldown: 2000 },
    rewards: { exp: 5000, gold: 1000, drops: [] },
    behavior: { movementType: 'chase', attackRange: 2.5, aggroRange: 10 }
  }`);
});

monsterData += `\nexport const MONSTER_LIST: MonsterDefinition[] = [\n${monsterList.join(',\\n')}\n];\n`;
monsterData += `MONSTER_LIST.forEach((m, i) => { MONSTERS[i] = m; MONSTER_DEFINITIONS.push(m); });\n`;
fs.writeFileSync('/Users/ihyeongseog/drilling-game/src/shared/config/monsterData.ts', monsterData);
