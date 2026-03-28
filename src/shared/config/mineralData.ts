import { TileType, Rarity } from '../types/game';
import DirtIcon from '../assets/minerals/DirtIcon.png';
import StoneIcon from '../assets/minerals/StoneIcon.png';
import CoalIcon from '../assets/minerals/CoalIcon.png';
import IronIcon from '../assets/minerals/IronIcon.png';
import GoldIcon from '../assets/minerals/GoldIcon.png';
import DiamondIcon from '../assets/minerals/DiamondIcon.png';

// 추출된 타일 이미지들 임포트
import DirtTile from '../assets/tiles/dirt.png';
import StoneTile from '../assets/tiles/stone.png';
import CoalTile from '../assets/tiles/coal.png';
import IronTile from '../assets/tiles/iron.png';
import GoldTile from '../assets/tiles/gold.png';
import DiamondTile from '../assets/tiles/diamond.png';
import EmeraldTile from '../assets/tiles/emerald.png';
import RubyTile from '../assets/tiles/ruby.png';
import SapphireTile from '../assets/tiles/sapphire.png';
import UraniumTile from '../assets/tiles/uranium.png';
import ObsidianTile from '../assets/tiles/obsidian.png';
import WallTile from '../assets/tiles/wall.png';
import DungeonBricksTile from '../assets/tiles/dungeon_bricks.png';
import PortalTile from '../assets/tiles/portal.png';
import LavaTile from '../assets/tiles/lava.png';
import MonsterNestTile from '../assets/tiles/monster_nest.png';
import BossCoreTile from '../assets/tiles/boss_core.png';
import BossSkinTile from '../assets/tiles/boss_skin.png';

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
  defense: number; // 광물 방어력
  image?: any; // 선택적인 실제 이미지 에셋 (아이템 아이콘 용)
  tileImage?: any; // 맵 타일용 이미지 에셋
  _cachedImage?: any; // 렌더링 캔버스 최적화용 캐시 객체
  _cachedTileImage?: any; // 타일 렌더링 최적화용 캐시 객체
}

