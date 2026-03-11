import { GameWorld } from '../../entities/world/model';

export const effectSystem = (world: GameWorld, deltaTime: number) => {
  const { particles, floatingTexts } = world;

  // 1. Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // Gravity
    p.life -= 0.02 * (deltaTime / 16.6); // Adjust by frame rate
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // 2. Update Floating Texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 1 * (deltaTime / 16.6); // Float up
    ft.life -= 0.01 * (deltaTime / 16.6);

    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
};
