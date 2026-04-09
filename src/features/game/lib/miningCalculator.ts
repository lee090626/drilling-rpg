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
  
  // 1. 공격 속도 계산 (연구 속도 보너스 + 룬 속도 보너스)
  const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
  const attackInterval = currentDrill.cooldownMs * (1 - Math.min(0.9, researchBonuses.miningSpeed + runeSpeedBonus));

  // 2. 숙련도 배율 계산 (장비 대신 타일 타입 기반)
  const tileMastery = (stats.tileMastery && stats.tileMastery[targetTileType]) || createInitialMasteryState(targetTileType);
  const masteryMult = getMasteryMultiplier(tileMastery.level);
  
  // 3. 룬 보너스 및 치명타 계산
  const runeAttackBonus = getTotalRuneStat(stats, 'power');
  const critRate = getTotalRuneStat(stats, 'critRate');
  // 치명타 기본 피해량 1.5배 + 룬 추가 피해량
  const critDamage = 1.5 + getTotalRuneStat(stats, 'critDmg'); 

  const drillPower = currentDrill.basePower;
  const masteryBonus = Math.round(drillPower * (masteryMult - 1));
  
  let totalPower = stats.power + drillPower + masteryBonus + Math.floor(runeAttackBonus) + researchBonuses.power;
  
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