export const MINERALS: MineralDefinition[] = [
  {
    key: 'dirt',
    name: 'Dirt',
    icon: '🟤',
    rarity: 'Common',
    description: 'The most common surface soil. Has minimal value.',
    color: '#94a3b8',
    minDepth: 0,
    basePrice: 1,
    baseHealth: 30,
    defense: 0,
    image: DirtIcon,
    tileImage: DirtTile,
  },
  {
    key: 'stone',
    name: 'Stone',
    icon: '🪨',
    rarity: 'Common',
    description: 'Hardened rock. Used as basic construction material.',
    color: '#94a3b8',
    minDepth: 0,
    basePrice: 1,
    baseHealth: 100,
    defense: 10,
    image: StoneIcon,
    tileImage: StoneTile,
  },
  {
    key: 'coal',
    name: 'Coal',
    icon: '⬛',
    rarity: 'Uncommon',
    description: 'Carbon-rich mineral. Useful as fuel or early funding source.',
    color: '#4ade80',
    minDepth: 20,
    basePrice: 5,
    baseHealth: 250,
    defense: 25,
    image: CoalIcon,
    tileImage: CoalTile,
  },
  {
    key: 'iron',
    name: 'Iron',
    icon: '🥈',
    rarity: 'Uncommon',
    description: 'Dense industrial metal. Serves as the base for various equipment.',
    color: '#4ade80',
    minDepth: 100,
    basePrice: 20,
    baseHealth: 600,
    defense: 60,
    image: IronIcon,
    tileImage: IronTile,
  },
  {
    key: 'gold',
    name: 'Gold',
    icon: '🟡',
    rarity: 'Rare',
    description: 'Highly conductive precious metal. Traded at high prices in the shop.',
    color: '#60a5fa',
    minDepth: 150,
    basePrice: 80,
    baseHealth: 1000,
    defense: 120,
    image: GoldIcon,
    tileImage: GoldTile,
  },
  {
    key: 'emerald',
    name: 'Emerald',
    icon: '🟩',
    rarity: 'Epic',
    description: 'Transparent green gem used in precision optical equipment.',
    color: '#a855f7',
    minDepth: 100,
    basePrice: 200,
    baseHealth: 1500,
    defense: 200,
    tileImage: EmeraldTile,
  },
  {
    key: 'ruby',
    name: 'Ruby',
    icon: '🟥',
    rarity: 'Epic',
    description: 'Heat-resistant red gem. Used in laser equipment and more.',
    color: '#a855f7',
    minDepth: 200,
    basePrice: 350,
    baseHealth: 2000,
    defense: 300,
    tileImage: RubyTile,
  },
  {
    key: 'sapphire',
    name: 'Sapphire',
    icon: '🟦',
    rarity: 'Radiant',
    description: 'Extremely hard blue gem. Emits a brilliant light and is the core of high-performance sensor arrays.',
    color: '#ec4899',
    minDepth: 100,
    basePrice: 600,
    baseHealth: 3000,
    defense: 450,
    tileImage: SapphireTile,
  },
  {
    key: 'diamond',
    name: 'Diamond',
    icon: '💎',
    rarity: 'Radiant',
    description: 'Pure carbon crystals. Extremely hard and disperses light in multiple directions.',
    color: '#ec4899',
    minDepth: 250,
    basePrice: 1200,
    baseHealth: 4000,
    defense: 600,
    tileImage: DiamondTile,
  },
  {
    key: 'uranium',
    name: 'Uranium',
    icon: '☢️',
    rarity: 'Legendary',
    description: 'Unstable but high-energy radioactive element.',
    color: '#f59e0b',
    minDepth: 100,
    basePrice: 2500,
    baseHealth: 6000,
    defense: 850,
    tileImage: UraniumTile,
  },
  {
    key: 'obsidian',
    name: 'Obsidian',
    icon: '🌑',
    rarity: 'Mythic',
    description: 'Volcanic glass with atomic-level sharpness. Carries mythical legends.',
    color: '#ef4444',
    minDepth: 300,
    basePrice: 6000,
    baseHealth: 10000,
    defense: 1200,
    tileImage: ObsidianTile,
  },
  {
    key: 'iron_ingot',
    name: 'Iron Ingot',
    icon: '🪚',
    rarity: 'Rare',
    description: 'Smelted iron bar. Essential for advanced crafting.',
    color: '#94a3b8',
    minDepth: -1,
    basePrice: 150,
    baseHealth: 0,
    defense: 0,
  },
  {
    key: 'gold_ingot',
    name: 'Gold Ingot',
    icon: '🏅',
    rarity: 'Epic',
    description: 'Refined gold bar. Very valuable and conductive.',
    color: '#fbbf24',
    minDepth: -1,
    basePrice: 500,
    baseHealth: 0,
    defense: 0,
  },
  {
    key: 'polished_diamond',
    name: 'Polished Diamond',
    icon: '💠',
    rarity: 'Legendary',
    description: 'Perfectly cut diamond. Focuses intense energy.',
    color: '#ec4899',
    minDepth: -1,
    basePrice: 8000,
    baseHealth: 0,
    defense: 0,
  },
  // 특수 타일 데이터 (유지보수용 개별 이미지 연동)
  {
    key: 'wall' as any,
    name: 'Wall',
    icon: '🧱',
    rarity: 'Common',
    description: 'Unbreakable border wall.',
    color: '#1a1a1b',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 1000,
    defense: 0,
    tileImage: WallTile,
  },
  {
    key: 'lava' as any,
    name: 'Lava',
    icon: '🔥',
    rarity: 'Common',
    description: 'Dangerous liquid fire.',
    color: '#f97316',
    minDepth: -2,
    basePrice: 0,
    baseHealth: Infinity,
    defense: 0,
    tileImage: LavaTile,
  },
  {
    key: 'portal' as any,
    name: 'Portal',
    icon: '🌀',
    rarity: 'Rare',
    description: 'Relic of an ancient civilization.',
    color: '#a855f7',
    minDepth: -2,
    basePrice: 0,
    baseHealth: Infinity,
    defense: 0,
    tileImage: PortalTile,
  },
  {
    key: 'dungeon_bricks' as any,
    name: 'Dungeon Bricks',
    icon: '🧱',
    rarity: 'Common',
    description: 'Ancient bricks.',
    color: '#374151',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 1000,
    defense: 0,
    tileImage: DungeonBricksTile,
  },
  {
    key: 'monster_nest' as any,
    name: 'Monster Nest',
    icon: '🥚',
    rarity: 'Uncommon',
    description: 'A nest of monsters.',
    color: '#b91c1c',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 200,
    defense: 0,
    tileImage: MonsterNestTile,
  },
  {
    key: 'boss_core' as any,
    name: 'Boss Core',
    icon: '🟣',
    rarity: 'Epic',
    description: 'The core of a boss.',
    color: '#064e3b',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 10000,
    defense: 0,
    tileImage: BossCoreTile,
  },
  {
    key: 'boss_skin' as any,
    name: 'Boss Skin',
    icon: '🟢',
    rarity: 'Epic',
    description: 'The skin of a boss.',
    color: '#064e3b',
    minDepth: -2,
    basePrice: 0,
    baseHealth: 40000,
    defense: 0,
    tileImage: BossSkinTile,
  }
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
