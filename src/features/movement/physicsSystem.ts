import { GameWorld } from '../../entities/world/model';
import { 
  TILE_SIZE, 
  BASE_DEPTH,
  MOVEMENT_DELAY_MS
} from '../../shared/config/constants';
import { DRILLS } from '../../shared/config/drillData';
import { createInitialEquipmentState } from '../../shared/lib/masteryUtils';
import { getTotalRuneStat } from '../../shared/lib/runeUtils';

/**
 * 플레이어의 이동, 충돌 체크, 그리드 기반 위치 보간을 담당하는 시스템입니다.
 * @param world 게임 월드 상태 객체
 * @param now 현재 게임 시간 (밀리초)
 */
export const physicsSystem = (world: GameWorld, now: number) => {
  const { player, intent, tileMap } = world;
  
  // 1. 부드러운 그리드 기반 이동 및 채굴 전환 로직
  const drill = DRILLS[player.stats.equippedDrillId] || DRILLS['rusty_drill'];
  const equipmentState = player.stats.equipmentStates[player.stats.equippedDrillId] || createInitialEquipmentState(player.stats.equippedDrillId);
  
  // 룬 시스템에 의한 이동 속도 보너스 합산 (백분율 값으로 치환)
  // 예: runeSpeedMult가 20이면 0.2 증가 (1.2배 속도)
  const runeSpeedMult = getTotalRuneStat(player.stats, 'moveSpeed') * 0.01;

  // 최종 이동 딜레이 계산 (장비 마이너스 속도 보정, 그리고 룬 보너스 추가)
  const drillSpeedMult = drill.moveSpeedMult || 1;
  const MOVEMENT_DELAY = MOVEMENT_DELAY_MS / (drillSpeedMult + runeSpeedMult); 
  
  // 논리적 위치 업데이트 (그리드 이동)
  if (now - world.timestamp.lastMove >= MOVEMENT_DELAY) {
    let moved = false;
    let drilling = false;

    // 상하좌우 그리드 이동 처리
    if (intent.moveX !== 0 || intent.moveY !== 0) {
      let dx = 0;
      let dy = 0;

      // 주 입력 방향 결정 (가로와 세로 중 하나만 우선 처리)
      if (intent.moveX !== 0) {
        dx = intent.moveX > 0 ? 1 : -1;
      } else if (intent.moveY !== 0) {
        dy = intent.moveY > 0 ? 1 : -1;
      }

      if (dx !== 0 || dy !== 0) {
        const targetX = Math.round(player.pos.x + dx);
        const targetY = Math.round(player.pos.y + dy);
        const tile = tileMap.getTile(targetX, targetY);

        // 이동 대상이 비어있거나 포탈인 경우 이동 허용
        if (tile && (tile.type === 'empty' || tile.type === 'portal')) {
          player.pos.x = targetX;
          player.pos.y = targetY;
          moved = true;
        } 
        // 벽이 아닌 타일(광물 등)과 충돌하면 채굴 모드로 전환
        else if (tile && tile.type !== 'wall') {
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
  // 현재 깊이 갱신
  player.stats.depth = Math.max(0, Math.floor(player.pos.y) - BASE_DEPTH);
  if (player.stats.depth > player.stats.maxDepthReached) {
    player.stats.maxDepthReached = player.stats.depth;
  }

  // 선형 보간(LERP)을 이용한 부드러운 이동 효과 (그리드를 따라 부드럽게 미끄러지는 느낌)
  const lerpFactor = 0.25;
  player.visualPos.x += (player.pos.x - player.visualPos.x) * lerpFactor;
  player.visualPos.y += (player.pos.y - player.visualPos.y) * lerpFactor;

  // 3. 펫 드론 추적 (관성 이동 및 띄워놓기)
  if (player.stats.equippedDroneId) {
    if (!world.activeDrone || world.activeDrone.id !== player.stats.equippedDroneId) {
      // 새로운 드론 소환 (플레이어 위쪽)
      world.activeDrone = {
        id: player.stats.equippedDroneId,
        x: player.visualPos.x * TILE_SIZE,
        y: player.visualPos.y * TILE_SIZE - TILE_SIZE,
        vx: 0,
        vy: 0,
        targetX: null,
        targetY: null,
        lastHitTime: 0
      };
    } else {
      // 드론 관성 추적 로직 (픽셀 단위 좌표계)
      // 플레이어 어깨 너머(왼쪽 위 약간)를 목표점으로 삼음
      const dx = (player.visualPos.x * TILE_SIZE - TILE_SIZE * 0.8) - world.activeDrone.x;
      const dy = (player.visualPos.y * TILE_SIZE - TILE_SIZE * 0.8) - world.activeDrone.y;
      
      // 스프링 가속도
      world.activeDrone.vx += dx * 0.05;
      world.activeDrone.vy += dy * 0.05;
      
      // 마찰력 부여 (탄성을 줄여서 너무 안 튕기게)
      world.activeDrone.vx *= 0.8;
      world.activeDrone.vy *= 0.8;
      
      world.activeDrone.x += world.activeDrone.vx;
      world.activeDrone.y += world.activeDrone.vy;
      
      // 채굴 타겟 정보 갱신을 대비하여 일단 렌더링용 진동 추가 가능, 지금은 물리에 전념
    }
  } else {
    world.activeDrone = null;
  }
};
