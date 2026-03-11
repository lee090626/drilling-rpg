import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE, MAP_WIDTH, BASE_DEPTH, CAMERA_SCALE } from '../../shared/config/constants';
import { getTileIndex, getTileColor } from '../../shared/lib/tileUtils';

export const renderSystem = (world: GameWorld, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx || !world.assets.tileset) return;

  const { player, tileMap, entities, particles, floatingTexts, assets, baseLayout, intent } = world;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Surface Sky Background
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Deep Ground Background (Always black below threshold)
  const groundTop = BASE_DEPTH * TILE_SIZE;
  // We need to transform groundTop to screen space or draw it within the save/restore block

  ctx.save();
  // Center screen
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(CAMERA_SCALE, CAMERA_SCALE);
  // Center on player
  ctx.translate(
    -(player.visualPos.x * TILE_SIZE + TILE_SIZE / 2),
    -(player.visualPos.y * TILE_SIZE + TILE_SIZE / 2)
  );

  // Draw a huge black rectangle for the underground background
  ctx.fillStyle = '#000000';
  ctx.fillRect(-MAP_WIDTH * TILE_SIZE, BASE_DEPTH * TILE_SIZE, MAP_WIDTH * 3 * TILE_SIZE, 1000 * TILE_SIZE);

  // 0. Draw Base Layout (Surface)
  if (baseLayout && assets.baseTileset) {
    const startY = 0;
    const endY = baseLayout.length - 1;
    
    for (let y = startY; y <= endY; y++) {
      for (let x = 0; x < baseLayout[y].length; x++) {
        const tileIdx = baseLayout[y][x];
        if (tileIdx === -1) continue;

        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;
        const sx = (tileIdx % 5) * 128;
        const sy = Math.floor(tileIdx / 5) * 128;

        ctx.drawImage(
          assets.baseTileset,
          sx, sy, 128, 128,
          drawX, drawY, TILE_SIZE, TILE_SIZE
        );
      }
    }
  }

  // 1. Draw Tiles
  const startTileX = Math.floor(player.visualPos.x - 15);
  const endTileX = Math.ceil(player.visualPos.x + 15);
  const startTileY = Math.floor(player.visualPos.y - 10);
  const endTileY = Math.ceil(player.visualPos.y + 10);

  for (let y = startTileY; y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      const tile = tileMap.getTile(x, y);
      if (tile && tile.type !== 'empty') {
        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;

        // Base background (black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

        if (tile.type === 'portal') {
          // Pulse effect for portal
          const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
          ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + pulse * 0.4})`;
          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        }

        const tileIndex = getTileIndex(tile.type);
        const sourceX = (tileIndex % 5) * 128;
        const sourceY = Math.floor(tileIndex / 5) * 128;

        if (assets.tileset) {
          ctx.drawImage(
            assets.tileset,
            sourceX, sourceY, 128, 128, // 128x128 소스 크기
            drawX, drawY, TILE_SIZE, TILE_SIZE
          );
        }

        // Damage Progress (removed generic semi-transparent overlay)
      }
    }
  }

  // 2. Draw Entities
  entities.forEach(entity => {
    const entW = (entity.width || 1) * TILE_SIZE;
    const entH = (entity.height || 1) * TILE_SIZE;
    const drawX = entity.x * TILE_SIZE - entW / 2;
    const drawY = entity.y * TILE_SIZE - entH;

    const img = assets.entities[entity.imagePath || ''];
    if (img) {
      ctx.drawImage(img, drawX, drawY, entW, entH);
    } else {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(drawX, drawY, entW, entH);
    }
  });

  // 3. Draw Player
  if (assets.player) {
    const pw = TILE_SIZE * 1.5;
    const ph = TILE_SIZE * 1.5;
    // 물리 박스(1.0)의 중앙에 1.5 크기의 이미지를 배치
    const px = player.visualPos.x * TILE_SIZE - (pw - TILE_SIZE) / 2;
    const py = player.visualPos.y * TILE_SIZE - (ph - TILE_SIZE);
    
    // Drilling Shake Effect & Rendering
    const shakeSpeed = 50; // 진동 속도
    const shakeAmount = 2; // 진동 세기 (픽셀)
    let offsetX = 0;
    let offsetY = 0;

    if (player.isDrilling) {
      offsetX = (Math.random() - 0.5) * shakeAmount;
      offsetY = (Math.random() - 0.5) * shakeAmount;
    }

    if (player.isDrilling) {
      ctx.save();
      ctx.translate(px + pw / 2 + offsetX, py + ph / 2 + offsetY);
      ctx.rotate((Math.random() - 0.5) * 0.1);
      ctx.drawImage(assets.player, -pw / 2, -ph / 2, pw, ph);
      ctx.restore();
    } else {
      ctx.drawImage(assets.player, px, py, pw, ph);
    }
  }

  // 6. Draw Mining Highlight & Damage Progress Stroke
  if (intent.miningTarget && assets.tileset) {
    const { x, y } = intent.miningTarget;
    const drawX = x * TILE_SIZE;
    const drawY = y * TILE_SIZE;
    const tile = tileMap.getTile(x, y);
    
    const margin = 1.5;
    const size = TILE_SIZE - margin * 2;
    
    // Base Box Style
    ctx.strokeStyle = '#facc15'; // Yellow-400
    ctx.lineWidth = 3;
    
    // Pulse effect
    const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
    ctx.fillStyle = `rgba(250, 204, 21, ${0.1 + pulse * 0.15})`;
    ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

    if (tile && tile.health < tile.maxHealth) {
      // Draw Stroke Based on Health (Counter-Clockwise shrinking)
      const ratio = tile.health / tile.maxHealth;
      const totalPerimeter = size * 4;
      const drawLength = totalPerimeter * ratio;
      
      ctx.beginPath();
      ctx.moveTo(drawX + margin + size / 2, drawY + margin); // Start from Top-Center
      
      let currentLength = 0;
      
      // Top Right Half (1/8 perimeter)
      const p1 = size / 2;
      if (currentLength + p1 <= drawLength) {
        ctx.lineTo(drawX + margin + size, drawY + margin);
        currentLength += p1;
      } else {
        ctx.lineTo(drawX + margin + size / 2 + (drawLength - currentLength), drawY + margin);
        currentLength = drawLength;
      }
      
      // Right Side
      const p2 = size;
      if (currentLength < drawLength) {
        if (currentLength + p2 <= drawLength) {
          ctx.lineTo(drawX + margin + size, drawY + margin + size);
          currentLength += p2;
        } else {
          ctx.lineTo(drawX + margin + size, drawY + margin + (drawLength - currentLength));
          currentLength = drawLength;
        }
      }
      
      // Bottom Side
      const p3 = size;
      if (currentLength < drawLength) {
        if (currentLength + p3 <= drawLength) {
          ctx.lineTo(drawX + margin, drawY + margin + size);
          currentLength += p3;
        } else {
          ctx.lineTo(drawX + margin + size - (drawLength - currentLength), drawY + margin + size);
          currentLength = drawLength;
        }
      }
      
      // Left Side
      const p4 = size;
      if (currentLength < drawLength) {
        if (currentLength + p4 <= drawLength) {
          ctx.lineTo(drawX + margin, drawY + margin);
          currentLength += p4;
        } else {
          ctx.lineTo(drawX + margin, drawY + margin + size - (drawLength - currentLength));
          currentLength = drawLength;
        }
      }
      
      // Top Left Half
      const p5 = size / 2;
      if (currentLength < drawLength) {
        if (currentLength + p5 <= drawLength) {
          ctx.lineTo(drawX + margin + size / 2, drawY + margin);
        } else {
          ctx.lineTo(drawX + margin + (drawLength - currentLength), drawY + margin);
        }
      }
      
      ctx.stroke();
    } else {
       // Draw full box if untouched
       ctx.strokeRect(drawX + margin, drawY + margin, size, size);
    }
  }

  // 4. Draw Particles
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;

  // 5. Draw Floating Texts
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  floatingTexts.forEach(ft => {
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = ft.life;
    ctx.fillText(ft.text, ft.x, ft.y);
  });
  ctx.globalAlpha = 1.0;

  ctx.restore();
};
