import { GameWorld } from '@/entities/world/model';
import { MINERALS } from '@/shared/config/mineralData';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 게임 내 비주얼 효과(파티클, 플로팅 텍스트)의 생명 주기와 물리적 변화를 관리하는 시스템입니다.
 * 
 * @param world - 게임 월드 상태 객체
 * @param deltaTime - 지난 프레임과의 시간 차이 (밀리초)
 */
export const effectSystem = (world: GameWorld, deltaTime: number) => {
  const { particles, floatingTexts } = world;

  // 0. 화면 흔들림(Shake) 감쇄 (삭제된 로직 복원)
  if (world.shake > 0) {
    // 0.8배로 감쇄하여 더욱 짧고 깔끔한 진동 느낌을 줌
    world.shake *= Math.pow(0.8, deltaTime / 16.6);
    if (world.shake < 0.1) world.shake = 0;
  }

  // 1. 파티클(파편) 업데이트
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.active) continue;

    const dtFactor = deltaTime / 16.6;
    p.x += p.vx * dtFactor;
    p.y += p.vy * dtFactor;
    p.vy += 0.2 * dtFactor; // 중력 가속도 적용
    p.life -= 0.02 * dtFactor; // 프레임 레이트에 따른 수명 소모 조절
    
    // 수명이 다한 파티클 비활성화 (풀반환)
    if (p.life <= 0) {
      p.active = false;
    }
  }

  // 2. 플로팅 텍스트(데미지 표시 등) 업데이트
  for (let i = 0; i < floatingTexts.length; i++) {
    const ft = floatingTexts[i];
    if (!ft.active) continue;

    const dtFactor = deltaTime / 16.6;
    ft.y -= 1 * dtFactor; // 서서히 위로 떠오름
    ft.life -= 0.01 * dtFactor; // 서서히 투명해지며 소멸

    // 수명이 다한 텍스트 비활성화 (풀반환)
    if (ft.life <= 0) {
      ft.active = false;
    }
  }

  // 3. 드랍된 아이템(물리 및 자석 효과) 업데이트
  for (let i = world.droppedItems.length - 1; i >= 0; i--) {
    const item = world.droppedItems[i];
    const dtSeconds = deltaTime / 1000;
    
    // 생명 주기 증가
    item.life += dtSeconds;

    if (item.life < 0.5) {
      // 0.5초 전: 물리 튕김 적용
      item.vy += 0.4; // 중력
      
      const nextX = item.x + item.vx;
      const nextY = item.y + item.vy;

      // 바닥 충돌 체크 (하단 중앙 기준)
      const tileX = Math.floor(nextX / TILE_SIZE);
      const tileY = Math.floor(nextY / TILE_SIZE);
      const tile = world.tileMap.getTile(tileX, tileY);

      if (tile && tile.type !== 'empty' && tile.type !== 'portal' && tile.type !== 'wall') {
        // 바닥과 부딪히면 튕김
        item.vy = -item.vy * 0.4; // 반발 계수
        item.vx *= 0.8; // 바닥 마찰
        
        // 블록 내부로 パ고들지 않도록 y 보정
        if (Math.abs(item.vy) > 0.5) {
          item.y = tileY * TILE_SIZE - 1;
        } else {
          item.vy = 0; // 너무 튕기는 게 줄어들면 멈춤
          item.y += item.vy; 
        }
        item.x += item.vx;
      } else {
        item.x = nextX;
        item.y = nextY;
      }
    } else {
      // 0.5초 이후: 플레이어에게 자석처럼 끌려감
      const px = world.player.visualPos.x * TILE_SIZE + TILE_SIZE / 2;
      const py = world.player.visualPos.y * TILE_SIZE + TILE_SIZE / 2;
      
      const dx = px - item.x;
      const dy = py - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 자석 드론이 장착되어 있으면 획득 및 끌어당기는 범위가 크게 증가
      const hasMagnet = world.player.stats.equippedDroneId === 'magnet_drone';
      const pickupRadius = hasMagnet ? 80 : 30;

      if (dist < pickupRadius) { // 획득 거리
        // 1. 인벤토리에 추가
        if (world.player.stats.inventory[item.type] !== undefined) {
          world.player.stats.inventory[item.type]++;
        }
        // 2. 알림 텍스트 표시 (요청에 의해 제거됨)
        
        // 3. 배열에서 제거
        world.droppedItems.splice(i, 1);
        continue;
      } else {
        // 플레이어를 향해 가속 (가속도 적용)
        const accel = hasMagnet ? 4.0 : 1.5;
        item.vx += (dx / dist) * accel;
        item.vy += (dy / dist) * accel;
        
        // 공기 저항/마찰력(Damping)을 주어 궤도 뱅글뱅글(Orbit) 무한 루프 현상 방지
        item.vx *= 0.85;
        item.vy *= 0.85;

        // 최대 속도 제한
        const maxSpeed = hasMagnet ? 25 : 15;
        const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
        if (speed > maxSpeed) {
          item.vx = (item.vx / speed) * maxSpeed;
          item.vy = (item.vy / speed) * maxSpeed;
        }

        item.x += item.vx;
        item.y += item.vy;
      }
    }
  }
};
