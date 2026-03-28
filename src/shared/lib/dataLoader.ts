import { Entity } from '../types/game';

/**
 * 베이스 캠프의 레이아웃 데이터를 서버로부터 불러옵니다.
 * @returns 베이스 캠프 타일 맵 데이터 (2차원 배열) 또는 로드 실패 시 null
 */
export async function fetchBaseLayout(): Promise<number[][] | null> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  try {
    const res = await fetch(`${basePath}/baseLayout.json?t=${Date.now()}`);
    const data = await res.json();
    return data.tiles;
  } catch (err) {
    console.error('베이스 레이아웃 로드 실패:', err);
    return null;
  }
}

/**
 * 게임 내에 배치된 엔티티(NPC, 오브젝트 등) 데이터를 불러옵니다.
 * @returns 엔티티 목록 배열
 */
export async function fetchEntities(): Promise<Entity[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  try {
    const res = await fetch(`${basePath}/entities.json?t=${Date.now()}`);
    const data = await res.json();
    return data.entities || [];
  } catch (err) {
    console.error('엔티티 데이터 로드 실패:', err);
    return [];
  }
}
