import * as PIXI from 'pixi.js';
import { MONSTER_DEFINITIONS } from '@/shared/config/monsterData';
import { getSafeTexture } from '@/shared/lib/assetUtils';
import { TILE_SIZE } from '@/shared/config/constants';
import { updateHPBarFromSoA, updateCastBarFromSoA, updateStatusVFX } from './uiComponents';

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
    // [버그 수정] 투사체 풀링 후 재사용 시 남아있는 변환 속성 완전 초기화
    body.rotation = 0;
    body.anchor.set(0, 0);
    body.position.set(0, 0);
    container.rotation = 0; // 컨테이너 자체 회전도 리셋
    const defIdx = soa.monsterDefIndex[idx];
    const mobDef = MONSTER_DEFINITIONS[defIdx];

    if (mobDef) {
      const texture = getSafeTexture(textures, mobDef.imagePath, 'LustfulWhisperer');
      body.tint = 0xffffff;
      if (type === 2) body.tint = 0xffcccc;

      if (body.texture !== texture) {
        body.texture = texture;
        body.width = ew;
        body.height = eh;
      }
    }
  }

  // 보스 특수 애니메이션 (기존 로직 제거됨)
  if (type === 2 && body) {
    body.y = 0;
  }

  updateStatusVFX(container, player.stats.activeEffects || [], ew, eh, now);
  updateHPBarFromSoA(idx, soa, player, container);
  updateCastBarFromSoA(idx, soa, container, now);

  if (container.alpha < 1) {
    container.alpha += 0.05;
    if (container.alpha > 1) container.alpha = 1;
  }
}
