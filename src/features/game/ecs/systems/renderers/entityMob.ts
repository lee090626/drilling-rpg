import * as PIXI from 'pixi.js';
import { MONSTER_DEFINITIONS } from '@/shared/config/monsterData';
import { getSafeTexture } from '@/shared/lib/assetUtils';
import { TILE_SIZE } from '@/shared/config/constants';
import { updateHPBarFromSoA, updateAttackIndicatorFromSoA, updateStatusVFX } from './uiComponents';

/**
 * SoA 엔티티(몬스터, 보스) 렌더링을 처리합니다.
 */
export function updateMobRenderer(
  idx: number,
  soa: any,
  player: any,
  container: PIXI.Container,
  now: number,
  textures: any,
) {
  const type = soa.type[idx];
  const ew = soa.width[idx] || TILE_SIZE;
  const eh = soa.height[idx] || TILE_SIZE;

  container.x = soa.x[idx];
  container.y = soa.y[idx];

  const body = container.getChildByLabel('body') as PIXI.Sprite;
  if (body) {
    const defIdx = soa.monsterDefIndex[idx];
    const mobDef = MONSTER_DEFINITIONS[defIdx];

    if (mobDef) {
      const texture = getSafeTexture(textures, mobDef.imagePath, 'LustfulWhisperer');
      body.tint = 0xffffff;
      if (type === 2) body.tint = 0xffcccc;

      if (body.texture !== texture) {
        body.texture = texture;
        body.width = ew * (type === 2 ? 1.2 : 1.0);
        body.height = eh * (type === 2 ? 1.2 : 1.0);
      }
    }
  }

  // 보스 특수 애니메이션 (Jump & Fall)
  if (type === 2 && body) {
    const jumpState = soa.state[idx];
    let yOffset = 0;
    const cycleTime = 1000;
    const elapsed = now % cycleTime;

    if (jumpState === 2) yOffset = -(elapsed / cycleTime) * 400;
    else if (jumpState === 3) yOffset = -400 + (elapsed / cycleTime) * 400;

    body.y = yOffset;

    let shadow = container.getChildByLabel('shadow') as PIXI.Graphics;
    if (yOffset < -10) {
      if (!shadow) {
        shadow = new PIXI.Graphics()
          .ellipse(ew / 2, eh, ew / 2, eh / 4)
          .fill({ color: 0x000000, alpha: 0.3 });
        shadow.label = 'shadow';
        container.addChildAt(shadow, 0);
      }
      shadow.visible = true;
      shadow.scale.set(1 + yOffset / 800);
    } else if (shadow) {
      shadow.visible = false;
    }
  }

  updateStatusVFX(container, player.stats.activeEffects || [], ew, eh, now);
  updateHPBarFromSoA(idx, soa, player, container);
  updateAttackIndicatorFromSoA(idx, soa, container, now);

  if (container.alpha < 1) {
    container.alpha += 0.05;
    if (container.alpha > 1) container.alpha = 1;
  }
}
