import { SkillRune } from '../types/game';

/**
 * 룬(Rune) 시스템의 기반 명세를 정의합니다.
 * 여기에 정의된 값들은 레벨(Rare, Epic...)에 따라 runeUtils.ts의 배수가 적용되어 최종 성능이 결정됩니다.
 */
export const SKILL_RUNES: Record<string, SkillRune> = {
  'attack_rune': {
    id: 'attack_rune',
    name: 'Attack Rune',
    description: 'Increases Base Power',
    effectType: 'passive',
    rarity: 'Common',
    // 배수 연산용 베이스 수치
    powerBonus: 10 
  },
  'speed_rune': {
    id: 'speed_rune',
    name: 'Mining Speed Rune',
    description: 'Increases Mining Speed',
    effectType: 'passive',
    rarity: 'Common',
    // 베이스 수치 (0.05 = 5%)
    speedMult: 0.05 
  },
  'move_speed_rune': {
    id: 'move_speed_rune',
    name: 'Movement Speed Rune',
    description: 'Increases Movement Speed',
    effectType: 'passive',
    rarity: 'Common',
    // 베이스 수치 (0.05 = 5%)
    effectValue: 0.05 
  },
  'luck_rune': {
    id: 'luck_rune',
    name: 'Luck Rune',
    description: 'Increases Double Drop Chance',
    effectType: 'passive',
    rarity: 'Common',
    // 행운 확률 베이스 수치 (0.05 = 5%)
    effectValue: 0.05 
  },
  'crit_rate_rune': {
    id: 'crit_rate_rune',
    name: 'Crit Rate Rune',
    description: 'Increases Critical Hit Chance',
    effectType: 'passive',
    rarity: 'Common',
    // 치확 보너스 베이스 수치 (0.05 = 5%)
    effectChance: 0.05 
  },
  'crit_dmg_rune': {
    id: 'crit_dmg_rune',
    name: 'Crit DMG Rune',
    description: 'Increases Critical Hit Damage Multiplier',
    effectType: 'passive',
    rarity: 'Common',
    // 치피 보너스 추가 배수 베이스 수치 (0.2 = 20%)
    effectValue: 0.2 
  }
};
