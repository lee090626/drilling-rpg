import { PlayerStats } from '@/shared/types/game';
import { hasArtifactEffect } from '@/shared/lib/artifactUtils';

// ============================================================
// 상수 정의
// ============================================================

/**
 * 몬스터 희귀도(Rarity) 등급별 보상 배율 상수입니다.
 * 기존 combatSystem.ts의 switch(rarity) 블록을 데이터로 전환합니다.
 *
 * @example
 * const mult = RARITY_MULTIPLIERS[monsterDef.rarity ?? 'Common']; // → 1, 2, 3 ...
 */
export const RARITY_MULTIPLIERS: Record<string, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 5,
  Radiant: 7,
  Legendary: 10,
  Mythic: 15,
  Ancient: 20,
};

// ============================================================
// 타입 정의
// ============================================================

/**
 * 모디파이어가 발동되는 전투 시점(Hook)을 나타냅니다.
 * - onKill: 처치 시 (보상, 흡혈, 경험치 등)
 * - preDamage: 피해 계산 전 (방어력 무시, 취약 등)
 * - postDamage: 피해 계산 후 (반사 대미지 등)
 */
export type ModifierHook = 'onKill' | 'preDamage' | 'postDamage';

/**
 * 모디파이어가 영향을 주는 스탯 카테고리입니다.
 * - exp: 경험치
 * - gold: 골드
 * - loot: 드롭 아이템 배율
 * - damage: 플레이어 → 몬스터 공격력
 * - incomingDamage: 몬스터 → 플레이어 피해량
 */
export type ModifierStat = 'exp' | 'gold' | 'loot' | 'damage' | 'incomingDamage';

/**
 * 모디파이어 적용 함수에 전달되는 컨텍스트 객체입니다.
 * 순수 값 변환 외에 부수 효과(힐, 텍스트 출력 등)가 필요한 경우를 위해
 * `sideEffect` 콜백을 선택적으로 제공합니다.
 */
export interface ModifierContext {
  /** 현재 플레이어 스탯 */
  playerStats: PlayerStats;
  /**
   * 이 모디파이어가 부수 효과를 트리거해야 할 때 호출하는 콜백.
   * 힐/파티클/텍스트 등 렌더링 관련 로직을 모디파이어 내부에서 직접 실행하지 않고,
   * 호출부(combatSystem)에 위임하기 위한 탈출구입니다.
   */
  sideEffect?: (type: string, payload: unknown) => void;
}

/**
 * 단일 유물 효과(Artifact Effect) 기반 모디파이어 정의입니다.
 * `ModifierManager`의 내부 레지스트리에 등록됩니다.
 */
interface ArtifactModifierDef {
  /** 이 모디파이어가 발동되는 유물 effectId (artifactUtils.hasArtifactEffect 키와 동일) */
  effectId: string;
  /** 발동 시점 */
  hook: ModifierHook;
  /** 영향 대상 스탯 */
  stat: ModifierStat;
  /**
   * 실제 값 변환 함수.
   * `baseValue`를 입력받아 수정된 값을 반환합니다.
   * 부수 효과가 있을 경우 `ctx.sideEffect`를 호출합니다.
   *
   * @param baseValue - 변환 대상 원본 값
   * @param ctx - 플레이어 스탯 및 부수 효과 콜백 컨텍스트
   * @returns 변환된 최종 값
   */
  transform: (baseValue: number, ctx: ModifierContext) => number;
}

// ============================================================
// 유물 모디파이어 레지스트리
// ============================================================

/**
 * 게임 내 모든 유물 특수 효과(effectId)의 전투 모디파이어 정의 목록입니다.
 * 새 유물 효과를 추가할 때 이 배열에만 항목을 추가하면 됩니다.
 * combatSystem.ts를 수정할 필요가 없습니다.
 */
