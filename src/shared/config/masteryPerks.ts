/**
 * 마스터리 돌파 특성 정보를 정의하는 데이터 설정 파일입니다.
 */

export interface MasteryPerkDef {
  /** 특성 고유 식별자 */
  id: string;
  /** 관련 타일 종류 */
  tileType: string;
  /** 해금에 필요한 마스터리 레벨 */
  requiredLevel: number;
  /** 플레이어에게 표시될 특성 이름 */
  name: string;
  /** 특성 상세 설명 */
  description: string;
}

/**
 * 게임 내 모든 마스터리 돌파 특성 목록
 */
export const MASTERY_PERKS: MasteryPerkDef[] = [
  // --- 흙 (Dirt) 타일 특성 트리 ---
  {
    id: 'perk_dirt_50',
    tileType: 'dirt',
    requiredLevel: 50,
    name: '손쉬운 개간',
    description: '흙 타일을 파괴한 직후 1.5초 동안 플레이어의 이동 속도가 20% 증가합니다.'
  },
  {
    id: 'perk_dirt_100',
    tileType: 'dirt',
    requiredLevel: 100,
    name: '대지의 기운',
    description: '흙 타일을 파괴할 때 1%의 확률로 체력이 1 회복됩니다.'
  },
  {
    id: 'perk_dirt_150',
    tileType: 'dirt',
    requiredLevel: 150,
    name: '쾌속의 발굴',
    description: '흙 타일을 파괴한 직후 1.5초 동안 플레이어의 이동 속도가 40% 증가합니다.'
  },
  {
    id: 'perk_dirt_200',
    tileType: 'dirt',
    requiredLevel: 200,
    name: '대지의 화신',
    description: '플레이어의 기본 이동 속도가 영구적으로 10% 증가합니다.'
  }
];
