import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERALS } from '@/shared/config/mineralData';
import {
  getMasteryMultiplier,
  createInitialMasteryState,
  getMasteryBonuses,
} from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { calculateArtifactBonuses, hasArtifactEffect } from '@/shared/lib/artifactUtils';

/**
 * 채굴 대미지 계산 결과 인터페이스
 */
export interface DamageResult {
  finalDamage: number;
  totalPower: number;
  isCrit: boolean;
  attackInterval: number;
}

/**
 * 플레이어의 현재 스탯과 장비를 기반으로 채굴 대미지를 계산합니다.
 */
export const calculateMiningDamage = (
  stats: PlayerStats,
  targetTileType: string,
  customDefense?: number,
): DamageResult => {
  const currentDrill = stats.equipment.drillId ? EQUIPMENTS[stats.equipment.drillId] : null;
  const artifactBonuses = calculateArtifactBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);

  // A. [유물] 사탄의 타오르는 열정 (MINING_SPEED_BOOST): 기본 채굴 속도 25% 증가
  let speedBoostFactor = 0;
  if (hasArtifactEffect(stats, 'MINING_SPEED_BOOST')) {
    speedBoostFactor += 0.25;
  }

  // B. [유물] 레비아탄의 뒤틀린 투영 (TWISTED_PROJECTION): 잃은 체력 1%당 속도 1% 증가
  const missingHpPercent = Math.max(0, (stats.maxHp - stats.hp) / stats.maxHp);
  if (hasArtifactEffect(stats, 'TWISTED_PROJECTION')) {
    speedBoostFactor += missingHpPercent;
  }

  // 1. 공격 속도 계산 (고정 500ms 기반)
  const baseInterval = 500;
  const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
  const totalSpeedBonusMult = Math.min(
    0.95,
    artifactBonuses.miningSpeed +
      runeSpeedBonus +
      masteryBonuses.miningSpeedMult +
      speedBoostFactor,
  );
  let attackInterval = baseInterval * (1 - totalSpeedBonusMult);

  // FATIGUE (피로): 채굴 속도 50% 감소 (쿨타임 2배)
  if (stats.activeEffects?.some((e) => e.type === 'FATIGUE')) {
    attackInterval *= 2;
  }

  // 2. 숙련도 배율 계산 (기본 숙련도 레벨 보너스)
  const tileMastery =
    (stats.tileMastery && stats.tileMastery[targetTileType]) ||
    createInitialMasteryState(targetTileType);
  const masteryMult = getMasteryMultiplier(tileMastery.level);

  // 3. 룬 보너스 및 치명타 계산
  const runeAttackBonus = getTotalRuneStat(stats, 'power');
  const baseCritRate = (stats.luck || 0) * 0.01; // 행운 1당 1%
  const critRate = Math.min(0.9, baseCritRate + getTotalRuneStat(stats, 'critRate'));
  const critDamage = 1.5 + getTotalRuneStat(stats, 'critDmg');

  // stats.power는 이미 statsSyncSystem에서 (기본20 + 장비파워)가 합산된 결과입니다.
  // 숙련도는 '기초 드릴 파워'에 비례하여 추가 보너스를 줍니다.
  const drillPower = currentDrill?.stats.power || 0;
  const levelMasteryBonus = Math.round(drillPower * (masteryMult - 1));

  // --- 최종 위력 계산 ---
  const basePower =
    stats.power +
    levelMasteryBonus +
    masteryBonuses.miningPower +
    Math.floor(runeAttackBonus);

  const totalPowerMult = 1 + masteryBonuses.miningPowerMult;

  let totalPower = Math.floor(basePower * totalPowerMult);

  // 상태 이상에 따른 위력 변조 (BUFF_POWER: 1.5배, WEAKEN: 0.7배)
  if (stats.activeEffects) {
    if (stats.activeEffects.some((e) => e.type === 'BUFF_POWER'))
      totalPower = Math.floor(totalPower * 1.5);
    if (stats.activeEffects.some((e) => e.type === 'WEAKEN'))
      totalPower = Math.floor(totalPower * 0.7);
  }

  // C. [유물] 레비아탄의 뒤틀린 투영 (TWISTED_PROJECTION): 잃은 체력 1%당 최종 대미지 1% 증가
  if (hasArtifactEffect(stats, 'TWISTED_PROJECTION')) {
    totalPower = Math.floor(totalPower * (1 + missingHpPercent));
  }

  let isCrit = false;
  if (Math.random() < critRate) {
    totalPower = Math.floor(totalPower * critDamage);
    isCrit = true;
  }

  // 4. 방어력 적용 및 최종 대미지 (지수 공식)
  let defense = customDefense !== undefined ? customDefense : 0;
  if (customDefense === undefined) {
    const mineralDef = MINERALS.find((m) => m.key === targetTileType);
    defense = mineralDef ? mineralDef.defense : 0;
  }

  const netPower = Math.max(0, totalPower - defense);
  const exponent = 1.15;
  const finalDamage = Math.floor(Math.pow(netPower, exponent));

  return {
    finalDamage,
    totalPower,
    isCrit,
    attackInterval,
  };
};

/**
 * 드론의 채굴 대미지를 계산합니다.
 */
export const calculateDroneDamage = (dronePower: number, targetTileType: string): number => {
  const mineralDef = MINERALS.find((m) => m.key === targetTileType);
  const defense = mineralDef ? mineralDef.defense : 0;
  const netPower = Math.max(0, dronePower - defense);
  return Math.floor(Math.pow(netPower, 1.15));
};
