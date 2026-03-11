import { TileType, Rarity } from '../types/game';

export interface MineralDefinition {
  key: TileType;
  name: string;
  icon: string;
  rarity: Rarity;
  description: string;
  color: string;
  minDepth: number;
  basePrice: number; // 상점 판매 가격 (G)
  baseHealth: number; // 광물 파괴에 필요한 타격 체력
}

export const MINERALS: MineralDefinition[] = [
  {
    key: 'dirt',
    name: '흙 (Dirt)',
    icon: '🟤',
    rarity: 'Common',
    description: '가장 흔한 지표면의 흙입니다. 미미한 가치를 가집니다.',
    color: '#94a3b8',
    minDepth: 0,
    basePrice: 1, // TileMap.value = 1
    baseHealth: 10,
  },
  {
    key: 'stone',
    name: '돌 (Stone)',
    icon: '🪨',
    rarity: 'Common',
    description: '단단하게 굳은 암석입니다. 기본적인 건축 자재로 쓰입니다.',
    color: '#94a3b8',
    minDepth: 0,
    basePrice: 0, // TileMap.value = 0
    baseHealth: 120,
  },
  {
    key: 'coal',
    name: '석탄 (Coal)',
    icon: '⬛',
    rarity: 'Uncommon',
    description: '탄소가 풍부한 광물입니다. 연료나 초기 자금원으로 유용합니다.',
    color: '#4ade80',
    minDepth: 50,
    basePrice: 10, // TileMap.value = 10
    baseHealth: 60,
  },
  {
    key: 'iron',
    name: '철 (Iron)',
    icon: '🥈',
    rarity: 'Uncommon',
    description: '밀도가 높은 산업용 금속입니다. 다양한 장비의 기초가 됩니다.',
    color: '#4ade80',
    minDepth: 150,
    basePrice: 50, // TileMap.value = 50
    baseHealth: 300,
  },
  {
    key: 'gold',
    name: '금 (Gold)',
    icon: '🟡',
    rarity: 'Rare',
    description: '전도율이 높은 귀금속입니다. 상점에서 높은 가격에 거래됩니다.',
    color: '#60a5fa',
    minDepth: 300,
    basePrice: 200, // TileMap.value = 200
    baseHealth: 800,
  },
  {
    key: 'diamond',
    name: '다이아몬드 (Diamond)',
    icon: '💎',
    rarity: 'Radiant',
    description: '순수 탄소 결정체입니다. 극도로 단단하며 다각도로 빛을 분산시킵니다.',
    color: '#ec4899',
    minDepth: 1500,
    basePrice: 1000, 
    baseHealth: 2000,
  },
  {
    key: 'emerald',
    name: '에메랄드 (Emerald)',
    icon: '🟩',
    rarity: 'Epic',
    description: '정밀한 광학 장비에 사용되는 투명한 녹색 보석입니다.',
    color: '#a855f7',
    minDepth: 600,
    basePrice: 500,
    baseHealth: 4000,
  },
  {
    key: 'ruby',
    name: '루비 (Ruby)',
    icon: '🟥',
    rarity: 'Epic',
    description: '열 저항이 강한 붉은 보석입니다. 레이저 장비 등에 쓰입니다.',
    color: '#a855f7',
    minDepth: 800,
    basePrice: 800,
    baseHealth: 6000,
  },
  {
    key: 'sapphire',
    name: '사파이어 (Sapphire)',
    icon: '🟦',
    rarity: 'Radiant',
    description: '매우 단단한 청색 보석입니다. 찬란한 빛을 내뿜으며 고성능 센서 배열의 핵심이 됩니다.',
    color: '#ec4899',
    minDepth: 1200,
    basePrice: 1200,
    baseHealth: 10000,
  },
  {
    key: 'uranium',
    name: '우라늄 (Uranium)',
    icon: '☢️',
    rarity: 'Legendary',
    description: '불안정하지만 강력한 에너지를 품은 방사성 원소입니다.',
    color: '#f59e0b',
    minDepth: 2000,
    basePrice: 2000,
    baseHealth: 18000,
  },
  {
    key: 'obsidian',
    name: '흑요석 (Obsidian)',
    icon: '🌑',
    rarity: 'Mythic',
    description: '원자 수준의 날카로움을 가진 화산 유리입니다. 신화적인 전설을 품고 있습니다.',
    color: '#ef4444',
    minDepth: 3000,
    basePrice: 5000,
    baseHealth: 30000,
  },
];

export const RARITY_COLORS: { [key in Rarity]: string } = {
  Common: '#94a3b8',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  Epic: '#a855f7',
  Radiant: '#ec4899',
  Legendary: '#f59e0b',
  Mythic: '#ef4444',
  Ancient: '#22d3ee',
};
