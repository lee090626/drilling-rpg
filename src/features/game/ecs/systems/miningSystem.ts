import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { getTileColor } from '@/shared/lib/tileUtils';
import { getNextLevelExp, createInitialMasteryState, getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { calculateMiningDamage } from '../../lib/miningCalculator';
import { handleBossDefeat } from './bossSystem';
import { calculateArtifactBonuses, hasArtifactEffect } from '@/shared/lib/artifactUtils';

import { showToast } from './toastSystem';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';

/**
 * 플레이어의 영구 스탯(체력, 이속 등)을 마스터리 및 연구 보너스에 맞춰 동기화합니다.
 * (O(1) 단순 사칙연산 형태이므로 매 프레임 호출하더라도 문제없음)
 */
function syncPermanentStats(player: any, masteryBonuses: any, artifactBonuses: any) {
  // 1. 최대 체력 동기화: (기본 100 + 마스터리고정 + 유물고정) * (1 + 마스터리배율)
  const baseHp = 100 + masteryBonuses.maxHp + (artifactBonuses?.maxHp || 0);
  const finalMaxHp = Math.floor(baseHp * (1 + masteryBonuses.maxHpMult));
  
  // 현재 체력 비율 유지하며 최대 체력 갱신
  const hpRatio = player.stats.maxHp > 0 ? player.stats.hp / player.stats.maxHp : 1;
  player.stats.maxHp = finalMaxHp;
  player.stats.hp = Math.floor(finalMaxHp * hpRatio);

  // 2. 이동 속도 동기화: (기본 이속 + 유물 이속) * (기본 배율 1.0 + 마스터리 배율)
  const baseMoveSpeed = 100 + (artifactBonuses?.moveSpeed || 0) + masteryBonuses.moveSpeed;
  const totalMoveSpeedMult = 1.0 + masteryBonuses.moveSpeedMult;
  player.stats.moveSpeed = Math.floor(baseMoveSpeed * totalMoveSpeedMult);
  
  // 3. 공격력(Power) 동기화: 기본 공격력 + 유물 공격력
  player.stats.power = 10 + (artifactBonuses?.power || 0);
}

/**
 * 프레임당 1회 계산될 공통 캐시 (GC 및 CPU 최적화)
 */
interface FrameCache {
  luck: number;
  masteryExpGain: number;
  hasMonsterTarget: boolean;
}

/**
 * 플레이어의 채굴 로직을 관리하는 메인 시스템입니다.
 * 내부적으로 대미지 계산기, 드론 시스템, 보스 시스템을 호출합니다.
 */
export const miningSystem = (world: GameWorld, now: number) => {
  const { player, tileMap, intent } = world;

  // --- 성능 최적화 (Memory & CPU) ---
  // 한 프레임에 여러 개의 타일이 동시 파괴될 때마다 매번 O(N) 탐색을 하는 것을 방지
  const masteryBonuses = getMasteryBonuses(player.stats);
  // 1. 매 프레임 영구 스탯 즉시 동기화
  const artifactBonuses = calculateArtifactBonuses(player.stats);
  syncPermanentStats(player, masteryBonuses, artifactBonuses);

  // [유물] 벨페고르의 눈 (MASTERY_BOOST): 숙련도 획득 속도 +300% (4배)
  let masteryExpMultiplier = 1.0 + masteryBonuses.masteryExpMult;
  if (hasArtifactEffect(player.stats, 'MASTERY_BOOST')) {
    masteryExpMultiplier += 3.0; // 300% 추가
  }

  const frameCache: FrameCache = {
    // 행운 적용: (룬 확률값스케일100배 + 마스터리럭 + 유물럭) * (1 + 마스터리행운배율)
    luck: Math.max(0, ((getTotalRuneStat(player.stats, 'luck') * 100) + masteryBonuses.luck + (artifactBonuses.luck * 100)) * (1 + masteryBonuses.luckMult)),
    masteryExpGain: Math.floor(10 * masteryExpMultiplier),
    hasMonsterTarget: false
  };

  // 2. 채굴 대상 타일 업데이트 (하이라이트용)
  updateMiningTarget(world, frameCache);

  // 3. 플레이어 채굴 수행
  handlePlayerMining(world, now, frameCache);

  // [삭제됨] droneSystem — 드론 시스템 제거됨
};

/**
 * 현재 조준 중인 타일을 계산하고 하이라이트 대상을 설정합니다.
 */
function updateMiningTarget(world: GameWorld, frameCache: FrameCache) {
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
        frameCache.hasMonsterTarget = true;
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
function handlePlayerMining(world: GameWorld, now: number, frameCache: FrameCache) {
  const { player, tileMap, intent, entities } = world;

  if (!player.isDrilling || !intent.miningTarget) {
    if (player.isDrilling) player.isDrilling = false;
    return;
  }

  const { x, y } = intent.miningTarget;

  // 몬스터를 조준 중이면 바닥(타일) 채굴은 건너뛰고 combatSystem에서만 처리되도록 함 (updateMiningTarget에서 이미 찾아둔 캐시 활용)
  if (frameCache.hasMonsterTarget) {
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
  
  if (finalDamage > 0) {
    player.lastHitTime = now;
    world.shake = Math.max(world.shake, destroyed ? 2.0 : 0.5);
    
    // 시각 효과
    createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(targetTile.type), 2);
    createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE, isCrit ? `Crit! -${finalDamage}` : `${finalDamage}`, isCrit ? '#f87171' : '#ffffff');
  }

  world.timestamp.lastMiningTime = now;

  if (destroyed) {
    handleTileDestruction(world, x, y, targetTile.type, totalPower, frameCache);
  }
}

/**
 * 타일 파괴 시 발생하는 보상 및 효과를 처리합니다.
 */
function handleTileDestruction(world: GameWorld, x: number, y: number, type: any, power: number, frameCache: FrameCache) {
  const { player, tileMap } = world;
  
  createParticles(world, x * TILE_SIZE, y * TILE_SIZE, getTileColor(type), 8);
  
  // 아이템 드롭 및 숙련도
  if (player.stats.inventory[type as any] !== undefined) {
    // Stone 타일은 아이템 드랍을 생성하지 않음
    if (type !== 'stone') {
        // 사용자 정의 드랍 공식: Luck 200까지 1개 확정, 이후 4배당 1개씩 추가 (파밍 난이도 대폭 강화)
        const currentLuck = Math.max(1, frameCache.luck);
        let dropCount = 1;
        if (currentLuck >= 200) {
            dropCount = 2 + Math.floor(Math.log(currentLuck / 200) / Math.log(4));
        }

        for (let i = 0; i < dropCount; i++) {
            const vx = (Math.random() - 0.5) * 8;
            const vy = -Math.random() * 6 - 2;
            world.droppedItemPool.spawn(
              type as any,
              x * TILE_SIZE + TILE_SIZE / 2,
              y * TILE_SIZE - 5,
              vx,
              vy
            );
        }    
    }
    
    if (!player.stats.discoveredMinerals.includes(type)) player.stats.discoveredMinerals.push(type);

    // 숙련도 처리 (가공된 아이템 제외)
    if (!player.stats.tileMastery) player.stats.tileMastery = {};
    let tileMastery = player.stats.tileMastery[type as string];
    if (!tileMastery) {
      tileMastery = createInitialMasteryState(type as string);
      player.stats.tileMastery[type as string] = tileMastery;
    }
    
    // 마스터리 경험치 획득량: 프레임 캐시 재사용하여 연산 최소화
    tileMastery.exp += frameCache.masteryExpGain;
    
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

      // 새로운 특성이 해금되었으면 화면에 알림 (영구 스탯은 다음 프레임 루프에서 자동으로 동기화됨)
      if (anyNewPerk) {
        // 중복 호출 제거됨 (miningSystem 상단에서 매 프레임 처리)
      }
    }
  }

}
