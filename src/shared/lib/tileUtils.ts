import { TileType } from '../types/game';

import { MINERALS } from '../config/mineralData';

/**
 * 특정 타일 타입에 해당하는 렌더링 색상을 반환합니다.
 * @param type 타일의 종류
 * @returns 헥사코드 색상 문자열
 */
export function getTileColor(type: TileType): string {
  // 1. 특수 타일 등 하드코딩
  switch (type) {
    case 'lava':
      return '#f97316';
    case 'dungeon_bricks':
      return '#374151';
    case 'monster_nest':
      return '#b91c1c';
    case 'boss_skin':
    case 'boss_core':
      return '#064e3b';
    case 'portal':
      return '#a855f7';
    case 'wall':
      return '#1a1a1b';
    case 'empty':
      return '#000000';
  }

  // 2. 광물 데이터 테이블에서 조회
  const mineral = MINERALS.find((m) => m.key === type);
  if (mineral && mineral.color) return mineral.color;

  return '#455a64'; // fallback string
}

/**
 * 타일셋 이미지 내에서 해당 타일 타입이 위치한 인덱스를 반환합니다.
 * @param type 타일 종류 문자열
 * @returns 타일셋에서의 0-기반 인덱스
 */
export function getTileIndex(type: string): number {
  switch (type) {
    case 'empty':
      return -1;
    case 'lava':
      return 25;
    case 'dungeon_bricks':
      return 9;
    case 'boss_core':
      return 32;
    case 'monster_nest':
      return 31;
    case 'wall':
      return 4;
    case 'portal':
      return 10;
    case 'boss_skin':
      return 33;
    default:
      return 0; // 광물은 개별 아이콘이나 stone으로 렌더링됨
  }
}

/**
 * 타일 타입에 따른 기본 스탯(내구도 등)을 조회합니다.
 * 광물의 경우 MINERALS 설정(SSOT)에서 가져오며, 특수 타일은 직접 계산합니다.
 * @param type 조회할 타일의 종류
 * @returns 타일의 체력 정보를 포함한 객체
 */
export function getMineralStats(type: TileType): { health: number } {
  // 1. 특수 타일 및 비광물 처리 (하드코딩된 규칙)
  switch (type) {
    case 'lava':
      return { health: Infinity };
    case 'wall':
    case 'dungeon_bricks':
      return { health: 1000 };
    case 'boss_core':
      return { health: 10000 };
    case 'boss_skin':
      return { health: 40000 };
    case 'monster_nest':
      return { health: 200 };
    case 'empty':
      return { health: 0 };
    case 'portal':
      return { health: Infinity };
  }

  // 2. 광물 데이터 테이블에서 조회 (단일 진실 공급원 전술)
  const mineral = MINERALS.find((m) => m.key === type);
  if (mineral) {
    return {
      health: mineral.baseHealth,
    };
  }

  // 기본값 (알 수 없는 타입 등 방어 코드)
  return { health: 10 };
}
