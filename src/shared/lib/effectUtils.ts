import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../config/constants';

/**
 * 타일 파괴 시 또는 피격 시 사방으로 흩어지는 파편 파티클을 생성합니다.
 */
export const createParticles = (world: GameWorld, x: number, y: number, color: string, count: number = 8) => {
  for (let i = 0; i < count; i++) {
    world.particles.push({
      x: x + TILE_SIZE / 2,
      y: y + TILE_SIZE / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 2,
      life: 1.0,
      color: color,
      size: Math.random() * 4 + 2,
    });
  }
};

/**
 * 화면에 일시적으로 표시될 플로팅 텍스트(대미지, 골드 획득 등)를 생성합니다.
 */
export const createFloatingText = (world: GameWorld, x: number, y: number, text: string, color: string, life: number = 1.0) => {
  world.floatingTexts.push({
    x: x + TILE_SIZE / 2,
    y: y,
    text: text,
    color: color,
    life: life,
  });
};
