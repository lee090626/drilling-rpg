import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTERS } from '@/shared/config/monsterData';
import { calculateMiningDamage } from '../../lib/miningCalculator';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { handleBossDefeat } from './bossSystem';
import { calculateArtifactBonuses, hasArtifactEffect } from '@/shared/lib/artifactUtils';

/**
 * 플레이어와 몬스터 간의 전투(대미지 처리, 사망 등)를 담당하는 시스템입니다.
 */
export const combatSystem = (world: GameWorld, deltaTime: number, now: number) => {
  const { player, entities, floatingTexts } = world;

  // 1. 몬스트 -> 플레이어 공격 (SpatialHash 기반)
  const nearbyMonsters = world.spatialHash.query(
    player.pos.x * TILE_SIZE,
    player.pos.y * TILE_SIZE,
    TILE_SIZE * 2,
  );

  nearbyMonsters.forEach((idx) => {
    const type = entities.soa.type[idx];
    if (type !== 1 && type !== 2) return; // 1: monster, 2: boss
    if (entities.soa.hp[idx] <= 0) return;

    // 몬스터 사거리 체크 (월드 좌표 기준)
    const ex = entities.soa.x[idx];
    const ey = entities.soa.y[idx];
    const ew = entities.soa.width[idx] || TILE_SIZE;
    const eh = entities.soa.height[idx] || TILE_SIZE;

    const px = player.pos.x * TILE_SIZE;
    const py = player.pos.y * TILE_SIZE;

    const rangePadding = TILE_SIZE * 1.2; 
    const isInRange =
      px >= ex - rangePadding &&
      px < ex + ew + rangePadding &&
      py >= ey - rangePadding &&
      py < ey + eh + rangePadding;

    if (isInRange) {
      // [추가] 잡몹(Type 1)은 대각선 공격 불가능
      const dx = Math.abs(px - (ex + ew / 2));
      const dy = Math.abs(py - (ey + eh / 2));
      const isDiagonal = dx > TILE_SIZE * 0.8 && dy > TILE_SIZE * 0.8;
      const canDamage = type === 2 || !isDiagonal;

      if (canDamage) {
        const cooldown = entities.soa.attackCooldown[idx]; // 몬스터 별 개별 공격 쿨타임
        if (now - entities.soa.lastAttackTime[idx] > cooldown) {
          const attack = entities.soa.attack[idx];
          const damage = Math.max(1, attack - (player.stats.defense || 0));
          player.stats.hp -= damage;
          player.lastHitTime = now;

          createFloatingText(world, px, py - 20, `-${damage}`, '#ef4444');
          entities.soa.lastAttackTime[idx] = now;
          world.shake = Math.max(world.shake, 5);
        }
      }
    }
  });

  // 2. 플레이어 -> 몬스터 공격 (드릴링 중 주변 몬스터 타격)
  if (player.isDrilling && world.intent.miningTarget) {
    const target = world.intent.miningTarget;
    const hitEntities = world.spatialHash.query(
      target.x * TILE_SIZE + TILE_SIZE / 2,
      target.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.5,
    );

    hitEntities.forEach((idx) => {
      const type = entities.soa.type[idx];
      if (type !== 1 && type !== 2) return;
      if (entities.soa.hp[idx] <= 0) return;

      const ex = entities.soa.x[idx];
      const ey = entities.soa.y[idx];
      const ew = entities.soa.width[idx] || TILE_SIZE;
      const eh = entities.soa.height[idx] || TILE_SIZE;

      const tx = target.x * TILE_SIZE;
      const ty = target.y * TILE_SIZE;

      const isHit = tx < ex + ew && tx + TILE_SIZE > ex && ty < ey + eh && ty + TILE_SIZE > ey;

      if (isHit) {
        const defIdx = entities.soa.monsterDefIndex[idx];
        const monsterDef = MONSTERS[defIdx];
        const monsterDefense = monsterDef?.stats?.defense || 0;

        const { finalDamage, attackInterval, isCrit } = calculateMiningDamage(
          player.stats,
          type === 2 ? 'boss' : 'monster',
          monsterDefense
        );

        if (now - player.lastAttackTime > attackInterval) {
          let actualDamage = finalDamage;
          let text = isCrit ? `Crit! -${finalDamage}` : `-${finalDamage}`;
          let color = isCrit ? '#f87171' : '#ffffff';

          // [특수 기믹] 크리티컬 온리 몬스터 처리
          if (monsterDef?.mechanic === 'critical_only' && !isCrit) {
            actualDamage = 0;
            text = 'BLOCK!';
            color = '#3b82f6'; // 파란색 (사용자 요청)
          }

          if (actualDamage > 0 || text === 'BLOCK!') {
            entities.soa.hp[idx] -= actualDamage;
            entities.markDirty(idx);
            createFloatingText(world, ex, ey - 30, text, color);
          }

          player.lastAttackTime = now;
          if (isCrit && actualDamage > 0) world.shake = Math.max(world.shake, 8);
        }
      }
    });
  }

  // 3. 플레이어 사망 체크
  if (player.stats.hp <= 0) player.stats.hp = 0;

  // 4. 사망 처리 및 보상 ($O(1)$ Swap-and-Pop)
  for (let i = entities.soa.count - 1; i >= 0; i--) {
    if ((entities.soa.type[i] === 1 || entities.soa.type[i] === 2) && entities.soa.hp[i] <= 0) {
      const defIdx = entities.soa.monsterDefIndex[i];
      const monsterDef = MONSTERS[defIdx];

      if (monsterDef) {
        // 보상 지급
        let multiplier = 1;
        switch (monsterDef.rarity) {
          case 'Uncommon':
            multiplier = 2;
            break;
          case 'Rare':
            multiplier = 3;
            break;
          case 'Epic':
            multiplier = 5;
            break;
          case 'Radiant':
            multiplier = 7;
            break;
          case 'Legendary':
            multiplier = 10;
            break;
          case 'Mythic':
            multiplier = 15;
            break;
          case 'Ancient':
            multiplier = 20;
            break;
        }
        if (entities.soa.type[i] === 2) multiplier *= 5;

        const baseGold = 10;
        const hpBonus = Math.floor(entities.soa.maxHp[i] * 0.1);
        const totalGold = Math.floor(baseGold + hpBonus * multiplier);

        player.stats.goldCoins += totalGold;
        createFloatingText(
          world,
          entities.soa.x[i],
          entities.soa.y[i] - 60,
          `+${totalGold} G`,
          '#fde047',
          1.5,
        );

        // 보스 처치 시 진행 처리
        if (entities.soa.type[i] === 2) {
          handleBossDefeat(world, entities.soa.x[i], entities.soa.y[i]);
        }

        // [유물] 아스모데우스의 반지 (EXP_BOOST): 경험치 30% 증가
        let expAmount = monsterDef.rewards.exp;
        if (hasArtifactEffect(player.stats, 'EXP_BOOST')) {
          expAmount = Math.floor(expAmount * 1.3);
        }
        // TODO: 플레이어 경험치 시스템이 아직 명시적이지 않다면 로그 또는 추후 구현을 위해 변수화

        // [유물] 벨제붑의 독니 (LIFE_STEAL_PERCENT): 처치 시 최대 체력의 5% 회복
        if (hasArtifactEffect(player.stats, 'LIFE_STEAL_PERCENT')) {
          const healAmount = Math.floor(player.stats.maxHp * 0.05);
          player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healAmount);
          createFloatingText(
            world,
            player.pos.x * TILE_SIZE,
            player.pos.y * TILE_SIZE - 40,
            `+${healAmount} HP`,
            '#4ade80',
          );
        }

        // === [업데이트] 다중 드롭 시스템 (유물 & 전리품) ===
        const artifactBonuses = calculateArtifactBonuses(player.stats);
        const luckBonus = artifactBonuses.luck; // 0.01 = 1% 증가 개념

        // [유물] 아바돈의 부러진 칼날 (LOOT_QUANTITY_BOOST): 전리품 획득량 25% 증가
        const lootMultiplier = hasArtifactEffect(player.stats, 'LOOT_QUANTITY_BOOST') ? 1.25 : 1.0;

        if (monsterDef.rewards.drops) {
          monsterDef.rewards.drops.forEach((drop) => {
            const rand = Math.random();
            if (rand < drop.chance) {
              // 기본 수량 결정
              const baseAmount =
                Math.floor(Math.random() * (drop.maxAmount - drop.minAmount + 1)) + drop.minAmount;
              // 행운 보너스 및 유물 전리품 보너스 적용
              const finalAmount = Math.max(
                1,
                Math.floor(baseAmount * (1 + luckBonus) * lootMultiplier),
              );

              // 시각적 연출을 위해 가벼운 분산 스폰
              const vx = (Math.random() - 0.5) * 10;
              const vy = -Math.random() * 8 - 4;

              world.droppedItemPool.spawn(
                drop.itemId as any,
                entities.soa.x[i] + (entities.soa.width[i] || TILE_SIZE) / 2,
                entities.soa.y[i] + (entities.soa.height[i] || TILE_SIZE) / 2,
                vx,
                vy,
                finalAmount,
              );
            }
          });
        }

        // 처치 기록 (ID가 있을 경우 활성화)
        if (!player.stats.killedMonsterIds) player.stats.killedMonsterIds = [];
        player.stats.killedMonsterIds.push(monsterDef.id);
      }

      entities.destroy(i);
    }
  }
};
