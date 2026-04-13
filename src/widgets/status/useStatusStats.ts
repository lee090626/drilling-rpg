import { useMemo } from 'react';
import { PlayerStats } from '@/shared/types/game';
import { DRILLS } from '@/shared/config/drillData';
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
  equippedDrill: (typeof DRILLS)[string];
  equipmentState: ReturnType<typeof createInitialEquipmentState>;
  levelMasteryBonus: number;

  // Final computed stats
  finalPower: number;
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
 * 순수 계산이므로 useMemo로 최적화합니다.
 */
export function useStatusStats(stats: PlayerStats): StatusStatsResult {
  return useMemo(() => {
    const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
    const equipmentState =
      stats.equipmentStates[stats.equippedDrillId] ||
      createInitialEquipmentState(stats.equippedDrillId);
    const masteryMult = getMasteryMultiplier(equipmentState.level);

    // Unified Stat Calculations
    const artifactBonuses = calculateArtifactBonuses(stats);
    const masteryBonuses = getMasteryBonuses(stats);
    const runePowerBonus = Math.floor(getTotalRuneStat(stats, 'power'));
    const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
    const runeCritRate = getTotalRuneStat(stats, 'critRate');
    const runeCritDmg = getTotalRuneStat(stats, 'critDmg');
    const runeLuck = getTotalRuneStat(stats, 'luck');
    const runeMoveSpeed = getTotalRuneStat(stats, 'moveSpeed');

    const baseAttack = equippedDrill.basePower;
    const levelMasteryBonus = Math.round(baseAttack * (masteryMult - 1));

    // POWER Calculation
    const basePower =
      stats.power + baseAttack + levelMasteryBonus + masteryBonuses.miningPower + runePowerBonus;
    const powerMult = 1 + masteryBonuses.miningPowerMult;
    const finalPower = Math.floor(basePower * powerMult);

    // CRIT/SPEED
    const finalCritRate = runeCritRate + (artifactBonuses.critRate || 0);
    const finalCritDmg = 1.5 + runeCritDmg + (artifactBonuses.critDamage || 0);
    const totalSpeedBonusMult = Math.min(
      0.9,
      (artifactBonuses.miningSpeed || 0) + runeSpeedBonus + masteryBonuses.miningSpeedMult,
    );
    const finalMiningInterval = Math.round(equippedDrill.cooldownMs * (1 - totalSpeedBonusMult));

    // MOVE SPEED
    const baseSpeedStat = stats.moveSpeed || 100;
    const artifactSpeedBonus = artifactBonuses.moveSpeed || 0;
    const baseSpeedMult =
      ((baseSpeedStat + artifactSpeedBonus) / 100) * (1 + masteryBonuses.moveSpeedMult);
    const drillSpeedMult = equippedDrill.moveSpeedMult || 1;
    const finalMoveSpeedMult =
      baseSpeedMult * drillSpeedMult + (runeMoveSpeed + masteryBonuses.moveSpeed) * 0.01 || 1;

    // LUCK
    const finalLuck = Math.floor(runeLuck * 100 + masteryBonuses.luck + artifactBonuses.luck * 100);

    // Stat Breakdown Definitions
    const statBreakdowns: Record<string, StatBreakdownItem[]> = {
      power: [
        { label: 'Base Stats', value: stats.power },
        { label: `Drill (${equippedDrill.name})`, value: baseAttack },
        { label: 'Drill Mastery', value: `+${levelMasteryBonus}`, color: 'text-emerald-400' },
        {
          label: 'Mastery Perks',
          value: `+${masteryBonuses.miningPower}`,
          color: 'text-emerald-500',
        },
        { label: 'Skill Rune', value: `+${runePowerBonus}`, color: 'text-purple-400' },
        { label: 'Power Multiplier', value: `x${powerMult.toFixed(2)}`, color: 'text-blue-400' },
      ],
      hp: [
        { label: 'Base Health', value: 100 },
        { label: 'Mastery Perks', value: `+${masteryBonuses.maxHp}`, color: 'text-emerald-500' },
        { label: 'Artifact', value: `+${artifactBonuses.maxHp || 0}`, color: 'text-orange-400' },
        {
          label: 'HP Multiplier',
          value: `x${(1 + masteryBonuses.maxHpMult).toFixed(2)}`,
          color: 'text-blue-400',
        },
      ],
      critRate: [
        { label: 'Base Crit Rate', value: '0.0%' },
        {
          label: 'Rune Bonus',
          value: `+${(runeCritRate * 100).toFixed(1)}%`,
          color: 'text-purple-400',
        },
        {
          label: 'Artifact',
          value: `+${((artifactBonuses.critRate || 0) * 100).toFixed(1)}%`,
          color: 'text-orange-400',
        },
      ],
      moveSpeed: [
        { label: 'Base Speed', value: '100%' },
        {
          label: 'Drill Multiplier',
          value: `x${(equippedDrill.moveSpeedMult || 1.0).toFixed(2)}`,
          color: 'text-zinc-400',
        },
        {
          label: 'Mastery Perks',
          value: `+${masteryBonuses.moveSpeed}%`,
          color: 'text-emerald-500',
        },
        {
          label: 'Artifact',
          value: `+${artifactSpeedBonus.toFixed(0)}%`,
          color: 'text-orange-400',
        },
        { label: 'Rune Bonus', value: `+${runeMoveSpeed}%`, color: 'text-purple-400' },
      ],
      critDmg: [
        { label: 'Base Damage', value: '150%' },
        {
          label: 'Rune Bonus',
          value: `+${(runeCritDmg * 100).toFixed(0)}%`,
          color: 'text-purple-400',
        },
        {
          label: 'Artifact',
          value: `+${((artifactBonuses.critDamage || 0) * 100).toFixed(0)}%`,
          color: 'text-orange-400',
        },
      ],
      miningSpeed: [
        { label: 'Drill Base', value: `${equippedDrill.cooldownMs}ms` },
        {
          label: 'Mastery Perks',
          value: `-${(masteryBonuses.miningSpeedMult * 100).toFixed(0)}%`,
          color: 'text-emerald-500',
        },
        {
          label: 'Rune Reduction',
          value: `-${(runeSpeedBonus * 100).toFixed(0)}%`,
          color: 'text-purple-400',
        },
        {
          label: 'Artifact',
          value: `-${((artifactBonuses.miningSpeed || 0) * 100).toFixed(0)}%`,
          color: 'text-orange-400',
        },
      ],
      luck: [
        { label: 'Base Luck', value: '+0' },
        {
          label: 'Mastery Perks',
          value: `+${masteryBonuses.luck.toFixed(0)}`,
          color: 'text-emerald-500',
        },
        { label: 'Rune Bonus', value: `+${(runeLuck * 100).toFixed(0)}`, color: 'text-purple-400' },
        {
          label: 'Artifact',
          value: `+${(artifactBonuses.luck * 100).toFixed(0)}`,
          color: 'text-orange-400',
        },
      ],
    };

    return {
      equippedDrill,
      equipmentState,
      levelMasteryBonus,
      finalPower,
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
