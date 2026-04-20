import { GameWorld } from '@/entities/world/model';

/**
 * 게임 내 모든 파티클의 물리 업데이트 및 생명주기를 관리합니다.
 * @param world - 게임 월드
 * @param deltaTime - 프레임 델타 시간 (ms)
 */
export const updateParticles = (world: GameWorld, deltaTime: number) => {
  const { particles } = world;
  const dtFactor = deltaTime / 16.6;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.active) continue;

    p.x += p.vx * dtFactor;
    p.y += p.vy * dtFactor;
    p.vy += 0.2 * dtFactor; // 중력 적용
    p.life -= 0.02 * dtFactor; // 수명 감소

    if (p.life <= 0) {
      p.active = false;
    }
  }
};
