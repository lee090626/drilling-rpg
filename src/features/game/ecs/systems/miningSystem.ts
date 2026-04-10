import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { getTileColor } from '@/shared/lib/tileUtils';
import { getNextLevelExp, createInitialMasteryState, getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { getResearchBonuses } from '@/shared/lib/researchUtils';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { calculateMiningDamage } from '../../lib/miningCalculator';
import { handleBossDefeat } from './bossSystem';
import { droneSystem } from './droneSystem';
import { showToast } from './toastSystem';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';

/**
 * 플레이어의 영구 스탯(체력, 이속 등)을 마스터리 및 연구 보너스에 맞춰 동기화합니다.
 */
function syncPermanentStats(player: any) {
  const masteryBonuses = getMasteryBonuses(player.stats);
  const researchBonuses = getResearchBonuses(player.stats);

  // 1. 최대 체력 동기화: (기본 100 + 마스터리고정) * (1 + 마스터리배율)
  const baseHp = 100 + masteryBonuses.maxHp;
  const finalMaxHp = Math.floor(baseHp * (1 + masteryBonuses.maxHpMult));
  
  // 현재 체력 비율 유지하며 최대 체력 갱신
  const hpRatio = player.stats.maxHp > 0 ? player.stats.hp / player.stats.maxHp : 1;
  player.stats.maxHp = finalMaxHp;
  player.stats.hp = Math.floor(finalMaxHp * hpRatio);

  // 2. 이동 속도 동기화: (기본 100 + 마스터리고정) * (1 + 연구배율 + 마스터리배율)
  const baseMoveSpeed = 100 + masteryBonuses.moveSpeed;
  const totalMoveSpeedMult = 1 + (researchBonuses.moveSpeed - 1) + masteryBonuses.moveSpeedMult;
  player.stats.moveSpeed = Math.floor(baseMoveSpeed * totalMoveSpeedMult);
}

/**
 * 플레이어의 채굴 로직을 관리하는 메인 시스템입니다.
 * 내부적으로 대미지 계산기, 드론 시스템, 보스 시스템을 호출합니다.
 */
export const miningSystem = (world: GameWorld, now: number) => {
  const { player, tileMap, intent } = world;

  // 1. 초기 스탯 동기화 및 마스터리 보너스 적용
  if (!player._statsSynced) {
    syncPermanentStats(player);
    player._statsSynced = true;
  }

  // 2. 채굴 대상 타일 업데이트 (하이라이트용)
  updateMiningTarget(world);

  // 2. 플레이어 채굴 수행
  handlePlayerMining(world, now);

  // 3. 드론 자동 채굴 수행 (독립 시스템으로 분리됨)
  droneSystem(world, now);
};

/**
 * 현재 조준 중인 타일을 계산하고 하이라이트 대상을 설정합니다.
 */
function updateMiningTarget(world: GameWorld) {
  const { player, tileMap, intent } = world;
  const targetX = Math.floor(player.pos.x + (intent.moveX !== 0 ? intent.moveX * 1.0 : 0) + 0.5);
  const targetY = Math.floor(player.pos.y + (intent.moveY !== 0 ? intent.moveY * 1.0 : 0) + 0.5);
  const targetTile = tileMap.getTile(targetX, targetY);
  
  // 몬스터 존재 여부 체크 (SoA & SpatialHash 사용)
  let hasMonster = false;
  const targetPxX = targetX * TILE_SIZE;
  const targetPxY = targetY * TILE_SIZE;
  const nearbyIdxs = world.spatialHash.query(targetPxX + TILE_SIZE / 2, targetPxY + TILE_SIZE / 2, TILE_SIZE);
  for (let i = 0; i < nearbyIdxs.length; i++) {
    const idx = nearbyIdxs[i];
    const type = world.entities.soa.type[idx];
    if ((type === 1 || type === 2) && world.entities.soa.hp[idx] > 0) { // 1: monster, 2: boss
      const ex = world.entities.soa.x[idx];
      const ey = world.entities.soa.y[idx];
      const ew = world.entities.soa.width[idx] || TILE_SIZE;
      const eh = world.entities.soa.height[idx] || TILE_SIZE;
      if (targetPxX >= ex && targetPxX < ex + ew && targetPxY >= ey && targetPxY < ey + eh) {
        hasMonster = true;
        break;
      }
    }
  }

  if (hasMonster || (targetTile && targetTile.type !== 'empty' && targetTile.type !== 'wall' && targetTile.type !== 'portal')) {
    intent.miningTarget = { x: targetX, y: targetY };
  } else {
    intent.miningTarget = null;
  }
}

/**
 * 플레이어의 드릴링 액션을 처리합니다.
 */
function handlePlayerMining(world: GameWorld, now: number) {
  const { player, tileMap, intent, entities } = world;

  if (!player.isDrilling || !intent.miningTarget) {
    if (player.isDrilling) player.isDrilling = false;
    return;
  }

  const { x, y } = intent.miningTarget;

  // 몬스터를 조준 중이면 바닥(타일) 채굴은 건너뛰고 combatSystem에서만 처리되도록 함 (SoA & SpatialHash 사용)
  let hasMonster = false;
  const targetPxX = x * TILE_SIZE;
  const targetPxY = y * TILE_SIZE;
  const nearbyIdxs = world.spatialHash.query(targetPxX + TILE_SIZE / 2, targetPxY + TILE_SIZE / 2, TILE_SIZE);
  for (let i = 0; i < nearbyIdxs.length; i++) {
    const idx = nearbyIdxs[i];
    const type = world.entities.soa.type[idx];
    if ((type === 1 || type === 2) && world.entities.soa.hp[idx] > 0) { // 1: monster, 2: boss
      const ex = world.entities.soa.x[idx];
      const ey = world.entities.soa.y[idx];
      const ew = world.entities.soa.width[idx] || TILE_SIZE;
      const eh = world.entities.soa.height[idx] || TILE_SIZE;
      if (targetPxX >= ex && targetPxX < ex + ew && targetPxY >= ey && targetPxY < ey + eh) {
        hasMonster = true;
        break;
      }
    }
  }

  if (hasMonster) {
    return;
  }

  const targetTile = tileMap.getTile(x, y);
  if (!targetTile) return;

  // 대미지 계산 (분리된 계산기 사용)
  const { finalDamage, totalPower, isCrit, attackInterval } = calculateMiningDamage(player.stats, targetTile.type as any);

  // 쿨타임 체크 (이동 타임스탬프와 분리하여 연사력 유지)
  if (now - world.timestamp.lastMiningTime < attackInterval) return;

  // 타격 처리
  const destroyed = finalDamage > 0 ? tileMap.damageTile(x, y, finalDamage) : false;
  
  if (finalDamage >= 0) {
    player.lastHitTime = now;
    world.shake = Math.max(world.shake, destroyed ? 2.0 : 0.5);
    
    // 시각 효과
    createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(targetTile.type), 2);
    createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE, isCrit ? `Crit! -${finalDamage}` : `${finalDamage}`, isCrit ? '#f87171' : '#ffffff');
  }

  world.timestamp.lastMiningTime = now;

  if (destroyed) {
    handleTileDestruction(world, x, y, targetTile.type, totalPower);
  }
}

