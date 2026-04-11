import { TileType } from '../types/game';

export interface MineralRule {
  type: TileType;
  threshold: number; // 0~1 (조밀도)
  minLayer?: number; // 1~30 (해당 Circle 내 층)
  peakLayer?: number;
  range?: number;
  scale?: number; // 군집 크기
}

export interface MonsterSpawnRule {
  monsterId: string;
  chance: number;
  weight: number;
  minLayer: number;
  maxLayer?: number;
}

export interface CircleConfig {
  id: number;
  name: string;
  nameKo: string;
  theme: string;
  depthStart: number; // 전역 깊이 (ex. 0)
  depthEnd: number;   // 전역 깊이 (ex. 300)
  minerals: MineralRule[];
  monsters: MonsterSpawnRule[];
  boss?: { id: string; spawnLayer: number };
}

export const CIRCLES: CircleConfig[] = [
  {
    id: 1,
    name: 'Limbo',
    nameKo: '림보',
    theme: '수문장 지역',
    depthStart: 0,
    depthEnd: 10,
    minerals: [],
    monsters: [],
  },
  {
    id: 2,
    name: 'Lust',
    nameKo: '색욕',
    theme: '폭풍, 열정, 핏빛',
    depthStart: 10,
    depthEnd: 310, // 30층 (층당 10 깊이)
    minerals: [
      { type: 'veinstone', threshold: 0.20, minLayer: 1, peakLayer: 5, range: 4, scale: 8 },
      { type: 'galestone', threshold: 0.15, minLayer: 11, peakLayer: 15, range: 4, scale: 7 },
      { type: 'fervorstone', threshold: 0.10, minLayer: 21, peakLayer: 25, range: 4, scale: 6 },
    ],
    monsters: [
      { monsterId: 'c2_soul', chance: 0.05, weight: 1, minLayer: 1, maxLayer: 30 },
      { monsterId: 'c2_shade', chance: 0.03, weight: 1, minLayer: 11, maxLayer: 30 },
      { monsterId: 'c2_wraith', chance: 0.02, weight: 1, minLayer: 21, maxLayer: 30 },
    ],
    boss: { id: 'c2_boss', spawnLayer: 30 }
  },
  {
    id: 3,
    name: 'Gluttony',
    nameKo: '탐식',
    theme: '부패, 진흙, 공허',
    depthStart: 310,
    depthEnd: 610,
    minerals: [
      { type: 'moldstone', threshold: 0.20, scale: 8 },
      { type: 'siltstone', threshold: 0.15, minLayer: 11, scale: 7 },
      { type: 'gorestone', threshold: 0.10, minLayer: 21, scale: 6 },
    ],
    monsters: [
      { monsterId: 'c3_soul', chance: 0.05, weight: 1, minLayer: 1 },
      { monsterId: 'c3_shade', chance: 0.03, weight: 1, minLayer: 11 },
      { monsterId: 'c3_wraith', chance: 0.02, weight: 1, minLayer: 21 },
    ],
    boss: { id: 'c3_boss', spawnLayer: 30 }
  },
  // Circle 4 ~ 9 are dynamically structurally valid, but for now we define basic rules.
  {
    id: 4, name: 'Greed', nameKo: '탐욕', theme: '황금, 욕망, 차가운 빛', depthStart: 610, depthEnd: 910,
    minerals: [ { type: 'goldstone', threshold: 0.20, scale: 8 }, { type: 'luststone', threshold: 0.15, scale: 7 }, { type: 'midasite', threshold: 0.10, scale: 6 } ],
    monsters: [{ monsterId: 'c4_soul', chance: 0.05, weight: 1, minLayer: 1 }], boss: { id: 'c4_boss', spawnLayer: 30 }
  },
  {
    id: 5, name: 'Wrath', nameKo: '분노', theme: '용암, 불꽃, 격노', depthStart: 910, depthEnd: 1210,
    minerals: [ { type: 'ragestone', threshold: 0.20, scale: 8 }, { type: 'cinderstone', threshold: 0.15, scale: 7 }, { type: 'furystone', threshold: 0.10, scale: 6 } ],
    monsters: [{ monsterId: 'c5_soul', chance: 0.05, weight: 1, minLayer: 1 }], boss: { id: 'c5_boss', spawnLayer: 30 }
  },
  {
    id: 6, name: 'Heresy', nameKo: '이단', theme: '재, 저주, 어둠', depthStart: 1210, depthEnd: 1510,
    minerals: [ { type: 'ashstone', threshold: 0.20, scale: 8 }, { type: 'blightstone', threshold: 0.15, scale: 7 }, { type: 'vexite', threshold: 0.10, scale: 6 } ],
    monsters: [{ monsterId: 'c6_soul', chance: 0.05, weight: 1, minLayer: 1 }], boss: { id: 'c6_boss', spawnLayer: 30 }
  },
  {
    id: 7, name: 'Violence', nameKo: '폭력', theme: '피, 가시, 잔혹', depthStart: 1510, depthEnd: 1810,
    minerals: [ { type: 'thornstone', threshold: 0.20, scale: 8 }, { type: 'bloodstone', threshold: 0.15, scale: 7 }, { type: 'cruelite', threshold: 0.10, scale: 6 } ],
    monsters: [{ monsterId: 'c7_soul', chance: 0.05, weight: 1, minLayer: 1 }], boss: { id: 'c7_boss', spawnLayer: 30 }
  },
  {
    id: 8, name: 'Fraud', nameKo: '사기', theme: '기만, 그림자, 이중성', depthStart: 1810, depthEnd: 2110,
    minerals: [ { type: 'mimicite', threshold: 0.20, scale: 8 }, { type: 'lurerstone', threshold: 0.15, scale: 7 }, { type: 'phantomite', threshold: 0.10, scale: 6 } ],
    monsters: [{ monsterId: 'c8_soul', chance: 0.05, weight: 1, minLayer: 1 }], boss: { id: 'c8_boss', spawnLayer: 30 }
  },
  {
    id: 9, name: 'Treachery', nameKo: '배신', theme: '얼음, 침묵, 칠흑', depthStart: 2110, depthEnd: 2410,
    minerals: [ { type: 'froststone', threshold: 0.20, scale: 8 }, { type: 'glacialite', threshold: 0.15, scale: 7 }, { type: 'abyssstone', threshold: 0.10, scale: 6 } ],
    monsters: [{ monsterId: 'c9_soul', chance: 0.05, weight: 1, minLayer: 1 }], boss: { id: 'c9_boss', spawnLayer: 30 }
  }
];

export const getCircleConfig = (depth: number): CircleConfig => {
  if (depth < 10) return CIRCLES[0]; // Limbo
  
  for (let i = 1; i < CIRCLES.length; i++) {
    if (depth >= CIRCLES[i].depthStart && depth < CIRCLES[i].depthEnd) {
      return CIRCLES[i];
    }
  }
  return CIRCLES[CIRCLES.length - 1];
};

export const getLayerFromDepth = (depth: number, circle: CircleConfig): number => {
  return Math.floor((depth - circle.depthStart) / 10) + 1;
};
