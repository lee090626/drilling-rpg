import * as PIXI from 'pixi.js';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 렌더링 메모리 최적화를 위한 정적 스타일 상수
 */
const STYLES = {
  HP_BG_FILL: { color: 0x09090b, alpha: 0.8 },
  HP_BG_STROKE: { color: 0xffffff, alpha: 0.3, width: 1, alignment: 0 as any },
  HP_GREEN: { color: 0x10b981 },
  HP_AMBER: { color: 0xf59e0b },
  HP_ROSE: { color: 0xef4444 },
} as const;

/**
 * 상태 이상 시각 효과(VFX) 렌더링 (STUN 등)
 */
export function updateStatusVFX(
  container: PIXI.Container,
  effects: any[],
  width: number,
  height: number,
  now: number,
) {
  const isStunned = effects.some((e) => e.type === 'STUN');
  let stunVFX = container.getChildByLabel('stunVFX') as PIXI.Container;

  if (isStunned) {
    if (!stunVFX) {
      stunVFX = new PIXI.Container();
      stunVFX.label = 'stunVFX';
      stunVFX.y = -TILE_SIZE * 0.4;

      for (let i = 0; i < 3; i++) {
        const star = new PIXI.Text({ text: '⭐', style: { fontSize: 14 } });
        star.anchor.set(0.5, 0.5);
        star.label = `star_${i}`;
        stunVFX.addChild(star);
      }
      container.addChild(stunVFX);
    }
    stunVFX.visible = true;

    const count = stunVFX.children.length;
    for (let i = 0; i < count; i++) {
      const star = stunVFX.children[i];
      const angle = now / 200 + i * ((Math.PI * 2) / 3);
      star.x = width / 2 + Math.cos(angle) * 20;
      star.y = Math.sin(angle) * 8;
    }
  } else if (stunVFX) {
    stunVFX.visible = false;
  }
}

/**
 * 공격 예고 인디케이터 (!) 업데이트
 */
export function updateAttackIndicatorFromSoA(
  idx: number,
  soa: any,
  container: PIXI.Container,
  now: number,
) {
  const indicator = container.getChildByLabel('attackIndicator') as PIXI.Text;
  if (!indicator) return;

  const attackCooldown = soa.attackCooldown[idx];
  const lastAttack = soa.lastAttackTime[idx];
  const timeSinceLastAttack = lastAttack ? now - lastAttack : attackCooldown;
  const isTelegraphing = timeSinceLastAttack > attackCooldown - 300;
  indicator.visible = isTelegraphing;

  if (isTelegraphing) {
    const pulse = 1 + Math.sin(now / 50) * 0.2;
    indicator.scale.set(pulse);
  }
}

/**
 * 엔티티 HP Bar 업데이트
 */
export function updateHPBarFromSoA(idx: number, soa: any, player: any, container: PIXI.Container) {
  const hpBar = container.getChildByLabel('hpBar') as PIXI.Graphics;
  if (!hpBar) return;

  const ex = soa.x[idx];
  const ey = soa.y[idx];
  const hp = soa.hp[idx];
  const maxHp = soa.maxHp[idx];
  const entW = soa.width[idx] || TILE_SIZE;
  const entH = soa.height[idx] || TILE_SIZE;

  const dx = player.pos.x * TILE_SIZE - ex;
  const dy = player.pos.y * TILE_SIZE - ey;
  const distSq = dx * dx + dy * dy;
  const shouldShowHP = hp < maxHp || distSq < 1638400; // (TILE_SIZE * 8)^2 = 40^2 * 64 = 1600 * 64 = 102400? (TILE_SIZE=128 기준 1024^2=1048576)

  hpBar.visible = shouldShowHP;
  if (!shouldShowHP) return;

  const barW = entW - 12;
  const barH = 6;
  const barX = 6;
  const barY = entH - barH - 4;
  const currentRatio = Math.max(0, Math.min(1, hp / maxHp));

  hpBar.clear();
  hpBar
    .roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2)
    .fill(STYLES.HP_BG_FILL)
    .stroke(STYLES.HP_BG_STROKE);

  if (currentRatio > 0) {
    let hpColor: { readonly color: number } = STYLES.HP_GREEN;
    if (currentRatio < 0.25) hpColor = STYLES.HP_ROSE;
    else if (currentRatio < 0.5) hpColor = STYLES.HP_AMBER;

    hpBar.roundRect(barX, barY, barW * currentRatio, barH, 1).fill(hpColor);
  }
}
