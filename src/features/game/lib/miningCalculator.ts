import { PlayerStats } from '@/shared/types/game';
import { DRILLS } from '@/shared/config/drillData';
import { MINERALS } from '@/shared/config/mineralData';
import { getMasteryMultiplier, createInitialMasteryState } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { getResearchBonuses } from '@/shared/lib/researchUtils';

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
export const calculateMiningDamage = (stats: PlayerStats, targetTileType: string): DamageResult => {
  const currentDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
  const researchBonuses = getResearchBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);
  
  // 1. 공격 속도 계산 (연구 속도 보너스 + 룬 속도 보너스 + 마스터리 속도 보너스)
  const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
  const totalSpeedBonusMult = Math.min(0.95, researchBonuses.miningSpeed + runeSpeedBonus + masteryBonuses.miningSpeedMult);
  const attackInterval = currentDrill.cooldownMs * (1 - totalSpeedBonusMult);

  // 2. 숙련도 배율 계산 (기본 숙련도 레벨 보너스)
  const tileMastery = (stats.tileMastery && stats.tileMastery[targetTileType]) || createInitialMasteryState(targetTileType);
  const masteryMult = getMasteryMultiplier(tileMastery.level);
  
  // 3. 룬 보너스 및 치명타 계산
  const runeAttackBonus = getTotalRuneStat(stats, 'power');
  const critRate = getTotalRuneStat(stats, 'critRate');
  // 치명타 기본 피해량 1.5배 + 룬 추가 피해량
  const critDamage = 1.5 + getTotalRuneStat(stats, 'critDmg'); 

  const drillPower = currentDrill.basePower;
  const levelMasteryBonus = Math.round(drillPower * (masteryMult - 1));
  
  // --- 최종 위력 계산 (고정값 합산 후 배율 적용) ---
  // 기초값 = 플레이어 기본 + 드릴 + 숙련도 레벨 보너스 + 마스터리 고정 특성 + 룬 고정 특성
  const basePower = stats.power + drillPower + levelMasteryBonus + masteryBonuses.miningPower + Math.floor(runeAttackBonus);
  
  // 배율 보완 (연구 배율 + 마스터리 배율)
  const totalPowerMult = 1 + researchBonuses.power + masteryBonuses.miningPowerMult;
  
  let totalPower = Math.floor(basePower * totalPowerMult);
  
  // 상태 이상에 따른 위력 변조 (BUFF_POWER: 1.5배, WEAKEN: 0.7배)
  if (stats.activeEffects) {
    if (stats.activeEffects.some(e => e.type === 'BUFF_POWER')) totalPower = Math.floor(totalPower * 1.5);
    if (stats.activeEffects.some(e => e.type === 'WEAKEN')) totalPower = Math.floor(totalPower * 0.7);
  }
  
  let isCrit = false;
  if (Math.random() < critRate) {
    totalPower = Math.floor(totalPower * critDamage);
    isCrit = true;
  }

  // 4. 방어력 적용 및 최종 대미지 (지수 공식)
  const mineralDef = MINERALS.find(m => m.key === targetTileType);
  const defense = mineralDef ? mineralDef.defense : 0;
  
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
  const mineralDef = MINERALS.find(m => m.key === targetTileType);
  const defense = mineralDef ? mineralDef.defense : 0;
  const netPower = Math.max(0, dronePower - defense);
  return Math.floor(Math.pow(netPower, 1.15));
};
