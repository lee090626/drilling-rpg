import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '../config/constants';

/**
 * 타일 파괴 시 또는 피격 시 사방으로 흩어지는 파편 파티클을 생성합니다.
 */
export const createParticles = (world: GameWorld, x: number, y: number, color: string, count: number = 8) => {
  for (let i = 0; i < count; i++) {
    const p = world.particlePool.get();
    if (p) {
      p.x = x + TILE_SIZE / 2;
      p.y = y + TILE_SIZE / 2;
      p.vx = (Math.random() - 0.5) * 10;
      p.vy = (Math.random() - 0.5) * 10 - 2;
      p.life = 1.0;
      p.color = color;
      p.size = Math.random() * 4 + 2;
      p.active = true;
    }
  }
};

export const createFloatingText = (world: GameWorld, x: number, y: number, text: string, color: string, life: number = 1.0) => {
  const ft = world.floatingTextPool.get();
  if (ft) {
    // x, y는 픽셀 단위 좌표. x에 TILE_SIZE/2를 더해 타일 중앙을 가리키도록 함.
    ft.x = x + TILE_SIZE / 2;
    ft.y = y;
    ft.text = text;
    ft.color = color;
    ft.life = life;
    ft.active = true;
  }
};
