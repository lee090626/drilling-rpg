import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTER_LIST, MonsterDefinition } from '@/shared/config/monsterData';
import {
  patternTimers,
  patternRegistry,
  PatternContext,
} from './boss/bossPatternHandlers';

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

  // 보스가 없으면 모든 전투 상태 해제 (혹은 개별 해제 로직으로 확장 가능)
  if (bossIdx === -1) {
    if (Object.keys(world.bossCombatStatus).length > 0) {
      world.bossCombatStatus = {};
      world.environmentalForce = { vx: 0, vy: 0 };
    }
    return;
  }

  const instanceId = soa.instanceId[bossIdx].toString();

  // --- 2. 데이터 조회 및 보스 고정/이동 처리 ---
  const defIndex = soa.monsterDefIndex[bossIdx];
  const bossDef: MonsterDefinition | undefined = MONSTER_LIST[defIndex];

  if (bossDef?.behavior.movementType === 'stationary') {
    soa.vx[bossIdx] = 0;
    soa.vy[bossIdx] = 0;
  }

  // --- 3. 좌표 계산 ---
  const bx = soa.x[bossIdx] + (soa.width[bossIdx] || TILE_SIZE * 5) / 2;
  const by = soa.y[bossIdx] + (soa.height[bossIdx] || TILE_SIZE * 5) / 2;
  const px = player.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const py = player.pos.y * TILE_SIZE + TILE_SIZE / 2;

  // 플레이어가 너무 멀어지면 전투 해제 (약 20타일)
  const distToPlayer = Math.sqrt(Math.pow(bx - px, 2) + Math.pow(by - py, 2));
  if (distToPlayer > TILE_SIZE * 20) {
    if (world.bossCombatStatus[instanceId]) {
      delete world.bossCombatStatus[instanceId];
      world.environmentalForce = { vx: 0, vy: 0 };
    }
    return;
  }

  // 데이터가 없으면 안전하게 조기 종료
  if (!bossDef) return;

  // --- 5. 페이즈 결정 ---
  const hpPercent = (soa.hp[bossIdx] / soa.maxHp[bossIdx]) * 100;
  let phase = 1;

  if (bossDef.phases && bossDef.phases.length > 0) {
    const sortedPhases = [...bossDef.phases].sort(
      (a, b) => a.hpThreshold - b.hpThreshold,
    );
    for (const phaseConfig of sortedPhases) {
      if (hpPercent <= phaseConfig.hpThreshold) {
        phase = phaseConfig.phase;
      }
    }
  } else {
    if (hpPercent <= 40) phase = 3;
    else if (hpPercent <= 70) phase = 2;
  }

  // --- 6. bossCombatStatus UI 동기화 (Multi-Boss Support: instanceId 기반) ---
  world.bossCombatStatus[instanceId] = {
    active: true,
    id: bossDef.id,
    name: bossDef.nameKo ?? bossDef.name,
    hp: soa.hp[bossIdx],
    maxHp: soa.maxHp[bossIdx],
    phase,
  };

  // --- 7. 패턴 루프 ---
  const patterns = bossDef.patterns ?? [];

  if (patterns.length === 0) {
    world.environmentalForce = { vx: 0, vy: 0 };
    return;
  }

  let anyWarning = false;

  for (let pi = 0; pi < patterns.length; pi++) {
    const pattern = patterns[pi];
    const minPhase = pattern.minPhase ?? 1;
    if (phase < minPhase) continue;

    const timerKey = `${instanceId}:${pi}`;
    const warningLead = pattern.warningLeadTime ?? 1000;

    if (!patternTimers.has(timerKey)) {
      patternTimers.set(timerKey, now - pattern.cooldown + warningLead);
    }

    const lastTime = patternTimers.get(timerKey)!;
    const elapsed = now - lastTime;

    const inWarning = elapsed > pattern.cooldown - warningLead;
    const shouldFire = elapsed > pattern.cooldown;

    if (inWarning) anyWarning = true;

    if (shouldFire) {
      patternTimers.set(timerKey, now);

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

  soa.state[bossIdx] = anyWarning ? 1 : 0;
  world.environmentalForce = { vx: 0, vy: 0 };
};
