import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE, BASE_DEPTH, CAMERA_SCALE } from '../../shared/config/constants';
import { getTileIndex, getTileColor } from '../../shared/lib/tileUtils';
import { MINERALS } from '../../shared/config/mineralData';
import { renderEntities } from './entityRenderer';

/**
 * 캔버스 API를 사용하여 게임의 모든 시각적 요소를 화면에 그리는 시스템입니다.
 * [v2] 에셋 부재 시에도 방어적으로 렌더링하며, 컨텍스트를 활용합니다.
 */
export const renderSystem = (world: GameWorld, canvas: HTMLCanvasElement | OffscreenCanvas, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
  const { player, tileMap, entities, particles, floatingTexts, assets, baseLayout } = world;

  // 1. 캔버스 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 지상 배경 - 하늘색
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // 화면 중앙 정렬 및 카메라 스케일 적용
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(CAMERA_SCALE, CAMERA_SCALE);
  
  const shakeX = Math.round((Math.random() - 0.5) * world.shake * 2);
  const shakeY = Math.round((Math.random() - 0.5) * world.shake * 2);
  
  const camX = Math.round(-(player.visualPos.x * TILE_SIZE + TILE_SIZE / 2) + shakeX);
  const camY = Math.round(-(player.visualPos.y * TILE_SIZE + TILE_SIZE / 2) + shakeY);

  ctx.translate(camX, camY);

  // 지하 배경 - 검은색 (BASE_DEPTH 아래)
  ctx.fillStyle = '#000000';
  ctx.fillRect(
    (player.visualPos.x - 30) * TILE_SIZE, 
    BASE_DEPTH * TILE_SIZE, 
    60 * TILE_SIZE, 
    2000 * TILE_SIZE
  );

  // 뷰포트 범위 계산
  const startTileX = Math.floor(player.visualPos.x - 15);
  const endTileX = Math.ceil(player.visualPos.x + 15);
  const startTileY = Math.floor(player.visualPos.y - 10);
  const endTileY = Math.ceil(player.visualPos.y + 10);

  // 2. 지상 베이스 캠프 레이아웃 (현재 뷰포트에 지상이 포함될 때만)
  if (baseLayout && assets.baseTileset) {
    const layoutHeight = baseLayout.length;
    const viewStartAtBase = Math.max(0, startTileY);
    const viewEndAtBase = Math.min(layoutHeight - 1, endTileY);

    for (let y = viewStartAtBase; y <= viewEndAtBase; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        let tileIdx = 0;
        if (x >= 0 && x < baseLayout[y].length) tileIdx = baseLayout[y][x];
        if (tileIdx === -1) continue;

        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;
        ctx.drawImage(
          assets.baseTileset, 
          (tileIdx % 5) * 128, Math.floor(tileIdx / 5) * 128, 128, 128, 
          drawX, drawY, TILE_SIZE, TILE_SIZE
        );
      }
    }
  }

  // 3. 지하 타일 렌더링
  for (let y = Math.max(BASE_DEPTH, startTileY); y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      const tile = tileMap.getTile(x, y);
      if (!tile || tile.type === 'empty') continue;

      const drawX = x * TILE_SIZE;
      const drawY = y * TILE_SIZE;

      // 이미지 비트맵이 있으면 사용, 없으면 색상 채우기
      const bitmap = assets.tileBitmaps ? assets.tileBitmaps[tile.type] : null;
      if (bitmap) {
        ctx.drawImage(bitmap, drawX, drawY, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = getTileColor(tile.type);
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // 4. 엔티티 및 플레이어 렌더링
  renderEntities(world, ctx as any);

  // 플레이어 본체 렌더링 (카메라 중심 보정)
  // 카메라가 -(player.visualPos.x * TILE_SIZE + TILE_SIZE/2) 만큼 이동해 있으므로
  // 플레이어 역시 같은 위치에 그려야 화면 정중앙에 위치함
  const pX = player.visualPos.x * TILE_SIZE;
  const pY = player.visualPos.y * TILE_SIZE;
  
  if (assets.player) {
    ctx.drawImage(assets.player, pX, pY, TILE_SIZE, TILE_SIZE);
  } else {
    // 플레이어 에셋 로딩 전 폴백 (강렬한 색상으로 위치 확인)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(pX, pY, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(pX, pY, TILE_SIZE, TILE_SIZE);
  }

  // 4-1. 채굴/공격 타겟팅 표시
  if (player.isDrilling && world.intent.miningTarget) {
    const tx = world.intent.miningTarget.x * TILE_SIZE;
    const ty = world.intent.miningTarget.y * TILE_SIZE;
    
    ctx.strokeStyle = '#ef4444'; // 빨간색
    ctx.lineWidth = 3;
    ctx.strokeRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }

  // 4-2. 드랍된 아이템 렌더링
  world.droppedItems.forEach(item => {
    const itemW = 40;
    const itemH = 40;
    // 아이템 이미지 비트맵이 있으면 사용, 없으면 이모지로 대체
    const bitmap = assets.itemBitmaps ? assets.itemBitmaps[item.type] : null;
    if (bitmap) {
      ctx.drawImage(bitmap, item.x - itemW / 2, item.y - itemH / 2, itemW, itemH);
    } else {
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💎', item.x, item.y);
    }
  });

  // 5. 효과 렌더링 (파티클, 플로팅 텍스트)
  particles.forEach(p => {
    if (!p.active) return;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;

  floatingTexts.forEach(ft => {
    if (!ft.active) return;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${10 + ft.life * 10}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  ctx.restore();
};