/**
 * 타일 파괴 시 발생하는 보상 및 효과를 처리합니다.
 */
function handleTileDestruction(world: GameWorld, x: number, y: number, type: any, power: number) {
  const { player, tileMap } = world;
  
  createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(type), 8);
  
  // 아이템 드롭 및 숙련도
  if (player.stats.inventory[type as any] !== undefined) {
    const researchBonuses = getResearchBonuses(player.stats);
    const masteryBonuses = getMasteryBonuses(player.stats);
    
    // 행운 적용: 기본 행운 + 연구 + 마스터리(고정/배율)
    const luck = getTotalRuneStat(player.stats, 'luck') + (researchBonuses.luck - 1) + masteryBonuses.luck + masteryBonuses.luckMult;
    
    let dropCount = 1;
    let remLuck = luck;
    while (remLuck >= 1) { dropCount++; remLuck--; }
    if (Math.random() < remLuck) dropCount++;

    for (let i = 0; i < dropCount; i++) {
        world.droppedItems.push({
          id: `item_${Date.now()}_${Math.random()}`,
          type,
          x: x * TILE_SIZE + TILE_SIZE / 2,
          y: y * TILE_SIZE - 5,
          vx: (Math.random() - 0.5) * 8,
          vy: -6 - Math.random() * 4,
          life: 0
        });
    }
    
    if (dropCount > 1) createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 10, `x${dropCount} Drops!`, '#a855f7');
    if (!player.stats.discoveredMinerals.includes(type)) player.stats.discoveredMinerals.push(type);

    // 숙련도 처리 (가공된 아이템 제외)
    if (!player.stats.tileMastery) player.stats.tileMastery = {};
    let tileMastery = player.stats.tileMastery[type as string];
    if (!tileMastery) {
      tileMastery = createInitialMasteryState(type as string);
      player.stats.tileMastery[type as string] = tileMastery;
    }
    
    // 마스터리 경험치 획득량: 기본 10 * 연구 배율 * (1 + 마스터리 배율)
    const expGain = Math.floor(10 * researchBonuses.masteryExp * (1 + masteryBonuses.masteryExpMult));
    tileMastery.exp += expGain;
    
    const nextExp = getNextLevelExp(tileMastery.level);
    if (tileMastery.exp >= nextExp) {
      tileMastery.level++;
      tileMastery.exp -= nextExp;
      showToast(`${type.toUpperCase()} Mastery Level Up: ${tileMastery.level}!!`, 'success');

      // 마스터리 돌파 특성 해금 체크
      let anyNewPerk = false;
      MASTERY_PERKS.forEach(perk => {
        if (perk.tileType === type && perk.requiredLevel === tileMastery.level) {
          if (!player.stats.unlockedMasteryPerks.includes(perk.id)) {
            player.stats.unlockedMasteryPerks.push(perk.id);
            showToast(`✨ Breakthrough! [${perk.name}] unlocked!`, 'success');
            createFloatingText(world, player.pos.x * TILE_SIZE, player.pos.y * TILE_SIZE - 40, `✨ ${perk.name} UNLOCKED!`, '#fbbf24');
            anyNewPerk = true;
          }
        }
      });

      // 새로운 특성이 해금되었으면 플레이어의 영구 스탯 즉시 동기화
      if (anyNewPerk) {
        syncPermanentStats(player);
      }
    }
  }

  // 보스전 승리 처리
  if (type === 'boss_core') {
    handleBossDefeat(world, x, y);
  }
}
