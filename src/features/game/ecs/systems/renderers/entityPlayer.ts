import * as PIXI from 'pixi.js';
import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { updateStatusVFX } from './uiComponents';

/**
 * 플레이어 전용 절차적 애니메이션 및 렌더링을 처리합니다.
 */
export function updatePlayerRenderer(world: GameWorld, entity: any, container: PIXI.Container, now: number) {
  const body = container.getChildByLabel('body') as PIXI.Sprite;
  if (!body) return;

  // 1. 위치 동기화
  container.x = entity.visualPos.x * TILE_SIZE;
  container.y = entity.visualPos.y * TILE_SIZE;

  // 2. 피격 효과 ( Hit Flash )
  const isHit = now - (entity.lastHitTime || 0) < 100;
  body.alpha = isHit ? 0.7 : 1.0;

  // 3. 절차적 애니메이션
  const isDrilling = entity.isDrilling;
  const dx = entity.pos.x - entity.visualPos.x;
  const dy = entity.pos.y - entity.visualPos.y;
  const isMoving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

  if (body.anchor.y !== 1) {
    body.anchor.set(0.5, 1);
    body.position.set(TILE_SIZE / 2, TILE_SIZE);
  }

  const baseScaleX = TILE_SIZE / (body.texture.width || TILE_SIZE);
  const baseScaleY = TILE_SIZE / (body.texture.height || TILE_SIZE);
  body.rotation = 0;

  const pContainer = container as any;
  if (pContainer.lastFlip === undefined) pContainer.lastFlip = 1;

  if (isDrilling) {
    const jitterX = (Math.random() - 0.5) * 4;
    const jitterY = (Math.random() - 0.5) * 4;
    body.position.set(TILE_SIZE / 2 + jitterX, TILE_SIZE + jitterY);
    const sX = 1.05 + Math.sin(now / 30) * 0.05;
    const sY = 0.95 + Math.sin(now / 30) * 0.05;
    body.scale.set(baseScaleX * sX * pContainer.lastFlip, baseScaleY * sY);
  } else if (isMoving) {
    const bounce = Math.abs(Math.sin(now / 150)) * 0.15;
    const sX = 1 + bounce * 0.5;
    const sY = 1 - bounce;
    const tilt = Math.sin(now / 150) * 0.1;
    body.rotation = tilt;
    if (world.intent.moveX !== 0) {
      pContainer.lastFlip = world.intent.moveX > 0 ? 1 : -1;
    } else if (Math.abs(dx) > 0.1) {
      pContainer.lastFlip = dx < 0 ? -1 : 1;
    }
    body.scale.set(baseScaleX * sX * pContainer.lastFlip, baseScaleY * sY);
    body.position.set(TILE_SIZE / 2, TILE_SIZE);
  } else {
    const brew = Math.sin(now / 600) * 0.03;
    body.scale.set(baseScaleX * (1 + brew) * pContainer.lastFlip, baseScaleY * (1 - brew));
    body.position.set(TILE_SIZE / 2, TILE_SIZE);
  }

  updateStatusVFX(container, entity.stats.activeEffects || [], TILE_SIZE, TILE_SIZE, now);
}
