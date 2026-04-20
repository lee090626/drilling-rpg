import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 부동 텍스트(대미지, 자원 획득 등)의 물리 업데이트 및 자석 효과를 관리합니다.
 * @param world - 게임 월드
 * @param deltaTime - 프레임 델타 시간 (ms)
 */
export const updateFloatingTexts = (world: GameWorld, deltaTime: number) => {
  const { floatingTexts } = world;
  const dtFactor = deltaTime / 16.6;

  for (let i = 0; i < floatingTexts.length; i++) {
    const ft = floatingTexts[i];
    if (!ft.active) continue;

    if (ft.vx !== undefined && ft.vy !== undefined) {
      // 위치 업데이트
      ft.x += ft.vx * dtFactor;
      ft.y += ft.vy * dtFactor;
      
      // 물리 효과 적용
      ft.vy += 0.25 * dtFactor; // 중력
      ft.vx *= 0.98; // 마찰

      // 자원 텍스트 자석 효과 (플레이어 추적)
      const isResource = ft.text.includes('G') || ft.text.includes('+');
      if (isResource && ft.life < 0.7) {
        const px = world.player.visualPos.x * TILE_SIZE + TILE_SIZE / 2;
        const py = world.player.visualPos.y * TILE_SIZE + TILE_SIZE / 2;

        const dx = px - ft.x;
        const dy = py - ft.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          const force = 0.15 * dtFactor;
          ft.vx += (dx / dist) * force;
          ft.vy += (dy / dist) * force;
          ft.life -= 0.01 * dtFactor;
        }
      }
    } else {
      // 일반 부동 텍스트 (단순 수직 상승)
      ft.y -= 1 * dtFactor;
    }

    ft.life -= 0.012 * dtFactor; // 수명 감소

    if (ft.life <= 0) {
      ft.active = false;
    }
  }
};
