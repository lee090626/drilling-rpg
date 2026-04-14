import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE, BASE_DEPTH, MOVEMENT_DELAY_MS } from '@/shared/config/constants';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { calculateArtifactBonuses } from '@/shared/lib/artifactUtils';

/**
 * 플레이어의 이동, 충돌 체크, 그리드 기반 위치 보간을 담당하는 시스템입니다.
 * @param world 게임 월드 상태 객체
 * @param now 현재 게임 시간 (밀리초)
 */
export const physicsSystem = (world: GameWorld, now: number) => {
  const { player, intent, tileMap } = world;

  if (player.stats.hp <= 0) {
    player.isDrilling = false;
    return;
  }

  // 1. 부드러운 그리드 기반 이동 및 채굴 전환 로직
  // 1. 부드러운 그리드 기반 이동 및 채굴 전환 로직
  // 최종 이동 딜레이 계산 (합산된 stats.moveSpeed 기준)
  const baseSpeedMult = (player.stats.moveSpeed || 100) / 100;
  
  // 상태 이상에 따른 속도 변조 (SLOW: 0.5배, BUFF_SPEED: 1.5배)
  let statusSpeedMult = 1.0;
  if (player.stats.activeEffects) {
    if (player.stats.activeEffects.some((e) => e.type === 'SLOW')) statusSpeedMult *= 0.5;
    if (player.stats.activeEffects.some((e) => e.type === 'BUFF_SPEED')) statusSpeedMult *= 1.5;
    if (player.stats.activeEffects.some((e) => e.type === 'FREEZE')) statusSpeedMult *= 0.2;
  }

  // 마스터리 돌파: 일시적 속도 버프/디버프 처리
  if (now < player.buffs.speedBoostUntil) {
    statusSpeedMult *= player.buffs.speedBoostMultiplier;
  }

  const divisor = baseSpeedMult * statusSpeedMult || 1;
  const MOVEMENT_DELAY = MOVEMENT_DELAY_MS / divisor;

  // 시각적 보간 속도 설정
  const lerpFactor = isFinite(50 / MOVEMENT_DELAY) ? Math.min(0.95, 50 / MOVEMENT_DELAY) : 0.25;

  // 논리적 위치 업데이트 (그리드 이동)
  if (now - world.timestamp.lastMove >= MOVEMENT_DELAY) {
    let moved = false;
    let drilling = false;

    // 상하좌우 그리드 이동 처리
    if (intent.moveX !== 0 || intent.moveY !== 0) {
      let dx = 0;
      let dy = 0;

      // 주 입력 방향 결정
      if (intent.moveX !== 0) {
        dx = intent.moveX > 0 ? 1 : -1;
      } else if (intent.moveY !== 0) {
        dy = intent.moveY > 0 ? 1 : -1;
      }

      // CONFUSION (혼란): 조작 반전
      if (player.stats.activeEffects?.some((e) => e.type === 'CONFUSION')) {
        dx *= -1;
        dy *= -1;
      }

      if (dx !== 0 || dy !== 0) {
        const targetX = Math.round(player.pos.x + dx);
        const targetY = Math.round(player.pos.y + dy);

        // --- 몬스터 충돌 체크 (SpatialHash 최적화) ---
        const nearbyEntities = world.spatialHash.query(
          targetX * TILE_SIZE + TILE_SIZE / 2,
          targetY * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE * 0.5,
        );

        const monsterAtTarget = nearbyEntities.find((idx) => {
          if (world.entities.soa.type[idx] !== 1 && world.entities.soa.type[idx] !== 2)
            return false;
          if (world.entities.soa.hp[idx] <= 0) return false;

          const ex = world.entities.soa.x[idx];
          const ey = world.entities.soa.y[idx];
          const ew = world.entities.soa.width[idx] || TILE_SIZE;
          const eh = world.entities.soa.height[idx] || TILE_SIZE;

          const px = targetX * TILE_SIZE;
          const py = targetY * TILE_SIZE;

          return px < ex + ew && px + TILE_SIZE > ex && py < ey + eh && py + TILE_SIZE > ey;
        });

        const tile = tileMap.getTile(targetX, targetY);

        if (monsterAtTarget !== undefined) {
          drilling = true;
          intent.miningTarget = { x: targetX, y: targetY };
        } else if (tile && (tile.type === 'empty' || tile.type === 'portal')) {
          player.pos.x = targetX;
          player.pos.y = targetY;
          moved = true;

          // BLEED (선혈): 이동 시 고정 피해
          if (player.stats.activeEffects?.some((e) => e.type === 'BLEED')) {
            const bleedDmg = Math.max(1, Math.floor(player.stats.maxHp * 0.03));
            player.stats.hp -= bleedDmg;
            createFloatingText(
              world,
              player.visualPos.x * 128,
              player.visualPos.y * 128,
              '-' + bleedDmg,
              '#ef4444',
            );
          }
        } else if (tile && tile.type !== 'wall') {
          drilling = true;
          intent.miningTarget = { x: targetX, y: targetY };
        }
      }
    }

    // 상태 갱신
    if (moved) {
      world.timestamp.lastMove = now;
      player.isDrilling = false;
    } else if (drilling) {
      player.isDrilling = true;
    } else {
      player.isDrilling = false;
    }
  }

  // 2. 플레이어 통계 업데이트 및 시각적 위치 보간
  player.stats.depth = Math.floor(player.pos.y) - BASE_DEPTH;
  if (player.stats.depth > player.stats.maxDepthReached) {
    player.stats.maxDepthReached = player.stats.depth;
  }

  player.visualPos.x += (player.pos.x - player.visualPos.x) * lerpFactor;
  player.visualPos.y += (player.pos.y - player.visualPos.y) * lerpFactor;

  // [신규] 환경적인 힘 적용 (Storm Surge 등) - 충돌 검사 포함
  if (world.environmentalForce.vx !== 0 || world.environmentalForce.vy !== 0) {
    const nextX = player.pos.x + world.environmentalForce.vx;
    const nextY = player.pos.y + world.environmentalForce.vy;
    
    // 벽 충돌 검사 (간소화된 4방향 체크)
    const tileX = Math.floor(nextX + 0.5);
    const tileY = Math.floor(nextY + 0.5);
    const targetTile = tileMap.getTile(tileX, tileY);
    
    // 타일이 존재하고 파괴 가능한 타일이거나 벽인 경우 이동 제한
    const isSolid = targetTile && (targetTile.maxHealth > 0 || targetTile.type === 'wall');
    
    if (!isSolid) {
      player.pos.x = nextX;
      player.pos.y = nextY;
    }

    // 월드 경계 제한 (0 ~ 64, BASE_DEPTH ~ 3000)
    player.pos.x = Math.max(0, Math.min(64 - 1, player.pos.x));
    player.pos.y = Math.max(BASE_DEPTH, Math.min(3000 - 1, player.pos.y));
  }

  // 3. 펫 드론 추적 (관성 이동 및 띄워놓기)
  if (player.stats.equippedDroneId) {
    if (!world.activeDrone || world.activeDrone.id !== player.stats.equippedDroneId) {
      world.activeDrone = {
        id: player.stats.equippedDroneId,
        x: player.visualPos.x * TILE_SIZE,
        y: player.visualPos.y * TILE_SIZE - TILE_SIZE,
        vx: 0,
        vy: 0,
        targetX: null,
        targetY: null,
        lastHitTime: 0,
      };
    } else {
      const dx = player.visualPos.x * TILE_SIZE - TILE_SIZE * 0.8 - world.activeDrone.x;
      const dy = player.visualPos.y * TILE_SIZE - TILE_SIZE * 0.8 - world.activeDrone.y;

      world.activeDrone.vx += dx * 0.05;
      world.activeDrone.vy += dy * 0.05;
      world.activeDrone.vx *= 0.8;
      world.activeDrone.vy *= 0.8;

      world.activeDrone.x += world.activeDrone.vx;
      world.activeDrone.y += world.activeDrone.vy;
    }
  } else {
    world.activeDrone = null;
  }
};
