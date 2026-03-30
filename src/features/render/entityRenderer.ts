import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';
import { DRONES } from '../../shared/config/droneData';

/**
 * 게임 내 모든 엔티티(NPC, 몬스터, 보스, 드론 등)를 렌더링하는 헬퍼 시스템입니다.
 */
export const renderEntities = (world: GameWorld, ctx: CanvasRenderingContext2D) => {
  const { entities, assets, activeDrone } = world;

  // 1. 일반 엔티티 렌더링 (NPC, 몬스터, 보스)
  entities.forEach(entity => {
    const entW = (entity.width || 1) * TILE_SIZE;
    const entH = (entity.height || 1) * TILE_SIZE;
    
    // 몬스터와 보스는 그리드에 딱 맞게 타일과 동일한 방식으로 렌더링
    const isGridEntity = entity.type === 'monster' || entity.type === 'boss';
    const drawX = isGridEntity ? entity.x * TILE_SIZE : entity.x * TILE_SIZE - entW / 2;
    const drawY = isGridEntity ? entity.y * TILE_SIZE : entity.y * TILE_SIZE - entH;

    // 1-1. 본체 렌더링
    const img = assets.entities[entity.imagePath || ''];
    if (img) {
      ctx.drawImage(img, drawX, drawY, entW, entH);
    } else if (entity.imagePath && entity.type === 'monster') {
      // 이모지 등을 텍스트로 렌더링
      ctx.font = `${Math.floor(entW * 0.8)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(entity.imagePath, drawX + entW / 2, drawY + entH / 2);
    } else {
      ctx.fillStyle = entity.type === 'monster' ? '#ef4444' : '#eab308';
      ctx.fillRect(drawX, drawY, entW, entH);
    }

    // 1-2. HP 바 렌더링
    if (entity.stats && entity.stats.hp < entity.stats.maxHp) {
      renderHPBar(ctx, drawX, drawY - 10, entW, entity.stats.hp, entity.stats.maxHp);
    }

    // 1-3. 보스 이름 표시
    if (entity.type === 'boss') {
       ctx.font = 'bold 14px Arial';
       ctx.fillStyle = 'white';
       ctx.textAlign = 'center';
       ctx.fillText(entity.name, drawX + entW/2, drawY - 15);
    }
  });

  // 2. 펫 드론 및 레이저 렌더링
  if (activeDrone) {
    renderDrone(world, ctx);
  }
};

/**
 * 엔티티의 HP 바를 그립니다.
 */
function renderHPBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, hp: number, maxHp: number) {
  const barW = width * 0.8;
  const barH = 5;
  const barX = x + (width - barW) / 2;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(barX, y, barW, barH);
  
  const ratio = Math.max(0, hp / maxHp);
  ctx.fillStyle = ratio > 0.3 ? '#22c55e' : '#ef4444';
  ctx.fillRect(barX, y, barW * ratio, barH);
}

/**
 * 활성화된 드론과 채굴 레이저를 그립니다.
 */
function renderDrone(world: GameWorld, ctx: CanvasRenderingContext2D) {
  const { activeDrone } = world;
  if (!activeDrone) return;

  const droneConfig = DRONES[activeDrone.id];
  
  ctx.save();
  // 레이저 타겟팅 이펙트
  if (activeDrone.targetX !== null && activeDrone.targetY !== null) {
    ctx.beginPath();
    ctx.moveTo(activeDrone.x, activeDrone.y);
    ctx.lineTo(activeDrone.targetX, activeDrone.targetY);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(activeDrone.x, activeDrone.y);
    ctx.lineTo(activeDrone.targetX, activeDrone.targetY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // 드론 본체
  ctx.translate(activeDrone.x, activeDrone.y);
  const hoverY = Math.sin(Date.now() / 200) * 4; 
  ctx.translate(0, hoverY);
  
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'cyan';
  ctx.shadowBlur = 15;
  
  const icon = droneConfig ? droneConfig.icon : '🤖';
  ctx.fillText(icon, 0, 0); 
  ctx.restore();
}
