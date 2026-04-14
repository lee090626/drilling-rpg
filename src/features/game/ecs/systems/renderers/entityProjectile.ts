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
  let procG = container.getChildByLabel('procG') as PIXI.Graphics;

  if (body) {
    const texture = textures['FireBall.png'] || textures['FireBall'];
    if (texture) {
      body.texture = texture;
      body.visible = true;
      if (procG) procG.visible = false;
      body.width = ew;
      body.height = eh;
      const angle = Math.atan2(soa.vy[idx], soa.vx[idx]);
      body.rotation = angle + Math.PI / 2;
      body.anchor.set(0.5, 0.5);
      body.position.set(ew / 2, eh / 2);
    } else {
      body.visible = false;
      if (!procG) {
        procG = new PIXI.Graphics();
        procG.label = 'procG';
        container.addChild(procG);
      }
      procG.visible = true;
      procG.clear();
      // 광채 (주황색 글로우)
      procG.circle(ew / 2, eh / 2, ew / 2).fill({ color: 0xff4400, alpha: 0.5 });
      // 핵 (노란색)
      procG.circle(ew / 2, eh / 2, ew / 3).fill({ color: 0xffcc00, alpha: 0.8 });
      // 화이트 코어 (가시성 극대화)
      procG.circle(ew / 2, eh / 2, ew / 5).fill({ color: 0xffffff, alpha: 1.0 });
    }
  }

  if (container.alpha < 1) {
    container.alpha += 0.05;
    if (container.alpha > 1) container.alpha = 1;
  }
}
