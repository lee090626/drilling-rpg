import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';
import { getTileColor } from '../../shared/lib/tileUtils';
import { getNextLevelExp, createInitialEquipmentState } from '../../shared/lib/masteryUtils';
import { getTotalRuneStat } from '../../shared/lib/runeUtils';
import { createFloatingText, createParticles } from '../../shared/lib/effectUtils';
import { calculateMiningDamage } from './miningCalculator';
import { handleBossDefeat } from './bossSystem';
import { droneSystem } from './droneSystem';

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
  
  // 몬스터 존재 여부 체크
  const hasMonster = world.entities.some(e => 
    (e.type === 'monster' || e.type === 'boss') && 
    e.stats && e.stats.hp > 0 &&
    targetX >= e.x && targetX < e.x + (e.width || 1) &&
    targetY >= e.y && targetY < e.y + (e.height || 1)
  );

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
  const { player, tileMap, intent } = world;

  if (!player.isDrilling || !intent.miningTarget) {
    if (player.isDrilling) player.isDrilling = false;
    return;
  }

  const { x, y } = intent.miningTarget;
  const targetTile = tileMap.getTile(x, y);
  if (!targetTile) return;

  // 대미지 계산 (분리된 계산기 사용)
  const { finalDamage, totalPower, isCrit, attackInterval } = calculateMiningDamage(player.stats, targetTile.type as any);

  // 쿨타임 체크 (이동 타임스탬프와 분리하여 연사력 유지)
  if (now - world.timestamp.lastMiningTime < attackInterval) return;

  // 타격 처리
  const destroyed = finalDamage > 0 ? tileMap.damageTile(x, y, finalDamage) : false;
  
  if (finalDamage > 0) {
    player.lastHitTime = now;
    world.shake = Math.max(world.shake, destroyed ? 2.0 : 0.5);
    
    // 시각 효과
    createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(targetTile.type), 2);
    createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE, isCrit ? `Crit! -${finalDamage}` : `-${finalDamage}`, isCrit ? '#f87171' : '#ffffff');
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
    const luck = getTotalRuneStat(player.stats, 'luck');
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

    // 숙련도 처리
    let equipmentState = player.stats.equipmentStates[player.stats.equippedDrillId];
    if (!equipmentState) {
      equipmentState = createInitialEquipmentState(player.stats.equippedDrillId);
      player.stats.equipmentStates[player.stats.equippedDrillId] = equipmentState;
    }
    equipmentState.exp += 10;
    const nextExp = getNextLevelExp(equipmentState.level);
    if (equipmentState.exp >= nextExp) {
      equipmentState.level++;
      equipmentState.exp -= nextExp;
      createFloatingText(world, player.pos.x * TILE_SIZE, player.pos.y * TILE_SIZE - 20, `Mastery Level Up: ${equipmentState.level}!!`, '#eab308');
    }
  }

  // 보스전 승리 처리
  if (type === 'boss_core') {
    handleBossDefeat(world, x, y);
  }
}
