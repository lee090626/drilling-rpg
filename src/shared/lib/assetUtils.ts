import * as PIXI from 'pixi.js';

/**
 * 아틀라스에서 안전하게 텍스처를 가져옵니다. 
 * 요청한 키가 없을 경우 fallbackKey나 기본 타일을 반환합니다.
 */
export function getSafeTexture(
  textures: { [key: string]: PIXI.Texture },
  key: string,
  fallbackKey: string = 'StoneTile'
): PIXI.Texture {
  if (textures[key]) return textures[key];
  if (textures[fallbackKey]) return textures[fallbackKey];
  
  // 모든 폴백이 실패하면 흰색 텍스처를 반환하여 크래시 방지
  return PIXI.Texture.WHITE;
}
