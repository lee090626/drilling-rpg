import { GameWorld } from '../../entities/world/model';
import { DRILLS } from '../../shared/config/drillData';
import { DRONES } from '../../shared/config/droneData';
import { TILE_SIZE } from '../../shared/config/constants';
import { getTileColor } from '../../shared/lib/tileUtils';
import { getNextLevelExp, createInitialEquipmentState, getMasteryMultiplier } from '../../shared/lib/masteryUtils';
import { getTotalRuneStat } from '../../shared/lib/runeUtils';
import { MINERALS } from '../../shared/config/mineralData';
import { getResearchBonuses } from '../../shared/lib/researchUtils';

/**
 * 플레이어의 채굴 로직과 보스 처치 등 게임의 주요 상호작용 결과를 관리하는 시스템입니다.
 * @param world 게임 월드 상태 객체
 * @param now 현재 게임 시간 (밀리초)
 */
export const miningSystem = (world: GameWorld, now: number) => {
  const { player, tileMap, intent } = world;

  // 플레이어의 현재 위치와 이동 의도를 기반으로 채굴 대상 타일 좌표 계산
  const targetX = Math.floor(player.pos.x + (intent.moveX !== 0 ? intent.moveX * 1.0 : 0) + 0.5);
  const targetY = Math.floor(player.pos.y + (intent.moveY !== 0 ? intent.moveY * 1.0 : 0) + 0.5);
  const targetTile = tileMap.getTile(targetX, targetY);

  // 시각적 하이라이트를 위한 채굴 대상 타일 업데이트
  if (targetTile && targetTile.type !== 'empty' && targetTile.type !== 'wall' && targetTile.type !== 'portal') {
    intent.miningTarget = { x: targetX, y: targetY };
  } else {
    intent.miningTarget = null;
  }

  // 타일이 없거나, 드릴 중이 아니거나, 채굴 대상이 없는 경우 채굴 상태 해제 후 종료
  if (!targetTile || !player.isDrilling || !intent.miningTarget) {
    if (player.isDrilling) player.isDrilling = false;
    return;
  }

  // 현재 장착된 드릴의 데이터 및 공격 속도 확인
  const currentDrill = DRILLS[player.stats.equippedDrillId] || DRILLS['rusty_drill'];
  
  // 연구 보너스 계산
  const researchBonuses = getResearchBonuses(player.stats);
  
  // 공격 간격 계산: (기본 쿨다운) * (1 - 속도 보너스)
  // 예: 200ms * (1 - 0.1) = 180ms
  const attackInterval = currentDrill.cooldownMs * (1 - Math.min(0.9, researchBonuses.miningSpeed));

  // 공격 쿨타임 체크
  if (now - world.timestamp.lastMove < attackInterval) return;

  // 숙련도 및 장비 상태 로드/생성
  const equipmentState = player.stats.equipmentStates[player.stats.equippedDrillId] || 
                         (player.stats.equipmentStates[player.stats.equippedDrillId] = createInitialEquipmentState(player.stats.equippedDrillId));
  
  // 숙련도 레벨에 따른 대미지 배율 적용
  const masteryMult = getMasteryMultiplier(equipmentState.level);
  
  // 룬 시스템 보너스 계산 (공격력, 치명타)
  const runeAttackBonus = getTotalRuneStat(player.stats, 'attack');
  const critRate = getTotalRuneStat(player.stats, 'critRate');
  const critDamage = getTotalRuneStat(player.stats, 'critDmg');

  const drillPower = currentDrill.basePower;
  const masteryBonus = Math.round(drillPower * (masteryMult - 1));
  
  // 총 파워: 기본 공격력 + 드릴 파워 + 숙련도 보너스 + 룬 공격력 보너스
  let totalPower = player.stats.attackPower + drillPower + masteryBonus + Math.floor(runeAttackBonus);
  
  // 치명타 적용
  let isCrit = false;
  if (Math.random() < critRate) {
    totalPower = Math.floor(totalPower * critDamage);
    isCrit = true;
  }
  
  const targetType = targetTile.type;
  const targetColor = getTileColor(targetType);
  
  // 지수 기반 대미지 공식 적용: (공격력 - 방어력) ^ 1.15
  const mineralDef = MINERALS.find(m => m.key === targetType);
  const defense = mineralDef ? mineralDef.defense : 0;
  
  const netPower = Math.max(0, totalPower - defense);
  const exponent = 1.15;
  const finalDamage = Math.floor(Math.pow(netPower, exponent));
  
  // 타일에 실제 대미지 가함 (파괴 여부 확인)
  const destroyed = finalDamage > 0 ? tileMap.damageTile(targetX, targetY, finalDamage) : false;
  
  if (finalDamage > 0) {
    player.lastHitTime = now;
    
    // 은은한 화면 흔들림 효과 (기존 10 -> 최대 2.0으로 하향)
    // 일반 타격은 아주 미세하게(0.5), 파괴 시에는 조금 더 확실하게(2.0)
    const shakeIntensity = destroyed ? 2.0 : 0.5;
    world.shake = Math.max(world.shake, shakeIntensity);

    // 타격 지점에 작은 파티클 생성 (파괴 전에도 튀는 파편)
    for (let i = 0; i < 2; i++) {
      world.particles.push({
        x: targetX * TILE_SIZE + TILE_SIZE / 2,
        y: targetY * TILE_SIZE + TILE_SIZE / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 0.6,
        color: targetColor,
        size: Math.random() * 2 + 1,
      });
    }

    // 데미지 텍스트 표시
    const color = isCrit ? '#f87171' : '#ffffff';
    const text = isCrit ? `Crit! -${finalDamage}` : `-${finalDamage}`;
    createFloatingText(world, targetX * TILE_SIZE, targetY * TILE_SIZE, text, color);
  }
  
  // 공격 타이머 갱신
  world.timestamp.lastMove = now;

  // 타일이 파괴되었을 때의 처리
  if (destroyed) {

    // 2. 파괴 파티클 생성
    createParticles(world, targetX * TILE_SIZE, targetY * TILE_SIZE, targetColor);
    
    // 3. 아이템 스폰, 경험치 획득 및 통계 업데이트
    const inventory = player.stats.inventory;
    if (inventory[targetType] !== undefined) {
      // 행운(Luck) 룬에 따른 드롭 개수 계산
      const luck = getTotalRuneStat(player.stats, 'luck');
      let dropCount = 1;
      let remLuck = luck;
      while (remLuck >= 1) { dropCount++; remLuck--; }
      if (Math.random() < remLuck) dropCount++;

      // 바닥에 떨어지는 물리 아이템 생성 (드롭 개수만큼)
      for (let i = 0; i < dropCount; i++) {
        world.droppedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          type: targetType,
          x: targetX * TILE_SIZE + TILE_SIZE / 2,
          y: targetY * TILE_SIZE + TILE_SIZE / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: -4 - Math.random() * 3,
          life: 0
        });
      }
      
      if (dropCount > 1) {
        createFloatingText(world, targetX * TILE_SIZE, targetY * TILE_SIZE - 10, `x${dropCount} Drops!`, '#a855f7');
      }
      
      // 도감 등록 처리
      if (!player.stats.discoveredMinerals.includes(targetType)) {
        player.stats.discoveredMinerals.push(targetType);
      }

      // 숙련도 경험치 획득 및 레벨업 체크
      const expGain = 10; 
      equipmentState.exp += expGain;
      
      const nextExp = getNextLevelExp(equipmentState.level);
      if (equipmentState.exp >= nextExp) {
        equipmentState.level++;
        equipmentState.exp -= nextExp;
        createFloatingText(world, player.pos.x * TILE_SIZE, player.pos.y * TILE_SIZE - 20, `Mastery Level Up: ${equipmentState.level}!!`, '#eab308');
      }
    }

    // 4. 드릴 특수 효과 처리 (폭발형 등)
    const triggerExplosion = currentDrill.specialEffect === 'explosive';
    if (triggerExplosion) {
      const neighbors = [
        { x: targetX + 1, y: targetY },
        { x: targetX - 1, y: targetY },
        { x: targetX, y: targetY + 1 },
        { x: targetX, y: targetY - 1 },
      ];
      neighbors.forEach((n) => {
        const nt = tileMap.getTile(n.x, n.y);
        if (nt && nt.type !== 'empty' && nt.type !== 'wall' && nt.type !== 'portal') {
          // 폭발 데미지는 원래 데미지의 50%
          const nDestroyed = tileMap.damageTile(n.x, n.y, totalPower * 0.5);
          if (nDestroyed) {
             const nColor = getTileColor(nt.type);
             createParticles(world, n.x * TILE_SIZE, n.y * TILE_SIZE, nColor);
             const type = nt.type;
             if (inventory[type] !== undefined) {
               world.droppedItems.push({
                 id: Math.random().toString(36).substring(2, 9),
                 type: type,
                 x: n.x * TILE_SIZE + TILE_SIZE / 2,
                 y: n.y * TILE_SIZE + TILE_SIZE / 2,
                 vx: (Math.random() - 0.5) * 6,
                 vy: -4 - Math.random() * 3,
                 life: 0
               });
             }
          }
        }
      });
    }

    // 보스 코어 타일이 파괴되었을 경우 보스전 승리 처리
    if (targetType === 'boss_core') {
      handleBossDefeat(world, targetX, targetY);
    }
  }

  // ------------------------------------------------------------------
  // 5. 펫 드론의 독립 보조 채굴 로직 (Auto-Mining)
  // ------------------------------------------------------------------
  if (world.activeDrone && player.stats.equippedDroneId) {
    const droneConfig = DRONES[player.stats.equippedDroneId];
    if (droneConfig) {
      if (now - world.activeDrone.lastHitTime >= droneConfig.cooldownMs) {
        // 드론의 타일 좌표 계산
        const droneTileX = Math.floor(world.activeDrone.x / TILE_SIZE);
        const droneTileY = Math.floor(world.activeDrone.y / TILE_SIZE);
        
        // 반경 내 파괴 가능한 대상 탐색
        let targetFound = false;
        let tX = 0, tY = 0, tType: any = '';
        
        // 탐색 최적화: 플레이어 주위에 있을 확률이 높으므로 중앙부터 탐색
        const radius = droneConfig.miningRadius || 2;
        searchLoop:
        for(let r = 1; r <= radius; r++) {
          for(let dy = -r; dy <= r; dy++) {
            for(let dx = -r; dx <= r; dx++) {
              // 겉테두리만 탐색
              if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
              
              const cx = droneTileX + dx;
              const cy = droneTileY + dy;
              const cTile = tileMap.getTile(cx, cy);
              
              // 부술 수 있는 타일인지 확인 (포탈, 에어, 벽 제외)
              if (cTile && cTile.type !== 'empty' && cTile.type !== 'wall' && cTile.type !== 'portal' && cTile.health > 0) {
                targetFound = true;
                tX = cx; tY = cy; tType = cTile.type;
                break searchLoop;
              }
            }
          }
        }
        
        if (targetFound) {
            // 레이저 타겟 좌표 저장 (렌더링 용)
            world.activeDrone.targetX = tX * TILE_SIZE + TILE_SIZE / 2;
            world.activeDrone.targetY = tY * TILE_SIZE + TILE_SIZE / 2;
            world.activeDrone.lastHitTime = now;
            
            const minDef = MINERALS.find(m => m.key === tType);
            const tDefense = minDef ? minDef.defense : 0;
            const droneNetPower = Math.max(0, droneConfig.basePower - tDefense);
            const droneDamage = Math.floor(Math.pow(droneNetPower, 1.15));
            
            if (droneDamage > 0) {
              const dDestroyed = tileMap.damageTile(tX, tY, droneDamage);
              
              if (dDestroyed) {
                const color = getTileColor(tType);
                createParticles(world, tX * TILE_SIZE, tY * TILE_SIZE, color);
                const inv = player.stats.inventory;
                if (inv[tType] !== undefined) {
                  world.droppedItems.push({
                     id: `drone_drop_${Math.random()}`,
                     type: tType,
                     x: tX * TILE_SIZE + TILE_SIZE / 2,
                     y: tY * TILE_SIZE + TILE_SIZE / 2,
                     vx: (Math.random() - 0.5) * 6,
                     vy: -4 - Math.random() * 3,
                     life: 0
                  });
                  // 도감 갱신은 플레이어에 한정할지, 드론도 할지 결정 - 일단 생략 (기본 획득 경험치 등 제외)
                }
                
                if (tType === 'boss_core') {
                  handleBossDefeat(world, tX, tY);
                }
              } else {
                 // 파괴되지 않았다 하더라도 작은 파티클로 타격감 연출
                 createParticles(world, tX * TILE_SIZE, tY * TILE_SIZE, getTileColor(tType));
              }
            }
        } else {
            // 쏠 타겟이 없으면 레이저 시각효과 해제
            if (now - world.activeDrone.lastHitTime > 300) {
                world.activeDrone.targetX = null;
                world.activeDrone.targetY = null;
            }
        }
      } else {
        // 쿨타임 중일 때 시각 효과 소거 타이머 (예: 200ms 동안만 레이저 출력)
        if (world.activeDrone.targetX && (now - world.activeDrone.lastHitTime > 200)) {
           world.activeDrone.targetX = null;
           world.activeDrone.targetY = null;
        }
      }
    }
  }
};

