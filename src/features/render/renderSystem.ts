import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE, BASE_DEPTH, CAMERA_SCALE } from '../../shared/config/constants';
import { getTileIndex, getTileColor } from '../../shared/lib/tileUtils';
import { MINERALS } from '../../shared/config/mineralData';
import { DRONES } from '../../shared/config/droneData';
import { renderEntities } from './entityRenderer';

/**
 * 캔버스 API를 사용하여 게임의 모든 시각적 요소를 화면에 그리는 시스템입니다.
 * @param world 게임 월드 상태 객체
 * @param canvas 렌더링할 HTML 캔버스 엘리먼트
 */
export const renderSystem = (world: GameWorld, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  // 렌더링 컨텍스트 또는 타일셋 자산이 없으면 종료
  if (!ctx || !world.assets.tileset) return;

  const { player, tileMap, entities, particles, floatingTexts, assets, baseLayout, intent } = world;

  // 캔버스 초기화 (이전 프레임 지우기)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const now = Date.now();
  const timeSinceHit = now - player.lastHitTime;
  const isRecentlyHit = timeSinceHit < 80;

  // 지상 배경 - 하늘색
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // 화면 중앙 정렬 및 카메라 스케일 적용
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(CAMERA_SCALE, CAMERA_SCALE);
  // 카메라를 플레이어 위치에 고정 + 화면 흔들림 오프셋 적용
  // 픽셀 정렬(Pixel Snapping)을 위해 정수 단위로 반올림하여 틈새 현상 방지
  const shakeX = Math.round((Math.random() - 0.5) * world.shake * 2);
  const shakeY = Math.round((Math.random() - 0.5) * world.shake * 2);
  
  const camX = Math.round(-(player.visualPos.x * TILE_SIZE + TILE_SIZE / 2) + shakeX);
  const camY = Math.round(-(player.visualPos.y * TILE_SIZE + TILE_SIZE / 2) + shakeY);

  ctx.translate(camX, camY);

  // 지하 배경 - 플레이어 주변 범위를 검은색으로 채움 (무한한 땅 느낌)
  ctx.fillStyle = '#000000';
  ctx.fillRect(
    (player.visualPos.x - 30) * TILE_SIZE, 
    BASE_DEPTH * TILE_SIZE, 
    60 * TILE_SIZE, 
    1000 * TILE_SIZE
  );

  // 1. 현재 뷰포트에 보이는 타일 범위 계산 (최적화)
  const startTileX = Math.floor(player.visualPos.x - 15);
  const endTileX = Math.ceil(player.visualPos.x + 15);
  const startTileY = Math.floor(player.visualPos.y - 10);
  const endTileY = Math.ceil(player.visualPos.y + 10);

  // 0. 지상 베이스 캠프 레이아웃 그리기
  if (baseLayout && assets.baseTileset) {
    const layoutHeight = baseLayout.length;
    
    for (let y = 0; y < layoutHeight; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        let tileIdx = 0; // 기본 배경 타일 (잔디)
        
        // 데이터 범위 내에 있으면 해당 타일 인덱스 사용
        if (x >= 0 && x < baseLayout[y].length) {
          tileIdx = baseLayout[y][x];
        } else {
          // 범위를 벗어난 가로 공간 처리: 바닥 레이어는 잔디로 채움
          if (y < layoutHeight - 1) {
             tileIdx = 0;
          } else {
             tileIdx = 0;
          }
        }

        if (tileIdx === -1) continue;

        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;
        // 5x5 타일셋 기준 소스 좌표 계산
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

  // 1. 지하 타일 그리기
  for (let y = startTileY; y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      const tile = tileMap.getTile(x, y);
      if (tile && tile.type !== 'empty') {
        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;

        // 타일 배경색 (검정)
        ctx.fillStyle = '#000000';
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

        // 차원 관문(포탈) 특수 효과: 반짝임(Pulse)
        if (tile.type === 'portal') {
          const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
          ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + pulse * 0.4})`;
          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        }

        // 1-1. 개별 타일 이미지(PNG)가 설정된 경우 우선 렌더링
        const mineralDef = MINERALS.find(m => m.key === tile.type);
        
        if (mineralDef && mineralDef.tileImage) {
          // 이미지 캐싱 처리
          if (!mineralDef._cachedTileImage) {
            const img = new Image();
            img.src = typeof mineralDef.tileImage === 'string' ? mineralDef.tileImage : (mineralDef.tileImage.src || mineralDef.tileImage);
            mineralDef._cachedTileImage = img;
          }

          if (mineralDef._cachedTileImage.complete) {
            ctx.drawImage(mineralDef._cachedTileImage, drawX, drawY, TILE_SIZE, TILE_SIZE);
          } else {
            // 이미지 로딩 중일 때는 색상으로 폴백
            ctx.fillStyle = mineralDef.color || '#444';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
          }
        } else if (assets.tileset) {
          // 1-2. 개별 이미지가 없으면 기존 타일셋(Tileset) 이용
          const tileIndex = getTileIndex(tile.type);
          const sourceX = (tileIndex % 5) * 128;
          const sourceY = Math.floor(tileIndex / 5) * 128;

          ctx.drawImage(
            assets.tileset,
            sourceX, sourceY, 128, 128,
            drawX, drawY, TILE_SIZE + 0.5, TILE_SIZE + 0.5
          );
        }
      }
    }
  }

  // 2. 엔티티(NPC, 몬스터, 보스, 드론 등) 그리기 (분리된 렌더러 사용)
  renderEntities(world, ctx);

  // 4. 플레이어 캐릭터 그리기
  if (assets.player) {
    const pw = TILE_SIZE * 1.5;
    const ph = TILE_SIZE * 1.5;
    // 플레이어 충돌 박스 너비에 맞춰 시각적 위치 보정
    const px = player.visualPos.x * TILE_SIZE - (pw - TILE_SIZE) / 2;
    const py = player.visualPos.y * TILE_SIZE - (ph - TILE_SIZE);
    
    // 채굴 중 캐릭터 진동(Shake) 효과 및 타격 반동(Recoil)
    const shakeAmount = 2; // 진동 세기 (픽셀)
    let offsetX = 0;
    let offsetY = 0;

    const recoilScale = isRecentlyHit ? 1.08 : 1.0;

    if (player.isDrilling) {
      offsetX = (Math.random() - 0.5) * shakeAmount;
      offsetY = (Math.random() - 0.5) * shakeAmount;
    }

    ctx.save();
    // 캐릭터 중앙 기준 변환
    ctx.translate(px + pw / 2 + offsetX, py + ph / 2 + offsetY);
    ctx.scale(recoilScale, recoilScale);
    
    if (player.isDrilling) {
      ctx.rotate((Math.random() - 0.5) * 0.1); // 미세한 회전 효과
    }
    
    ctx.drawImage(assets.player, -pw / 2, -ph / 2, pw, ph);
    ctx.restore();
  }

  // 4. 채굴 하이라이트 및 타일 대미지 표시
  if (intent.miningTarget && assets.tileset) {
    const { x, y } = intent.miningTarget;
    const drawX = x * TILE_SIZE;
    const drawY = y * TILE_SIZE;
    const tile = tileMap.getTile(x, y);
    
    const margin = 1.5;
    const size = TILE_SIZE - margin * 2;
    
    // 노란색 테두리 하이라이트
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    
    // 반짝이는 배경색 효과
    const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
    ctx.fillStyle = `rgba(250, 204, 21, ${0.1 + pulse * 0.15})`;
    ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

    // 타일이 손상되었을 경우 남은 내구도를 테두리로 표시
    if (tile && tile.health < tile.maxHealth) {
      const ratio = tile.health / tile.maxHealth;
      const totalPerimeter = size * 4;
      const drawLength = totalPerimeter * ratio;
      
      ctx.beginPath();
      ctx.moveTo(drawX + margin + size / 2, drawY + margin); // 상단 중앙에서 시작
      
      let currentLength = 0;
      
      // 시계 반대 방향 혹은 줄어드는 방식으로 테두리 선 그리기 로직
      const p1 = size / 2;
      if (currentLength + p1 <= drawLength) {
        ctx.lineTo(drawX + margin + size, drawY + margin);
        currentLength += p1;
      } else {
        ctx.lineTo(drawX + margin + size / 2 + (drawLength - currentLength), drawY + margin);
        currentLength = drawLength;
      }
      
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
      
      const p5 = size / 2;
      if (currentLength < drawLength) {
        if (currentLength + p5 <= drawLength) {
          ctx.lineTo(drawX + margin + size / 2, drawY + margin);
        } else {
          ctx.lineTo(drawX + margin + (drawLength - currentLength), drawY + margin);
        }
      }
      
      ctx.stroke();

      // 타격 플래시 효과 (흰색 오버레이)
      if (isRecentlyHit) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      }
    } else {
       // 타격 전에는 전체 상자 유지
       ctx.strokeRect(drawX + margin, drawY + margin, size, size);
       
       if (isRecentlyHit) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // 5. 드랍된 아이템 렌더링
  world.droppedItems.forEach(item => {
    const mineralDef = MINERALS.find(m => m.key === item.type);
    if (mineralDef) {
      ctx.save();
      ctx.translate(item.x, item.y);
      // 부드러운 호버링 효과 (회전 제거)
      ctx.translate(0, Math.sin(Date.now() / 200 + item.x) * 3);
      
      ctx.font = '22px Arial'; // 이모지 크기
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 약간의 빛나는 글로우 효과
      ctx.shadowColor = mineralDef.color;
      ctx.shadowBlur = 10;
      
      if (mineralDef.image) {
        // 캐싱 로직
        if (!mineralDef._cachedImage) {
           const img = new Image();
           img.src = typeof mineralDef.image === 'string' ? mineralDef.image : mineralDef.image.src || mineralDef.image;
           mineralDef._cachedImage = img;
        }
        if (mineralDef._cachedImage.complete) {
           const imgW = 28;
           ctx.drawImage(mineralDef._cachedImage, -imgW/2, -imgW/2, imgW, imgW);
        } else {
           ctx.fillText(mineralDef.icon, 0, 0);
        }
      } else {
        ctx.fillText(mineralDef.icon, 0, 0);
      }
      ctx.restore();
    }
  });

  // 6. 파티클(파편) 렌더링
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life; // 수명에 따른 투명도 적용
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;

  // 7. 떠다니는 텍스트(데미지, 알림 등) 렌더링
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
