import { SkillRune } from '../types/game';

/**
 * 룬(Rune) 시스템의 기반 명세를 정의합니다.
 */
export const SKILL_RUNES: Record<string, SkillRune> = {
  'attack_rune': {
    id: 'attack_rune',
    name: 'Attack Rune',
    description: 'Increases Base Power',
    effectType: 'passive',
    rarity: 'Common',
    powerBonus: 10,
    image: 'attack_rune'
  },
  'speed_rune': {
    id: 'speed_rune',
    name: 'Mining Speed Rune',
    description: 'Increases Mining Speed',
    effectType: 'passive',
    rarity: 'Common',
    speedMult: 0.05,
    image: 'speed_rune'
  },
  'move_speed_rune': {
    id: 'move_speed_rune',
    name: 'Movement Speed Rune',
    description: 'Increases Movement Speed',
    effectType: 'passive',
    rarity: 'Common',
    effectValue: 0.05,
    image: 'move_rune'
  },
  'luck_rune': {
    id: 'luck_rune',
    name: 'Luck Rune',
    description: 'Increases Double Drop Chance',
    effectType: 'passive',
    rarity: 'Common',
    effectValue: 0.05,
    image: 'luck_rune'
  },
  'crit_rate_rune': {
    id: 'crit_rate_rune',
    name: 'Acuity Rune',
    description: 'Sharpens perception to pierce weak points, increasing Critical Hit Chance',
    effectType: 'passive',
    rarity: 'Common',
    effectChance: 0.05,
    image: 'crit_rate_rune'
  },
  'crit_dmg_rune': {
    id: 'crit_dmg_rune',
    name: 'Severity Rune',
    description: 'Hones the blade\'s edge to cut deeper, increasing Critical Hit Damage',
    effectType: 'passive',
    rarity: 'Common',
    effectValue: 0.2,
    image: 'crit_dmg_rune'
  }
};
