import * as PIXI from 'pixi.js';

/**
 * 피격 시 하얗게 번쩍이는 효과를 위한 ColorMatrixFilter 생성
 */
export const createHitFlashFilter = () => {
  const filter = new PIXI.ColorMatrixFilter();
  filter.brightness(3, false); // 밝기를 대폭 높여 흰색처럼 보이게 함
  return filter;
};

/**
 * 플레이어 주변 시야를 위한 방사형 그래디언트 마스크 (용도에 따라 Graphics로 대체 가능)
 */
export const createRadialLightMask = (radius: number) => {
  const graphics = new PIXI.Graphics();
  graphics.circle(0, 0, radius);
  graphics.fill({ color: 0xffffff, alpha: 1 });
  return graphics;
};
