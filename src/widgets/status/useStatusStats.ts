import { useMemo } from 'react';
import { PlayerStats, Equipment } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import {
  getMasteryMultiplier,
  createInitialEquipmentState,
  getMasteryBonuses,
} from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { calculateArtifactBonuses } from '@/shared/lib/artifactUtils';

export interface StatBreakdownItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface StatusStatsResult {
  // Equipment
  equipped: {
    drill: Equipment | null;
    helmet: Equipment | null;
    armor: Equipment | null;
    boots: Equipment | null;
  };
  
  // Final computed stats
  finalPower: number;
  finalDefense: number;
  finalMaxHp: number;
  finalCritRate: number;
  finalCritDmg: number;
  finalMiningInterval: number;
  finalMoveSpeedMult: number;
  finalLuck: number;

  // Rune bonuses (for display)
  runePowerBonus: number;
  runeSpeedBonus: number;
  runeCritRate: number;
  runeCritDmg: number;
  runeLuck: number;
  runeMoveSpeed: number;

  // Breakdowns for tooltip
  statBreakdowns: Record<string, StatBreakdownItem[]>;
}

/**
 * StatusWindow에서 사용하는 모든 스탯 계산 로직을 캡슐화한 Custom Hook.
 */
export function useStatusStats(stats: PlayerStats): StatusStatsResult {
  return useMemo(() => {
    // 1. 장착 장비 로드
    const equipped = {
      drill: stats.equipment.drillId ? EQUIPMENTS[stats.equipment.drillId] : null,
      helmet: stats.equipment.helmetId ? EQUIPMENTS[stats.equipment.helmetId] : null,
      armor: stats.equipment.armorId ? EQUIPMENTS[stats.equipment.armorId] : null,
      boots: stats.equipment.bootsId ? EQUIPMENTS[stats.equipment.bootsId] : null,
    };

    // 2. 드릴 숙련도 보너스 (훈련된 위력)
    const drillMastery = equipped.drill 
      ? (stats.equipmentStates[equipped.drill.id] || createInitialEquipmentState(equipped.drill.id))
      : null;
    const masteryMult = drillMastery ? getMasteryMultiplier(drillMastery.level) : 1;
    const drillBasePower = equipped.drill?.stats.power || 0;
    const levelMasteryBonus = Math.round(drillBasePower * (masteryMult - 1));

    // 3. 통합 보너스 수합
    const artifactBonuses = calculateArtifactBonuses(stats);
    const masteryBonuses = getMasteryBonuses(stats);
    const runePowerBonus = Math.floor(getTotalRuneStat(stats, 'power'));
    const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
    const runeCritRate = getTotalRuneStat(stats, 'critRate');
    const runeCritDmg = getTotalRuneStat(stats, 'critDmg');
    const runeLuck = getTotalRuneStat(stats, 'luck');
    const runeMoveSpeed = getTotalRuneStat(stats, 'moveSpeed');

    // 4. 최종 스탯 도출 (엔진 동기화 수치와 일치 시킴)
    const finalPower = stats.power + levelMasteryBonus + (artifactBonuses?.power || 0) + runePowerBonus;
    const finalDefense = (stats.defense || 0);
    const finalMaxHp = stats.maxHp;
    const finalLuck = (stats.luck || 0) + Math.floor(runeLuck * 100);

    const finalCritRate = runeCritRate + (artifactBonuses.critRate || 0) + (stats.luck || 0) * 0.01;
    const finalCritDmg = 1.5 + runeCritDmg + (artifactBonuses.critDamage || 0);
    
    // 공격 속도: 기본 500ms 기준
    const totalSpeedBonusMult = Math.min(
      0.95,
      (artifactBonuses.miningSpeed || 0) + runeSpeedBonus + masteryBonuses.miningSpeedMult,
    );
    const finalMiningInterval = Math.round(500 * (1 - totalSpeedBonusMult));

    // 이동 속도 배율
    const finalMoveSpeedMult = stats.moveSpeed / 100;

    // 5. Stat Breakdown Definitions
    const statBreakdowns: Record<string, StatBreakdownItem[]> = {
      power: [
        { label: 'Base Hero Power', value: 20 },
        { label: `Drill (${equipped.drill?.name || 'Hand'})`, value: drillBasePower },
        { label: 'Drill Mastery', value: `+${levelMasteryBonus}`, color: 'text-emerald-400' },
        { label: 'Mastery Perks', value: `+${masteryBonuses.miningPower}`, color: 'text-emerald-500' },
        { label: 'Skill Rune', value: `+${runePowerBonus}`, color: 'text-purple-400' },
        { label: 'Artifact', value: `+${artifactBonuses?.power || 0}`, color: 'text-orange-400' },
      ],
      defense: [
        { label: 'Helmet DEF', value: equipped.helmet?.stats.defense || 0 },
        { label: 'Boots Sub-DEF', value: equipped.boots?.stats.defense || 0 },
        { label: 'Artifact', value: artifactBonuses?.defense || 0, color: 'text-orange-400' },
      ],
      hp: [
        { label: 'Base Energy', value: 200 },
        { label: 'Armor HP', value: `+${equipped.armor?.stats.maxHp || 0}` },
        { label: 'Boots Sub-HP', value: `+${equipped.boots?.stats.maxHp || 0}` },
        { label: 'Mastery Perks', value: `+${masteryBonuses.maxHp}`, color: 'text-emerald-500' },
        { label: 'Artifact', value: `+${artifactBonuses.maxHp || 0}`, color: 'text-orange-400' },
        { label: 'HP Multiplier', value: `x${(1 + masteryBonuses.maxHpMult).toFixed(2)}`, color: 'text-blue-400' },
      ],
      miningSpeed: [
        { label: 'System Baseline', value: '500ms' },
        { label: 'Mastery Speed', value: `-${(masteryBonuses.miningSpeedMult * 100).toFixed(0)}%`, color: 'text-emerald-500' },
        { label: 'Rune Reduction', value: `-${(runeSpeedBonus * 100).toFixed(0)}%`, color: 'text-purple-400' },
        { label: 'Artifact', value: `-${((artifactBonuses.miningSpeed || 0) * 100).toFixed(0)}%`, color: 'text-orange-400' },
      ],
      moveSpeed: [
        { label: 'Base Speed', value: '100%' },
        { label: 'Boots Additive', value: `+${equipped.boots?.stats.moveSpeed || 0}%`, color: 'text-amber-400' },
        { label: 'Mastery Multiplier', value: `x${(1 + masteryBonuses.moveSpeedMult).toFixed(2)}`, color: 'text-blue-400' },
        { label: 'Artifact', value: `+${(artifactBonuses.moveSpeed || 0).toFixed(0)}%`, color: 'text-orange-400' },
      ],
    };

    return {
      equipped,
      finalPower,
      finalDefense,
      finalMaxHp,
      finalCritRate,
      finalCritDmg,
      finalMiningInterval,
      finalMoveSpeedMult,
      finalLuck,
      runePowerBonus,
      runeSpeedBonus,
      runeCritRate,
      runeCritDmg,
      runeLuck,
      runeMoveSpeed,
      statBreakdowns,
    };
  }, [stats]);
}
