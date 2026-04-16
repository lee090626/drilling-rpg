import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import {
  BossPattern,
  BossPatternType,
  MONSTER_LIST,
  MonsterDefinition,
} from '@/shared/config/monsterData';
import { EntityManager } from '@/features/game/lib/EntityManager';

// ============================================================
// 내부 타입 정의
// ============================================================

/**
 * 패턴 핸들러가 보스 컨텍스트를 통해 받는 인자 묶음입니다.
 * 각 핸들러 함수는 이 인자를 분해하여 패턴 로직을 수행합니다.
 */
interface PatternContext {
  /** 현재 월드 상태 */
  world: GameWorld;
  /** ECS 엔티티 매니저 */
  entities: EntityManager;
  /** 보스 엔티티 배열 인덱스 */
  bossIdx: number;
  /** 현재 보스 HP에 따라 결정된 페이즈 번호 (1-based) */
  phase: number;
  /** 보스 스프라이트 중앙 X 좌표 (픽셀) */
  bx: number;
  /** 보스 스프라이트 중앙 Y 좌표 (픽셀) */
  by: number;
  /** 플레이어 중앙 X 좌표 (픽셀) */
  px: number;
  /** 플레이어 중앙 Y 좌표 (픽셀) */
  py: number;
  /** 현재 타임스탬프 (ms) */
  now: number;
  /** 발동 중인 BossPattern 데이터 */
  pattern: BossPattern;
}

/**
 * 패턴 핸들러 함수 타입.
 * - true를 반환하면 해당 패턴의 실제 공격이 이번 틱에 발동됨을 의미합니다.
 * - false를 반환하면 아직 전조 표시만 하거나 쿨타임 중임을 의미합니다.
 */
type PatternHandler = (ctx: PatternContext) => boolean;

// ============================================================
// 전역 타이머 맵 (instanceId 기반)
// ============================================================

/**
 * 각 보스 인스턴스(instanceId)별 패턴 인덱스별 마지막 발동 시간을 저장합니다.
 * 키 형식: `{instanceId}:{patternIndex}`
 */
const patternTimers = new Map<string, number>();

// ============================================================
// 패턴 핸들러 구현
// ============================================================

/**
 * [shot 패턴] 플레이어 방향으로 n발의 투사체를 부채꼴로 발사합니다.
 * phaseOverrides 배열에 따라 페이즈별 투사체 수/속도/공격력이 결정됩니다.
 *
 * @param ctx - 패턴 실행 컨텍스트
 * @returns 공격이 실제로 발동되었으면 true
 */
const handleShot: PatternHandler = (ctx) => {
  const { entities, bossIdx, phase, bx, by, px, py, now, pattern } = ctx;
  const { soa } = entities;

  // 현재 페이즈에 맞는 오버라이드 값 산출 (없으면 기본값 사용)
  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 1;
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 5;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 10;
  const size = pattern.projectileSize ?? 128;

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 0) return false;

  const baseVx = (dx / dist) * speed;
  const baseVy = (dy / dist) * speed;

  for (let j = 0; j < count; j++) {
    // 발사 수가 1개이면 부채꼴 없이 정직선 발사
    const offset = count > 1 ? (j - (count - 1) / 2) * 0.2 : 0;
    const cos = Math.cos(offset);
    const sin = Math.sin(offset);
    const finalVx = baseVx * cos - baseVy * sin;
    const finalVy = baseVx * sin + baseVy * cos;

    const pIdx = entities.create(5, bx, by);
    if (pIdx !== -1) {
      const idx = entities.getIndex(pIdx);
      soa.vx[idx] = finalVx;
      soa.vy[idx] = finalVy;
      soa.attack[idx] = power;
      soa.createdAt[idx] = now;
      soa.lastAttackTime[idx] = 0;
      soa.width[idx] = size;
      soa.height[idx] = size;
    }
  }
  return true;
};

/**
 * [cross 패턴] 상하좌우 4방향으로 동시에 투사체를 발사합니다.
 * phaseOverrides 배열에 따라 페이즈별 속도/공격력이 결정됩니다.
 *
 * @param ctx - 패턴 실행 컨텍스트
 * @returns 공격이 실제로 발동되었으면 true
 */
