import { SkillRuneItem, PlayerStats, Rarity } from '../types/game';
import { SKILL_RUNES } from '../config/skillRuneData';

// 기본 글로벌 배수표
const BASE_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2.5,
  Rare: 6,
  Epic: 15,
  Radiant: 40,
  Legendary: 100,
  Mythic: 250,
  Ancient: 600,
};

// 특정 룬에만 적용되는 독자적 배수표 (필요 시 정의)
const OVERRIDE_MULTIPLIERS: Record<string, Record<Rarity, number>> = {
  luck_rune: {
    // 행운 확률은 너무 기하급수적으로 늘면 안 되므로 커스텀 배수
    Common: 1, // 5%
    Uncommon: 2, // 10%
    Rare: 4, // 20%
    Epic: 8, // 40%
    Radiant: 16, // 80%
    Legendary: 30, // 150% (100% 넘어가는 구간)
    Mythic: 50, // 250%
    Ancient: 100, // 500%
  },
  crit_rate_rune: {
    // 치확 역시 서서히 증가
    Common: 1, // 5%
    Uncommon: 2, // 10%
    Rare: 3, // 15%
    Epic: 5, // 25%
    Radiant: 8, // 40%
    Legendary: 12, // 60%
    Mythic: 16, // 80%
    Ancient: 20, // 100%
  },
};

/**
 * 룬의 등급에 따른 최종 배수를 가져옵니다.
 */
export function getRuneMultiplier(runeId: string, rarity: Rarity): number {
  if (OVERRIDE_MULTIPLIERS[runeId] && OVERRIDE_MULTIPLIERS[runeId][rarity] !== undefined) {
    return OVERRIDE_MULTIPLIERS[runeId][rarity];
  }
  return BASE_MULTIPLIERS[rarity] || 1;
}

/**
 * 플레이어가 장착 중인 모든 룬을 계산하여, 특정 스탯의 최종 합산 수치를 반환합니다.
 * @param stats 플레이어 스탯 (장비 및 인벤토리 참조)
 * @param statType 조회하려는 스탯 종류
 */
export function getTotalRuneStat(
  stats: PlayerStats,
  statType: 'power' | 'miningSpeed' | 'moveSpeed' | 'luck' | 'critRate' | 'critDmg',
): number {
  let total = 0;

  // 현재 장착중인 드릴 확인
  if (!stats.equippedDrillId || !stats.equipmentStates[stats.equippedDrillId]) {
    return 0; // 드릴 미장착이거나 에러 방지
  }

  const equipmentState = stats.equipmentStates[stats.equippedDrillId];
  if (!equipmentState.slottedRunes) return 0;

  // 장착된 룬 ID들을 순회하며 인벤토리에서 실제 instance 찾기
  equipmentState.slottedRunes.forEach((runeInstanceId) => {
    if (!runeInstanceId) return;

    const runeItem = stats.inventoryRunes.find((r) => r.id === runeInstanceId);
    if (!runeItem) return;

    const baseRuneInfo = SKILL_RUNES[runeItem.runeId];
    if (!baseRuneInfo) return;

    // 적용해야 하는 배수
    const multiplier = getRuneMultiplier(baseRuneInfo.id, runeItem.rarity as Rarity);

    switch (statType) {
      case 'power':
        if (baseRuneInfo.id === 'attack_rune' && baseRuneInfo.powerBonus) {
          total += baseRuneInfo.powerBonus * multiplier;
        }
        break;
      case 'miningSpeed':
        if (baseRuneInfo.id === 'speed_rune' && baseRuneInfo.speedMult) {
          total += baseRuneInfo.speedMult * multiplier;
        }
        break;
      case 'moveSpeed':
        if (baseRuneInfo.id === 'move_speed_rune' && baseRuneInfo.effectValue) {
          total += baseRuneInfo.effectValue * multiplier;
        }
        break;
      case 'luck':
        if (baseRuneInfo.id === 'luck_rune' && baseRuneInfo.effectValue) {
          total += baseRuneInfo.effectValue * multiplier;
        }
        break;
      case 'critRate':
        if (baseRuneInfo.id === 'crit_rate_rune' && baseRuneInfo.effectChance) {
          total += baseRuneInfo.effectChance * multiplier;
        }
        break;
      case 'critDmg':
        if (baseRuneInfo.id === 'crit_dmg_rune' && baseRuneInfo.effectValue) {
          total += baseRuneInfo.effectValue * multiplier;
        }
        break;
    }
  });

  return total;
}
