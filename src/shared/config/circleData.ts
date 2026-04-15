import { TileType } from '../types/game';

/**
 * 광물 생성 규칙을 정의하는 인터페이스입니다.
 * 각 Circle(지옥의 원)마다 광물이 생성되는 방식을 제어합니다.
 */
export interface MineralRule {
  /** 광물 타입 (TileType) */
  type: TileType;
  /** 생성 확률 임계값 (0~1 범위, 값이 높을수록 희귀) */
  threshold: number; // 0~1 (조밀도)
  /** 최소 생성 층 (해당 Circle 내 1~30층) */
  minLayer?: number; // 1~30 (해당 Circle 내 층)
  /** 최대 생성 빈도 층 (가장 많이 생성되는 층) */
  peakLayer?: number;
  /** 생성 범위 (층 단위) */
  range?: number;
  /** 군집 크기 (값이 클수록 큰 덩어리로 생성) */
  scale?: number; // 군집 크기
}

/**
 * 몬스터 스폰 규칙을 정의하는 인터페이스입니다.
 * 각 Circle마다 어떤 몬스터가 어느 층에서 생성되는지 제어합니다.
 */
export interface MonsterSpawnRule {
  /** 몬스터 ID (monsterData.ts 참조) */
  monsterId: string;
  /** 스폰 확률 (0~1 범위) */
  chance: number;
  /** 가중치 (다른 몬스터와 비교한 상대적 생성 빈도) */
  weight: number;
  /** 최소 생성 층 */
  minLayer: number;
  /** 최대 생성 층 (없으면 Circle 끝까지 생성) */
  maxLayer?: number;
}

/**
 * Circle(지옥의 원) 설정을 정의하는 인터페이스입니다.
 * 게임의 각 지역(원)마다 고유한 테마와 콘텐츠를 정의합니다.
 */
export interface CircleConfig {
  /** Circle ID (1~9) */
  id: number;
  /** 영어 이름 */
  name: string;
  /** 한국어 이름 */
  nameKo: string;
  /** 테마 설명 */
  theme: string;
  /** 시작 깊이 (전체 게임 기준) */
  depthStart: number;
  /** 종료 깊이 (전체 게임 기준) */
  depthEnd: number;
  /** 배경 채우기 타일 타입. 광물 스팟 외 기본 채워지는 타일. */
  bgType?: TileType;
  /** 광물 생성 규칙 목록 */
  minerals: MineralRule[];
  /** 몬스터 스폰 규칙 목록 */
  monsters: MonsterSpawnRule[];
  /** 보스 정보 (해당 Circle의 최종 보스) */
  boss?: { id: string; spawnLayer: number };
}

