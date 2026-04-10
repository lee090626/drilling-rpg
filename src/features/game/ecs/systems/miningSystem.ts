import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { getTileColor } from '@/shared/lib/tileUtils';
import { getNextLevelExp, createInitialMasteryState } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { getResearchBonuses } from '@/shared/lib/researchUtils';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { calculateMiningDamage } from '../../lib/miningCalculator';
import { handleBossDefeat } from './bossSystem';
import { droneSystem } from './droneSystem';
import { showToast } from './toastSystem';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';

/**
 * 플레이어의 채굴 로직을 관리하는 메인 시스템입니다.
 * 내부적으로 대미지 계산기, 드론 시스템, 보스 시스템을 호출합니다.
 */
export const miningSystem = (world: GameWorld, now: number) => {
  const { player, tileMap, intent } = world;

  // 1. 채굴 대상 타일 업데이트 (하이라이트용)
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
    // researchBonuses.luck의 기본값이 1이므로, 1을 뺀 추가 보너스만 취합
    const luck = getTotalRuneStat(player.stats, 'luck') + (researchBonuses.luck - 1);
    let dropCount = 1;
    let remLuck = luck;
    while (remLuck >= 1) { dropCount++; remLuck--; }
    if (Math.random() < remLuck) dropCount++;

    for (let i = 0; i < dropCount; i++) {
        world.droppedItems.push({
          id: `item_${Date.now()}_${Math.random()}`,
          type,
          x: x * TILE_SIZE + TILE_SIZE / 2,
          y: y * TILE_SIZE - 5, // 타일 상단에서 살짝 위로 생성하여 끼임 방지
          vx: (Math.random() - 0.5) * 8,
          vy: -6 - Math.random() * 4,
          life: 0
        });
    }
    
    if (dropCount > 1) createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 10, `x${dropCount} Drops!`, '#a855f7');
    if (!player.stats.discoveredMinerals.includes(type)) player.stats.discoveredMinerals.push(type);

    // 숙련도 처리 (장비 대신 타일 타입 기반)
    if (!player.stats.tileMastery) player.stats.tileMastery = {};
    let tileMastery = player.stats.tileMastery[type as string];
    if (!tileMastery) {
      tileMastery = createInitialMasteryState(type as string);
      player.stats.tileMastery[type as string] = tileMastery;
    }
    
    tileMastery.exp += 10;
    const nextExp = getNextLevelExp(tileMastery.level);
    if (tileMastery.exp >= nextExp) {
      tileMastery.level++;
      tileMastery.exp -= nextExp;
      showToast(`${type.toUpperCase()} Mastery Level Up: ${tileMastery.level}!!`, 'success');

      // 마스터리 돌파 특성 해금 체크
      MASTERY_PERKS.forEach(perk => {
        if (perk.tileType === type && perk.requiredLevel === tileMastery.level) {
          if (!player.stats.unlockedMasteryPerks.includes(perk.id)) {
            player.stats.unlockedMasteryPerks.push(perk.id);
            showToast(`✨ Breakthrough! [${perk.name}] unlocked!`, 'success');
            createFloatingText(world, player.pos.x * TILE_SIZE, player.pos.y * TILE_SIZE - 40, `✨ ${perk.name} UNLOCKED!`, '#fbbf24');
          }
        }
      });
    }

    // --- 흙(Dirt) 타일 파괴 시 특성 효과 발동 ---
    if (type === 'dirt') {
      const perks = player.stats.unlockedMasteryPerks;
      
      // Lv.50 또는 Lv.150 이속 증가 (상위 특성이 우선)
      if (perks.includes('perk_dirt_150')) {
        player.buffs.speedBoostUntil = Date.now() + 1500;
        player.buffs.speedBoostMultiplier = 1.4;
      } else if (perks.includes('perk_dirt_50')) {
        player.buffs.speedBoostUntil = Date.now() + 1500;
        player.buffs.speedBoostMultiplier = 1.2;
      }

      // Lv.100 체력 회복
      if (perks.includes('perk_dirt_100') && Math.random() < 0.01) {
        const recoverAmount = 1;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + recoverAmount);
        createFloatingText(world, player.pos.x * TILE_SIZE, player.pos.y * TILE_SIZE - 20, `+${recoverAmount} HP`, '#4ade80');
      }
    }
  }

  // 보스전 승리 처리
  if (type === 'boss_core') {
    handleBossDefeat(world, x, y);
  }
}
