const fs = require('fs');

const circles = [
  { id: 2, name: 'Lust', minerals: ['veinstone', 'galestone', 'fervorstone'] },
  { id: 3, name: 'Gluttony', minerals: ['moldstone', 'siltstone', 'gorestone'] },
  { id: 4, name: 'Greed', minerals: ['goldstone', 'luststone', 'midasite'] },
  { id: 5, name: 'Wrath', minerals: ['ragestone', 'cinderstone', 'furystone'] },
  { id: 6, name: 'Heresy', minerals: ['ashstone', 'blightstone', 'vexite'] },
  { id: 7, name: 'Violence', minerals: ['thornstone', 'bloodstone', 'cruelite'] },
  { id: 8, name: 'Fraud', minerals: ['mimicite', 'lurerstone', 'phantomite'] },
  { id: 9, name: 'Treachery', minerals: ['froststone', 'glacialite', 'abyssstone'] },
];

let mineralData = `import { TileType } from '../types/game';
import { AtlasIconName } from './atlasMap';

export interface MineralDefinition {
  key: TileType;
  name: string;
  icon: string;
  description: string;
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
  const depthBase = (c.id - 1) * 300;
  const baseHp = 100 * Math.pow(2, idx);
  const basePrice = 5 * Math.pow(2, idx);
  
  c.minerals.forEach((m, mIdx) => {
    const minD = depthBase + mIdx * 100;
    mineralData += `  {
    key: '${m}',
    name: '${m.charAt(0).toUpperCase() + m.slice(1)}',
    icon: '💎',
    description: 'Mineral from Circle ${c.id} - ${c.name}',
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