const ARTIFACT_MODIFIER_REGISTRY: ArtifactModifierDef[] = [
  // ─── onKill ───────────────────────────────────────────────

  /**
   * [아스모데우스의 반지] EXP_BOOST
   * 처치 시 획득 경험치 30% 증가
   */
  {
    effectId: 'EXP_BOOST',
    hook: 'onKill',
    stat: 'exp',
    transform: (base) => Math.floor(base * 1.3),
  },

  /**
   * [아바돈의 부러진 칼날] LOOT_QUANTITY_BOOST
   * 처치 시 드롭 아이템 획득량 25% 증가
   */
  {
    effectId: 'LOOT_QUANTITY_BOOST',
    hook: 'onKill',
    stat: 'loot',
    transform: (base) => base * 1.25,
  },

  /**
   * [벨제붑의 독니] LIFE_STEAL_PERCENT
   * 처치 시 최대 체력의 5%를 회복합니다.
   * 부수 효과(힐 텍스트)는 combatSystem에서 sideEffect 콜백으로 처리합니다.
   */
  {
    effectId: 'LIFE_STEAL_PERCENT',
    hook: 'onKill',
    stat: 'incomingDamage', // 직접 값 변환 없음, sideEffect만 발동
    transform: (base, ctx) => {
      const healAmount = Math.floor(ctx.playerStats.maxHp * 0.05);
      ctx.sideEffect?.('HEAL', healAmount);
      return base; // 피해량 값은 변경 없음
    },
  },
];

// ============================================================
// ModifierManager 클래스
// ============================================================

/**
 * 전투 시스템의 수치 변환(Modifier) 로직을 중앙 집중 관리하는 매니저입니다.
 *
 * 책임:
 * 1. 희귀도별 보상 배율 계산 (`getRarityMultiplier`)
 * 2. 특정 Hook + Stat 조합에 해당하는 유물 모디파이어를 순차 적용 (`applyAll`)
 * 3. 처치 시 발동하는 모든 부수 효과 실행 (`triggerOnKillSideEffects`)
 *
 * 사용 예:
 * ```ts
 * const mult = modifierManager.getRarityMultiplier(monsterDef.rarity, isBoss);
 * const finalExp = modifierManager.applyAll('onKill', 'exp', baseExp, { playerStats });
 * modifierManager.triggerOnKillSideEffects({ playerStats, sideEffect });
 * ```
 */
class ModifierManager {
  /**
   * 몬스터 희귀도와 보스 여부를 고려한 최종 보상 배율을 반환합니다.
   * 기존 `switch(rarity)` 블록을 대체합니다.
   *
   * @param rarity - 몬스터 희귀도 문자열 (예: 'Rare', 'Legendary')
   * @param isBoss - 보스 여부 (보스는 추가로 x5 배율 적용)
   * @returns 최종 배율 (1 이상의 정수)
   */
  public getRarityMultiplier(rarity?: string, isBoss: boolean = false): number {
    const base = RARITY_MULTIPLIERS[rarity ?? ''] ?? 1;
    return isBoss ? base * 5 : base;
  }

  /**
   * 특정 Hook + Stat 조합에 해당하는 모든 활성 유물 모디파이어를 순차 적용합니다.
   * 각 모디파이어는 이전 모디파이어의 출력값을 입력으로 받습니다(체인 구조).
   *
   * @param hook - 모디파이어 발동 시점
   * @param stat - 변환 대상 스탯
   * @param baseValue - 원본 수치
   * @param ctx - 플레이어 스탯 및 부수 효과 콜백
   * @returns 모든 모디파이어가 적용된 최종 수치
   */
  public applyAll(
    hook: ModifierHook,
    stat: ModifierStat,
    baseValue: number,
    ctx: ModifierContext,
  ): number {
    let value = baseValue;

    for (const mod of ARTIFACT_MODIFIER_REGISTRY) {
      if (mod.hook !== hook || mod.stat !== stat) continue;
      if (!hasArtifactEffect(ctx.playerStats, mod.effectId)) continue;

      value = mod.transform(value, ctx);
    }

    return value;
  }

  /**
   * 처치(onKill) 시점에 발동되는 모든 부수 효과 유물을 실행합니다.
   * 순수 값 변환이 아닌 힐, 텍스트 출력 등의 사이드 이펙트 전용 모디파이어를 처리합니다.
   *
   * @param ctx - 플레이어 스탯 및 부수 효과 콜백
   */
  public triggerOnKillSideEffects(ctx: ModifierContext): void {
    for (const mod of ARTIFACT_MODIFIER_REGISTRY) {
      if (mod.hook !== 'onKill') continue;
      if (!hasArtifactEffect(ctx.playerStats, mod.effectId)) continue;

      // transform을 호출하되 반환값은 무시 (부수 효과만 발동)
      mod.transform(0, ctx);
    }
  }
}

/**
 * 싱글톤 ModifierManager 인스턴스입니다.
 * Worker 전역에서 공유하여 사용합니다.
 *
 * @example
 * import { modifierManager } from '@/features/game/lib/ModifierManager';
 */
export const modifierManager = new ModifierManager();
