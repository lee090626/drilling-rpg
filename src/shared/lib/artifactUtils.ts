import { PlayerStats } from '../types/game';
import { ARTIFACT_DATA } from '../config/artifactData';

/**
 * 유물(Artifact) 시스템에 의해 계산된 보너스 스탯 인터페이스입니다.
 */
export interface ArtifactBonuses {
  maxHp: number;
  power: number;
  moveSpeed: number;
  luck: number;
  critRate: number;
  critDamage: number;
  defense: number;
  miningSpeed: number;
}

/**
 * 특정 유물이 해금되었는지 확인합니다 (고유 유물 전용).
 */
export function isArtifactUnlocked(stats: PlayerStats, artifactId: string): boolean {
  return stats.unlockedResearchIds?.includes(artifactId) || false;
}

/**
 * 특정 특수 효과가 활성화되어 있는지 확인합니다.
 */
export function hasArtifactEffect(stats: PlayerStats, effectId: string): boolean {
  if (!stats.unlockedResearchIds) return false;
  
  // 해당 효과를 가진 유물이 하나라도 해금되어 있는지 체크
  return stats.unlockedResearchIds.some(id => {
    const data = ARTIFACT_DATA[id];
    return data && data.effectId === effectId;
  });
}

/**
 * 인벤토리 및 수집 기록을 기반으로현재 적용 중인 총 유물 보너스를 계산합니다.
 * @param stats 플레이어 정보
 * @returns 합산된 보너스 수치
 */
export function calculateArtifactBonuses(stats: PlayerStats): ArtifactBonuses {
  const bonuses: ArtifactBonuses = {
    maxHp: 0,
    power: 0,
    moveSpeed: 0,
    luck: 0,
    critRate: 0,
    critDamage: 0,
    defense: 0,
    miningSpeed: 0,
  };

  // 1. 일반 유물 (Stackable) 보너스 계산
  if (stats.collectionHistory) {
    for (const [itemId, count] of Object.entries(stats.collectionHistory)) {
      const data = ARTIFACT_DATA[itemId];
      if (data && data.type === 'stackable' && data.bonus) {
        const totalBonus = count * data.bonus.value;
        bonuses[data.bonus.stat] += totalBonus;
      }
    }
  }

  // 2. 고유 유물 (Unique) 기본 스택 보너스 계산 (있는 경우)
  if (stats.unlockedResearchIds) {
    stats.unlockedResearchIds.forEach(id => {
      const data = ARTIFACT_DATA[id];
      if (data && data.type === 'unique' && data.bonus) {
        bonuses[data.bonus.stat] += data.bonus.value;
      }
    });
  }

  // 3. 루시퍼의 영겁 서리 (INFINITE_SCALING) 효과 적용
  // - 100m마다 모든 스탯 1% 복리 증가
  if (hasArtifactEffect(stats, 'INFINITE_SCALING')) {
    const depth = stats.maxDepthReached || 0;
    const stacks = Math.floor(depth / 100);
    if (stacks > 0) {
      const multiplier = Math.pow(1.01, stacks);
      bonuses.power = (bonuses.power || 0) * multiplier;
      bonuses.maxHp = (bonuses.maxHp || 0) * multiplier;
      bonuses.defense = (bonuses.defense || 0) * multiplier;
      // 다른 기본 스탯들도 필요시 적용
    }
  }

  return bonuses;
}

/**
 * 특정 스탯 명칭에 해당하는 유물 보너스 값을 가져옵니다.
 */
export function getArtifactStat(stats: PlayerStats, statName: keyof ArtifactBonuses): number {
  const allBonuses = calculateArtifactBonuses(stats);
  return allBonuses[statName] || 0;
}
