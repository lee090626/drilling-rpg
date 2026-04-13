import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 투사체(Projectile) 렌더링 및 회전 애니메이션을 처리합니다.
 */
export function updateProjectileRenderer(
  idx: number,
  soa: any,
  container: PIXI.Container,
  textures: any,
) {
  const ew = soa.width[idx] || TILE_SIZE;
  const eh = soa.height[idx] || TILE_SIZE;

  container.x = soa.x[idx];
  container.y = soa.y[idx];

  const body = container.getChildByLabel('body') as PIXI.Sprite;
  if (body) {
    body.texture = textures['Fireball.png'] || textures['Fireball'] || PIXI.Texture.WHITE;
    if (body.texture === PIXI.Texture.WHITE) {
      body.tint = 0xffaa00;
    } else {
      body.tint = 0xffffff;
    }
    body.width = ew;
    body.height = eh;

    // 투사체 회전 (진행 방향 기반)
    const angle = Math.atan2(soa.vy[idx], soa.vx[idx]);
    body.rotation = angle + Math.PI / 2;
    body.anchor.set(0.5, 0.5);
    body.position.set(ew / 2, eh / 2);
  }

  if (container.alpha < 1) {
    container.alpha += 0.05;
    if (container.alpha > 1) container.alpha = 1;
  }
}
