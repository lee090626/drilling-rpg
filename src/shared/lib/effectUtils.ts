import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '../config/constants';

/**
 * 타일 파괴 시 또는 피격 시 사방으로 흩어지는 파편 파티클을 생성합니다.
 */
export const createParticles = (
  world: GameWorld,
  x: number,
  y: number,
  color: string,
  count: number = 8,
) => {
  for (let i = 0; i < count; i++) {
    const p = world.particlePool.get();
    if (p) {
      p.x = x + TILE_SIZE / 2;
      p.y = y + TILE_SIZE / 2;
      p.vx = (Math.random() - 0.5) * 15; // 10 -> 15
      p.vy = (Math.random() - 0.5) * 15 - 5; // 10-2 -> 15-5
      p.life = 1.0;
      p.color = color;
      p.size = Math.random() * 6 + 4; // 4+2 -> 6+4
      p.active = true;
    }
  }
};

export const createFloatingText = (
  world: GameWorld,
  x: number,
  y: number,
  text: string,
  color: string,
  life: number = 1.0,
) => {
  const ft = world.floatingTextPool.get();
  if (ft) {
    // x는 타일 기준일 경우 중앙 정렬을 위해 TILE_SIZE/2를 더해줌
    ft.x = x + (x < 2000 ? TILE_SIZE / 2 : 0); // 1000 -> 2000 (스케일 업 대응)
    ft.y = y;
    ft.text = text;
    ft.color = color;
    ft.life = life;
    ft.active = true;

    // 포물선 이동을 위한 초기 속도 부여 (약간의 랜덤성)
    ft.vx = (Math.random() - 0.5) * 4; // 2.5 -> 4
    ft.vy = -7 - Math.random() * 3; // -4-2 -> -7-3
  }
};