const handleCross: PatternHandler = (ctx) => {
  const { entities, bossIdx, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 7;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 15;
  const size = pattern.projectileSize ?? 128;

  const directions = [
    { vx: 0,      vy: -speed }, // 상 (North)
    { vx: 0,      vy:  speed }, // 하 (South)
    { vx: -speed, vy: 0      }, // 좌 (West)
    { vx:  speed, vy: 0      }, // 우 (East)
  ];

  for (const dir of directions) {
    const pIdx = entities.create(5, bx, by);
    if (pIdx !== -1) {
      const idx = entities.getIndex(pIdx);
      soa.vx[idx] = dir.vx;
      soa.vy[idx] = dir.vy;
      soa.attack[idx] = power;
      soa.createdAt[idx] = now;
      soa.lastAttackTime[idx] = 0;
      soa.width[idx] = size;
      soa.height[idx] = size;
    }
  }
  return true;
};

/**
 * [lure 패턴] 일정 주기로 플레이어에게 CONFUSION(혼란) 상태 이상을 부여합니다.
 * lureCycle 주기 안에서 lureDuration 동안 지속되는 사이클 형태로 동작합니다.
 *
 * @param ctx - 패턴 실행 컨텍스트
 * @returns 혼란 효과가 이번 틱에 새로 부여되었으면 true
 */
const handleLure: PatternHandler = (ctx) => {
  const { world, now, pattern } = ctx;
  const { player } = world;

  const lureDuration = pattern.lureDuration ?? 2000;
  const lureCycle = pattern.lureCycle ?? 5000;
  const cycleTime = now % lureCycle;

  if (cycleTime < lureDuration) {
    // 아직 혼란 효과가 없는 경우에만 새로 부여
    const alreadyConfused = player.stats.activeEffects?.some(
      (e) => e.type === 'CONFUSION',
    );
    if (!alreadyConfused) {
      if (!player.stats.activeEffects) player.stats.activeEffects = [];
      player.stats.activeEffects.push({
        type: 'CONFUSION',
        startTime: now,
        endTime: now + lureDuration,
      });
      return true;
    }
  }
  return false;
};

// ============================================================
// 패턴 레지스트리 (Pattern Registry)
// ============================================================

/**
 * BossPatternType → 핸들러 함수 매핑 레지스트리.
 * 새 패턴 타입을 추가할 때 이 맵에만 핸들러를 등록하면
 * bossBehaviorSystem 본체를 수정하지 않아도 됩니다.
 */
const patternRegistry: Map<BossPatternType, PatternHandler> = new Map([
  ['shot', handleShot],
  ['cross', handleCross],
  ['lure', handleLure],
]);

// ============================================================
// 메인 시스템 함수
// ============================================================

/**
 * [ECS] 보스 AI 및 패턴 제어 시스템 (Data-Driven 리팩토링)
 *
 * 동작 원리:
 * 1. SOA에서 type=2(보스) 엔티티를 탐색합니다.
 * 2. 보스의 monsterDefIndex로 `MONSTERS` 데이터를 조회합니다.
 * 3. 보스 데이터의 `phases` 배열로 현재 HP %에 따라 페이즈를 결정합니다.
 * 4. `patterns` 배열을 순회하며 `minPhase`, 개별 쿨타임을 체크합니다.
 * 5. 발동 조건이 충족되면 `patternRegistry`에서 핸들러를 꺼내 실행합니다.
 *
 * @param world - 현재 게임 월드 상태
 * @param deltaTime - 이전 프레임과의 시간 차 (ms)
 * @param now - 현재 타임스탬프 (ms)
 */
export const bossBehaviorSystem = (world: GameWorld, deltaTime: number, now: number) => {
  const { entities, player } = world;
  const { soa } = entities;

  // --- 1. 보스 엔티티 탐색 (type === 2) ---
  let bossIdx = -1;
  for (let i = 0; i < soa.count; i++) {
    if (soa.type[i] === 2) {
      bossIdx = i;
      break;
    }
  }

  // 보스가 없으면 전투 상태 해제 후 조기 종료
  if (bossIdx === -1) {
    if (world.bossCombatStatus.active) {
      world.bossCombatStatus.active = false;
      world.environmentalForce = { vx: 0, vy: 0 };
    }
    return;
  }

  // --- 2. 보스 고정 처리 (stationary 보스 속도 강제 리셋) ---
  soa.vx[bossIdx] = 0;
  soa.vy[bossIdx] = 0;

  // --- 3. 좌표 계산 ---
  const bx = soa.x[bossIdx] + (soa.width[bossIdx] || TILE_SIZE * 5) / 2;
  const by = soa.y[bossIdx] + (soa.height[bossIdx] || TILE_SIZE * 5) / 2;
  const px = player.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const py = player.pos.y * TILE_SIZE + TILE_SIZE / 2;

  // 플레이어가 너무 멀어지면 전투 해제 (약 20타일)
  const distToPlayer = Math.sqrt(Math.pow(bx - px, 2) + Math.pow(by - py, 2));
  if (distToPlayer > TILE_SIZE * 20) {
    if (world.bossCombatStatus.active) {
      world.bossCombatStatus.active = false;
      world.environmentalForce = { vx: 0, vy: 0 };
    }
    return;
  }

  // --- 4. 데이터 조회: MONSTER_LIST 배열에서 인덱스로 보스 정의를 가져옴 ---
  const defIndex = soa.monsterDefIndex[bossIdx];
  const bossDef: MonsterDefinition | undefined = MONSTER_LIST[defIndex];

  // 데이터가 없으면 안전하게 조기 종료
  if (!bossDef) return;

  // --- 5. 페이즈 결정 ---
  const hpPercent = (soa.hp[bossIdx] / soa.maxHp[bossIdx]) * 100;
  let phase = 1;

  if (bossDef.phases && bossDef.phases.length > 0) {
    // 데이터 기반 페이즈: hpThreshold 역순(낮은 HP 먼저)으로 순회하여 현재 페이즈 결정
    const sortedPhases = [...bossDef.phases].sort(
      (a, b) => a.hpThreshold - b.hpThreshold,
    );
    for (const phaseConfig of sortedPhases) {
      if (hpPercent <= phaseConfig.hpThreshold) {
        phase = phaseConfig.phase;
      }
    }
  } else {
    // 폴백: 레거시 하드코딩 페이즈 로직
    if (hpPercent <= 40) phase = 3;
    else if (hpPercent <= 70) phase = 2;
  }

  // --- 6. bossCombatStatus UI 동기화 ---
  world.bossCombatStatus = {
    active: true,
    id: bossDef.id,
    name: bossDef.nameKo ?? bossDef.name,
    hp: soa.hp[bossIdx],
    maxHp: soa.maxHp[bossIdx],
    phase,
  };

  // --- 7. 패턴 루프 ---
  const instanceId = soa.instanceId[bossIdx];
  const patterns = bossDef.patterns ?? [];

  // patterns 데이터가 없으면 로직 종료 (향후 레거시 AI fallback 확장 가능)
  if (patterns.length === 0) {
    world.environmentalForce = { vx: 0, vy: 0 };
    return;
  }

  /**
   * 이번 틱에 공격 전조(경고) 상태인 패턴이 하나라도 있으면 bossIdx의 state를 1로 세팅합니다.
   * 모든 패턴이 쿨타임 안정 상태이면 0으로 복구합니다.
   */
  let anyWarning = false;

  for (let pi = 0; pi < patterns.length; pi++) {
    const pattern = patterns[pi];

    // minPhase 조건 체크: 현재 페이즈가 패턴 최소 요구 페이즈 미만이면 스킵
    const minPhase = pattern.minPhase ?? 1;
    if (phase < minPhase) continue;

    // 타이머 키: instanceId + 패턴 인덱스의 복합 키
    const timerKey = `${instanceId}:${pi}`;
    const warningLead = pattern.warningLeadTime ?? 1000;

    // 첫 등장 시 타이머 초기화 (즉시 전조부터 시작)
    if (!patternTimers.has(timerKey)) {
      patternTimers.set(timerKey, now - pattern.cooldown + warningLead);
    }

    const lastTime = patternTimers.get(timerKey)!;
    const elapsed = now - lastTime;

    // 전조 구간 진입 여부
    const inWarning = elapsed > pattern.cooldown - warningLead;
    // 실제 발동 조건
    const shouldFire = elapsed > pattern.cooldown;

    if (inWarning) anyWarning = true;

    if (shouldFire) {
      // 타이머 갱신
      patternTimers.set(timerKey, now);

      // patternRegistry에서 핸들러 조회 후 실행
      const handler = patternRegistry.get(pattern.type);
      if (handler) {
        const ctx: PatternContext = {
          world,
          entities,
          bossIdx,
          phase,
          bx,
          by,
          px,
          py,
          now,
          pattern,
        };
        handler(ctx);
      }
    }
  }

  // 경고 상태 반영 (렌더러의 느낌표 표시 연동)
  soa.state[bossIdx] = anyWarning ? 1 : 0;

  world.environmentalForce = { vx: 0, vy: 0 };
};