export const CIRCLES: CircleConfig[] = [
  {
    id: 1,
    name: 'Limbo',
    nameKo: '림보',
    theme: '수문장 지역',
    bgType: 'stone',
    depthStart: -10,
    depthEnd: 0,
    minerals: [],
    monsters: [],
  },
  {
    id: 2,
    name: 'Lust',
    nameKo: '색욕',
    theme: '폭풍, 열정, 핏빛',
    bgType: 'stone',
    depthStart: 0,
    depthEnd: 300,
    minerals: [
      { type: 'crimsonstone', threshold: 0.5, minLayer: 1 },
      { type: 'galestone', threshold: 0.3, minLayer: 2 },
      { type: 'fervorstone', threshold: 0.15, minLayer: 3 },
    ],
    monsters: [
      { monsterId: 'c2_whisperer', chance: 0.1, weight: 10, minLayer: 1, maxLayer: 3 },
      { monsterId: 'c2_wind_soul', chance: 0.08, weight: 7, minLayer: 2, maxLayer: 3 },
      { monsterId: 'c2_gale_bat', chance: 0.05, weight: 5, minLayer: 3, maxLayer: 3 },
    ],
    boss: { id: 'c2_asmodeus', spawnLayer: 4 },
  },
  {
    id: 3,
    name: 'Gluttony',
    nameKo: '탐식',
    theme: '부패, 진흙, 공허',
    bgType: 'stone',
    depthStart: 300,
    depthEnd: 600,
    minerals: [
      { type: 'moldstone', threshold: 0.6, minLayer: 1, scale: 8 },
      { type: 'siltstone', threshold: 0.4, minLayer: 2, scale: 7 },
      { type: 'gorestone', threshold: 0.2, minLayer: 3, scale: 6 },
    ],
    monsters: [
      { monsterId: 'c3_devourer', chance: 0.07, weight: 1, minLayer: 1 },
      { monsterId: 'c3_worm', chance: 0.04, weight: 1, minLayer: 2 },
      { monsterId: 'c3_mud_shade', chance: 0.03, weight: 1, minLayer: 3 },
    ],
    boss: { id: 'c3_beelzebub', spawnLayer: 4 },
  },
  {
    id: 4,
    name: 'Greed',
    nameKo: '탐욕',
    theme: '황금, 욕망, 차가운 빛',
    bgType: 'stone',
    depthStart: 600,
    depthEnd: 900,
    minerals: [
      { type: 'goldstone', threshold: 0.7, minLayer: 1, scale: 8 },
      { type: 'luststone', threshold: 0.4, minLayer: 2, scale: 7 },
      { type: 'midasite', threshold: 0.25, minLayer: 3, scale: 6 },
    ],
    monsters: [{ monsterId: 'c4_hoarder', chance: 0.08, weight: 1, minLayer: 1 }],
    boss: { id: 'c4_mammon', spawnLayer: 4 },
  },
  {
    id: 5,
    name: 'Wrath',
    nameKo: '분노',
    theme: '용암, 불꽃, 격노',
    bgType: 'stone',
    depthStart: 900,
    depthEnd: 1200,
    minerals: [
      { type: 'ragestone', threshold: 0.65, minLayer: 1, scale: 8 },
      { type: 'cinderstone', threshold: 0.35, minLayer: 2, scale: 7 },
      { type: 'furystone', threshold: 0.2, minLayer: 3, scale: 6 },
    ],
    monsters: [{ monsterId: 'c5_dweller', chance: 0.07, weight: 1, minLayer: 1 }],
    boss: { id: 'c5_azazel', spawnLayer: 4 },
  },
  {
    id: 6,
    name: 'Heresy',
    nameKo: '이단',
    theme: '재, 저주, 어둠',
    bgType: 'stone',
    depthStart: 1200,
    depthEnd: 1500,
    minerals: [
      { type: 'ashstone', threshold: 0.55, minLayer: 1, scale: 8 },
      { type: 'blightstone', threshold: 0.3, minLayer: 2, scale: 7 },
      { type: 'vexite', threshold: 0.15, minLayer: 3, scale: 6 },
    ],
    monsters: [{ monsterId: 'c6_priest', chance: 0.07, weight: 1, minLayer: 1 }],
    boss: { id: 'c6_samael', spawnLayer: 4 },
  },
  {
    id: 7,
    name: 'Violence',
    nameKo: '폭력',
    theme: '피, 가시, 잔혹',
    bgType: 'stone',
    depthStart: 1500,
    depthEnd: 1800,
    minerals: [
      { type: 'thornstone', threshold: 0.5, minLayer: 1, scale: 8 },
      { type: 'bloodstone', threshold: 0.25, minLayer: 2, scale: 7 },
      { type: 'cruelite', threshold: 0.12, minLayer: 3, scale: 6 },
    ],
    monsters: [{ monsterId: 'c7_centaur', chance: 0.06, weight: 1, minLayer: 1 }],
    boss: { id: 'c7_belial', spawnLayer: 4 },
  },
  {
    id: 8,
    name: 'Fraud',
    nameKo: '사기',
    theme: '기만, 그림자, 이중성',
    bgType: 'stone',
    depthStart: 1800,
    depthEnd: 2100,
    minerals: [
      { type: 'mimicite', threshold: 0.4, minLayer: 1, scale: 8 },
      { type: 'lurerstone', threshold: 0.2, minLayer: 2, scale: 7 },
      { type: 'phantomite', threshold: 0.1, minLayer: 3, scale: 6 },
    ],
    monsters: [{ monsterId: 'c8_malebranche', chance: 0.05, weight: 1, minLayer: 1 }],
    boss: { id: 'c8_abaddon', spawnLayer: 4 },
  },
  {
    id: 9,
    name: 'Treachery',
    nameKo: '배신',
    theme: '얼음, 침묵, 칠흑',
    bgType: 'stone',
    depthStart: 2100,
    depthEnd: 2400,
    minerals: [
      { type: 'froststone', threshold: 0.35, minLayer: 1, scale: 8 },
      { type: 'glacialite', threshold: 0.18, minLayer: 2, scale: 7 },
      { type: 'abyssstone', threshold: 0.08, minLayer: 3, scale: 6 },
    ],
    monsters: [{ monsterId: 'c9_sinner', chance: 0.05, weight: 1, minLayer: 1 }],
    boss: { id: 'c9_lucifer', spawnLayer: 4 },
  },
];

export const getCircleConfig = (depth: number): CircleConfig => {
  for (let i = 0; i < CIRCLES.length; i++) {
    if (depth >= CIRCLES[i].depthStart && depth < CIRCLES[i].depthEnd) {
      return CIRCLES[i];
    }
  }
  return CIRCLES[CIRCLES.length - 1];
};

export const getLayerFromDepth = (depth: number, circle: CircleConfig): number => {
  const relativeDepth = depth - circle.depthStart;
  if (relativeDepth < 95) return 1;
  if (relativeDepth < 190) return 2;
  if (relativeDepth < 285) return 3;
  return 4; // Boss Zone (285~300m)
};
