import { Drill, MasteryState } from '../types/game';
import { DRILLS } from '../config/drillData';

/**
 * 숙련도 레벨에 따른 다음 레벨 필요 경험치 계산
 */
export const getNextLevelExp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

/**
 * 숙련도 레벨에 따른 스탯 멀티플라이어 계산 (레벨당 1%씩 강해짐)
 */
export const getMasteryMultiplier = (level: number): number => {
  return 1 + (level - 1) * 0.02;
};

/**
 * 현재 숙련도 레벨에서 사용 가능한 스킬젬 슬롯 수 계산
 * 기본 0개이며, 특정 레벨마다 하나씩 해금되는 로직 (예: 1, 5, 10...)
 */
export const getUnlockedSlotCount = (level: number, maxSlots: number = 0): number => {
  if (maxSlots <= 0) return 0;
  
  // 예시: 1레벨(1개), 5레벨(2개), 10레벨(3개) ...
  let unlocked = 0;
  if (level >= 1) unlocked = 1;
  if (level >= 5) unlocked = 2;
  if (level >= 10) unlocked = 3;
  
  return Math.min(unlocked, maxSlots);
};

/**
 * 특정 장비나 타일의 초기 숙련도 상태 생성
 */
export const createInitialMasteryState = (id: string, maxSlots: number = 0): MasteryState => {
  return {
    id,
    exp: 0,
    level: 1,
    slottedRunes: maxSlots > 0 ? new Array(maxSlots).fill(null) : undefined,
  };
};

/**
 * 특정 장비의 초기 상태 생성 (기존 호환성 유지를 위해 래핑)
 */
export const createInitialEquipmentState = (drillId: string): MasteryState => {
  const drill = DRILLS[drillId];
  const maxSlots = drill?.maxSkillSlots || 0;
  return createInitialMasteryState(drillId, maxSlots);
};
