import { MonsterDefinition } from './monsters/types';
import { circle2Monsters } from './monsters/circle2';
import { circle3Monsters } from './monsters/circle3';
import { circle4Monsters } from './monsters/circle4';
import { circle5Monsters } from './monsters/circle5';
import { circle6Monsters } from './monsters/circle6';
import { circle7Monsters } from './monsters/circle7';
import { circle8Monsters } from './monsters/circle8';
import { circle9Monsters } from './monsters/circle9';

// 타입 재내보내기 (기존 호환성 유지)
export * from './monsters/types';

/**
 * 게임 내 모든 몬스터 및 보스 데이터의 통합 리스트입니다.
 * 이제 각 층(Circle)별 파일에서 데이터를 관리합니다.
 */
export const MONSTER_LIST: MonsterDefinition[] = [
  ...circle2Monsters,
  ...circle3Monsters,
  ...circle4Monsters,
  ...circle5Monsters,
  ...circle6Monsters,
  ...circle7Monsters,
  ...circle8Monsters,
  ...circle9Monsters,
];

// 빠른 접근을 위한 맵 및 리스트 생성 (기존 호환성 유지)
export const MONSTERS: Record<string, MonsterDefinition> = {};
export const MONSTER_DEFINITIONS: MonsterDefinition[] = [];

MONSTER_LIST.forEach((m) => {
  MONSTERS[m.id] = m;
  MONSTER_DEFINITIONS.push(m);
});
