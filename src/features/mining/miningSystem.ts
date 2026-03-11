import { GameWorld } from '../../entities/world/model';
import { DRILLS } from '../../shared/config/drillData';
import { TILE_SIZE, MAP_WIDTH } from '../../shared/config/constants';
import { getTileColor } from '../../shared/lib/tileUtils';

export const miningSystem = (world: GameWorld, now: number) => {
  const { player, tileMap, intent } = world;

  // Calculate target based on current position and intent
  // We use a small offset from center to find the tile in front of the player
  // 오프셋을 0.8에서 1.0으로 늘려 캐릭터 주변 타겟팅을 더 명확히 합니다.
  const targetX = Math.floor(player.pos.x + (intent.moveX !== 0 ? intent.moveX * 1.0 : 0) + 0.5);
  const targetY = Math.floor(player.pos.y + (intent.moveY !== 0 ? intent.moveY * 1.0 : 0) + 0.5);
  const targetTile = tileMap.getTile(targetX, targetY);

  // Update mining target for visualization even if not currently drilling
  if (targetTile && targetTile.type !== 'empty' && targetTile.type !== 'wall' && targetTile.type !== 'portal') {
    intent.miningTarget = { x: targetX, y: targetY };
  } else {
    intent.miningTarget = null;
  }

  if (!targetTile || !player.isDrilling || !intent.miningTarget) {
    if (player.isDrilling) player.isDrilling = false;
    return;
  }

  // targetX/Y are already calculated above

  const currentDrill = DRILLS[player.stats.equippedDrillId] || DRILLS['rusty_drill'];
  const attackInterval = currentDrill.cooldownMs;

  // ReLOST Logic: 공격 속도(Attack Speed) 기반 주기적 타격
  // 마지막 타격 이후 충분한 시간이 지났는지 확인
  if (now - world.timestamp.lastMove < attackInterval) return;

  const totalPower = currentDrill.basePower + (player.stats.hp > 0 ? player.stats.attackPower : 0);
  const targetType = targetTile.type;
  const targetColor = getTileColor(targetType);
  
  // 타일 대미지 처리
  const destroyed = tileMap.damageTile(targetX, targetY, totalPower);
  
  // 공격 타이머 및 타격 시간(흔들림용) 갱신
  world.timestamp.lastMove = now;
  player.lastHitTime = now;

  // Handle particles and effects even if not destroyed (hit effects)
  if (destroyed) {
    // Add particles
    createParticles(world, targetX * TILE_SIZE, targetY * TILE_SIZE, targetColor);
    
    // Add to inventory
    const inventory = player.stats.inventory as any;
    if (inventory[targetType] !== undefined) {
      inventory[targetType]++;
      createFloatingText(world, targetX * TILE_SIZE, targetY * TILE_SIZE, `+1 ${targetType.toUpperCase()}`, '#fbbf24');
      
      // Mineral Discovery
      if (!player.stats.discoveredMinerals.includes(targetType)) {
        player.stats.discoveredMinerals.push(targetType);
      }
    }

    // Special effects
    if (currentDrill.specialEffect === 'explosive') {
      const neighbors = [
        { x: targetX + 1, y: targetY },
        { x: targetX - 1, y: targetY },
        { x: targetX, y: targetY + 1 },
        { x: targetX, y: targetY - 1 },
      ];
      neighbors.forEach((n) => {
        const nt = tileMap.getTile(n.x, n.y);
        if (nt && nt.type !== 'empty' && nt.type !== 'wall' && nt.type !== 'portal') {
          const nDestroyed = tileMap.damageTile(n.x, n.y, totalPower * 0.5);
          if (nDestroyed) {
             const nColor = getTileColor(nt.type);
             createParticles(world, n.x * TILE_SIZE, n.y * TILE_SIZE, nColor);
             const type = nt.type;
             if (inventory[type] !== undefined) {
               inventory[type]++;
             }
          }
        }
      });
    }

    // Boss Core Logic
    if (targetType === 'boss_core') {
      handleBossDefeat(world, targetX, targetY);
    }

    // Quest Tracking
    player.stats.activeQuests.forEach((q) => {
      if (q.status === 'active' && q.requirement.type === targetType) {
        q.requirement.current = inventory[targetType] || 0;
      }
    });
  }
};

function createParticles(world: GameWorld, x: number, y: number, color: string) {
  for (let i = 0; i < 8; i++) {
    world.particles.push({
      x: x + TILE_SIZE / 2,
      y: y + TILE_SIZE / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 2,
      life: 1.0,
      color: color,
      size: Math.random() * 4 + 2,
    });
  }
}

function createFloatingText(world: GameWorld, x: number, y: number, text: string, color: string) {
  world.floatingTexts.push({
    x: x + TILE_SIZE / 2,
    y: y,
    text: text,
    color: color,
    life: 1.0,
  });
}

function handleBossDefeat(world: GameWorld, x: number, y: number) {
  const { player, tileMap } = world;
  const artifactName = 'Ancient Core';
  if (!player.stats.artifacts.includes(artifactName)) {
    player.stats.artifacts.push(artifactName);
    player.stats.attackPower += 20;
    player.stats.maxHp += 50;
    player.stats.hp = player.stats.maxHp;
    createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 40, 'ARTIFACT ACQUIRED: ANCIENT CORE!', '#a855f7');
  }

  const bossCenterY = 1010;
  const bossCenterX = Math.floor(MAP_WIDTH / 2);

  for (let by = bossCenterY - 2; by <= bossCenterY + 2; by++) {
    for (let bx = bossCenterX - 2; bx <= bossCenterX + 2; bx++) {
      const t = tileMap.getTile(bx, by);
      if (t && (t.type === 'boss_core' || t.type === 'boss_skin')) {
        t.type = 'empty';
        t.health = 0;
        createParticles(world, bx * TILE_SIZE, by * TILE_SIZE, '#10b981');
      }
    }
  }

  const centerTile = tileMap.getTile(bossCenterX, bossCenterY);
  if (centerTile) {
    centerTile.type = 'portal';
    centerTile.health = Infinity;
    centerTile.maxHealth = Infinity;
    createFloatingText(world, bossCenterX * TILE_SIZE, bossCenterY * TILE_SIZE - 20, 'DIMENSIONAL PORTAL OPENED!', '#a855f7');
  }
}
