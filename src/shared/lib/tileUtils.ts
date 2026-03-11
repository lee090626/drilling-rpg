import { TileType } from '../types/game';

export function getTileColor(type: TileType): string {
  switch (type) {
    case 'dirt': return '#4e342e';
    case 'stone': return '#455a64';
    case 'coal': return '#212121';
    case 'iron': return '#78909c';
    case 'gold': return '#fbc02d';
    case 'diamond': return '#00bcd4';
    case 'emerald': return '#10b981';
    case 'ruby': return '#ef4444';
    case 'sapphire': return '#3b82f6';
    case 'uranium': return '#84cc16';
    case 'obsidian': return '#581c87';
    case 'lava': return '#f97316';
    case 'dungeon_bricks': return '#374151';
    case 'monster_nest': return '#b91c1c';
    case 'boss_skin':
    case 'boss_core': return '#064e3b';
    case 'portal': return '#a855f7';
    case 'wall': return '#1a1a1b';
    default: return '#000000';
  }
}

export function getTileIndex(type: string): number {
  switch (type) {
    case 'empty': return -1;
    case 'dirt': return 0; // 1행 1열
    case 'stone': return 3; // 1행 4열 (벽돌)
    case 'coal': return 5; // 2행 1열
    case 'iron': return 6; // 2행 2열
    case 'gold': return 7; // 2행 3열
    case 'diamond': return 8; // 2행 4열
    case 'emerald': return 20; // 5행 1열
    case 'ruby': return 21; // 5행 2열
    case 'sapphire': return 22; // 5행 3열
    case 'uranium': return 23; // 5행 4열
    case 'obsidian': return 24; // 5행 5열
    case 'lava': return 25;
    case 'dungeon_bricks': return 9; // 2행 5열 (그물망 형태)
    case 'boss_core': return 32;
    case 'monster_nest': return 31;
    case 'wall': return 4; // 1행 5열 (돌벽)
    case 'portal': return 10;
    case 'boss_skin': return 33;
    default: return 0;
  }
}

import { MINERALS } from '../config/mineralData';

export function getMineralStats(type: TileType): { health: number } {
  // 1. 특수 타일 및 비광물 처리
  switch (type) {
    case 'lava': return { health: Infinity };
    case 'wall':
    case 'dungeon_bricks': return { health: 1000 };
    case 'boss_core': return { health: 10000 };
    case 'boss_skin': return { health: 40000 };
    case 'monster_nest': return { health: 200 };
    case 'empty': return { health: 0 };
    case 'portal': return { health: Infinity };
  }

  // 2. 광물 데이터에서 조회 (SSOT)
  const mineral = MINERALS.find(m => m.key === type);
  if (mineral) {
    return { 
      health: mineral.baseHealth
    };
  }

  // Fallback (ex: 알 수 없는 타입 등)
  return { health: 10 };
}