/**
 * 타일 파괴 시 사방으로 흩어지는 파편 파티클을 생성합니다.
 */
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

/**
 * 화면에 일시적으로 표시될 플로팅 텍스트를 생성합니다.
 */
function createFloatingText(world: GameWorld, x: number, y: number, text: string, color: string) {
  world.floatingTexts.push({
    x: x + TILE_SIZE / 2,
    y: y,
    text: text,
    color: color,
    life: 1.0,
  });
}

/**
 * 보스 처치 성공 시의 로직을 수행합니다 (유물 획득, 포탈 생성 등).
 */
function handleBossDefeat(world: GameWorld, x: number, y: number) {
  const { player, tileMap } = world;
  const artifactName = `${world.player.stats.dimension} Dimension Core`;
  
  // 유물 최초 획득 시 보너스 스탯 부여
  if (!player.stats.artifacts.includes(artifactName)) {
    player.stats.artifacts.push(artifactName);
    player.stats.attackPower += (world.player.stats.dimension + 1) * 10;
    player.stats.maxHp += (world.player.stats.dimension + 1) * 30;
    player.stats.hp = player.stats.maxHp; // 체력 완전 회복
    createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 40, `Artifact Acquired: ${artifactName}`, '#a855f7');
  }

  // 보스 전용 유니크 룬 지급
  if (!player.stats.inventoryRunes) {
    player.stats.inventoryRunes = [];
  }
  player.stats.inventoryRunes.push({
    id: `rune_${Date.now()}_unique`,
    runeId: 'lucky_charm_rune',
    rarity: 'Unique'
  });
  createFloatingText(world, x * TILE_SIZE, y * TILE_SIZE - 60, 'Unique Skill Rune Acquired!', '#22d3ee');

  // 보스 시체(코어 및 외피) 제거 및 포탈 생성을 위한 범위 탐색
  const bossHeights = [200, 300, 400, 500, 700, 1000];
  const targetHeight = bossHeights[Math.min(tileMap.dimension, bossHeights.length - 1)];
  const bossCenterY = targetHeight - 1;
  const bossCenterX = 15;

  for (let by = bossCenterY - 2; by <= bossCenterY + 2; by++) {
    for (let bx = bossCenterX - 2; bx <= bossCenterX + 2; bx++) {
      const tile = tileMap.getTile(bx, by);
      if (tile && (tile.type === 'boss_core' || tile.type === 'boss_skin')) {
        tile.type = 'empty';
        tile.health = 0;
        createParticles(world, bx * TILE_SIZE, by * TILE_SIZE, '#10b981');
      }
    }
  }

  // 다음 차원으로 이동 가능한 포탈 생성
  const centerTile = tileMap.getTile(bossCenterX, bossCenterY);
  if (centerTile) {
    centerTile.type = 'portal';
    centerTile.health = Infinity;
    centerTile.maxHealth = Infinity;
    createFloatingText(world, bossCenterX * TILE_SIZE, bossCenterY * TILE_SIZE - 20, 'Dimensional Portal Opened!', '#a855f7');
  }
}
