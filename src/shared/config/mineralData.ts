import { TileType } from '../types/game';
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

export const MINERALS: MineralDefinition[] = [
  {
    key: 'veinstone',
    name: 'Veinstone',
    icon: '💎',
    description: 'Mineral from Circle 2 - Lust',
    color: '#94a3b8',
    minDepth: 300,
    basePrice: 5,
    baseHealth: 100,
    defense: 20,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'galestone',
    name: 'Galestone',
    icon: '💎',
    description: 'Mineral from Circle 2 - Lust',
    color: '#94a3b8',
    minDepth: 400,
    basePrice: 10,
    baseHealth: 200,
    defense: 25,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'fervorstone',
    name: 'Fervorstone',
    icon: '💎',
    description: 'Mineral from Circle 2 - Lust',
    color: '#94a3b8',
    minDepth: 500,
    basePrice: 15,
    baseHealth: 300,
    defense: 30,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'moldstone',
    name: 'Moldstone',
    icon: '💎',
    description: 'Mineral from Circle 3 - Gluttony',
    color: '#94a3b8',
    minDepth: 600,
    basePrice: 10,
    baseHealth: 200,
    defense: 30,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'siltstone',
    name: 'Siltstone',
    icon: '💎',
    description: 'Mineral from Circle 3 - Gluttony',
    color: '#94a3b8',
    minDepth: 700,
    basePrice: 20,
    baseHealth: 400,
    defense: 35,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'gorestone',
    name: 'Gorestone',
    icon: '💎',
    description: 'Mineral from Circle 3 - Gluttony',
    color: '#94a3b8',
    minDepth: 800,
    basePrice: 30,
    baseHealth: 600,
    defense: 40,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'goldstone',
    name: 'Goldstone',
    icon: '💎',
    description: 'Mineral from Circle 4 - Greed',
    color: '#94a3b8',
    minDepth: 900,
    basePrice: 20,
    baseHealth: 400,
    defense: 40,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'luststone',
    name: 'Luststone',
    icon: '💎',
    description: 'Mineral from Circle 4 - Greed',
    color: '#94a3b8',
    minDepth: 1000,
    basePrice: 40,
    baseHealth: 800,
    defense: 45,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'midasite',
    name: 'Midasite',
    icon: '💎',
    description: 'Mineral from Circle 4 - Greed',
    color: '#94a3b8',
    minDepth: 1100,
    basePrice: 60,
    baseHealth: 1200,
    defense: 50,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'ragestone',
    name: 'Ragestone',
    icon: '💎',
    description: 'Mineral from Circle 5 - Wrath',
    color: '#94a3b8',
    minDepth: 1200,
    basePrice: 40,
    baseHealth: 800,
    defense: 50,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'cinderstone',
    name: 'Cinderstone',
    icon: '💎',
    description: 'Mineral from Circle 5 - Wrath',
    color: '#94a3b8',
    minDepth: 1300,
    basePrice: 80,
    baseHealth: 1600,
    defense: 55,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'furystone',
    name: 'Furystone',
    icon: '💎',
    description: 'Mineral from Circle 5 - Wrath',
    color: '#94a3b8',
    minDepth: 1400,
    basePrice: 120,
    baseHealth: 2400,
    defense: 60,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'ashstone',
    name: 'Ashstone',
    icon: '💎',
    description: 'Mineral from Circle 6 - Heresy',
    color: '#94a3b8',
    minDepth: 1500,
    basePrice: 80,
    baseHealth: 1600,
    defense: 60,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'blightstone',
    name: 'Blightstone',
    icon: '💎',
    description: 'Mineral from Circle 6 - Heresy',
    color: '#94a3b8',
    minDepth: 1600,
    basePrice: 160,
    baseHealth: 3200,
    defense: 65,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'vexite',
    name: 'Vexite',
    icon: '💎',
    description: 'Mineral from Circle 6 - Heresy',
    color: '#94a3b8',
    minDepth: 1700,
    basePrice: 240,
    baseHealth: 4800,
    defense: 70,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'thornstone',
    name: 'Thornstone',
    icon: '💎',
    description: 'Mineral from Circle 7 - Violence',
    color: '#94a3b8',
    minDepth: 1800,
    basePrice: 160,
    baseHealth: 3200,
    defense: 70,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'bloodstone',
    name: 'Bloodstone',
    icon: '💎',
    description: 'Mineral from Circle 7 - Violence',
    color: '#94a3b8',
    minDepth: 1900,
    basePrice: 320,
    baseHealth: 6400,
    defense: 75,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'cruelite',
    name: 'Cruelite',
    icon: '💎',
    description: 'Mineral from Circle 7 - Violence',
    color: '#94a3b8',
    minDepth: 2000,
    basePrice: 480,
    baseHealth: 9600,
    defense: 80,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'mimicite',
    name: 'Mimicite',
    icon: '💎',
    description: 'Mineral from Circle 8 - Fraud',
    color: '#94a3b8',
    minDepth: 2100,
    basePrice: 320,
    baseHealth: 6400,
    defense: 80,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'lurerstone',
    name: 'Lurerstone',
    icon: '💎',
    description: 'Mineral from Circle 8 - Fraud',
    color: '#94a3b8',
    minDepth: 2200,
    basePrice: 640,
    baseHealth: 12800,
    defense: 85,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'phantomite',
    name: 'Phantomite',
    icon: '💎',
    description: 'Mineral from Circle 8 - Fraud',
    color: '#94a3b8',
    minDepth: 2300,
    basePrice: 960,
    baseHealth: 19200,
    defense: 90,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'froststone',
    name: 'Froststone',
    icon: '💎',
    description: 'Mineral from Circle 9 - Treachery',
    color: '#94a3b8',
    minDepth: 2400,
    basePrice: 640,
    baseHealth: 12800,
    defense: 90,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'glacialite',
    name: 'Glacialite',
    icon: '💎',
    description: 'Mineral from Circle 9 - Treachery',
    color: '#94a3b8',
    minDepth: 2500,
    basePrice: 1280,
    baseHealth: 25600,
    defense: 95,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
  {
    key: 'abyssstone',
    name: 'Abyssstone',
    icon: '💎',
    description: 'Mineral from Circle 9 - Treachery',
    color: '#94a3b8',
    minDepth: 2600,
    basePrice: 1920,
    baseHealth: 38400,
    defense: 100,
    image: 'stone_icon', // Placeholder
    tileImage: 'stone_tile', // Placeholder
  },
];
