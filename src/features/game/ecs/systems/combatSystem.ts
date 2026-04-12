import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTERS } from '@/shared/config/monsterData';
import { calculateMiningDamage } from '../../lib/miningCalculator';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { handleBossDefeat } from './bossSystem';

/**
 * 플레이어와 몬스터 간의 전투(대미지 처리, 사망 등)를 담당하는 시스템입니다.
 */
export const combatSystem = (world: GameWorld, deltaTime: number, now: number) => {
  const { player, entities, floatingTexts } = world;

  // 1. 몬스트 -> 플레이어 공격 (SpatialHash 기반)
  const nearbyMonsters = world.spatialHash.query(
    player.pos.x * TILE_SIZE, 
    player.pos.y * TILE_SIZE, 
    TILE_SIZE * 2
  );

  nearbyMonsters.forEach(idx => {
    const type = entities.soa.type[idx];
    if (type !== 1 && type !== 2) return; // 1: monster, 2: boss
    if (entities.soa.hp[idx] <= 0) return;

    // 몬스터 사거리 체크 (월드 좌표 기준)
    const ex = entities.soa.x[idx];
    const ey = entities.soa.y[idx];
    const ew = entities.soa.width[idx] || TILE_SIZE;
    const eh = entities.soa.height[idx] || TILE_SIZE;
    
    const px = player.pos.x * TILE_SIZE;
    const py = player.pos.y * TILE_SIZE;

    const isInRange = 
      px >= ex - TILE_SIZE * 0.5 && 
      px < ex + ew + TILE_SIZE * 0.5 &&
      py >= ey - TILE_SIZE * 0.5 && 
      py < ey + eh + TILE_SIZE * 0.5;

    if (isInRange) {
      const cooldown = entities.soa.attackCooldown[idx]; // 몬스터 별 개별 공격 쿨타임
      if (now - entities.soa.lastAttackTime[idx] > cooldown) {
        const damage = entities.soa.attack[idx];
        player.stats.hp -= damage;
        player.lastHitTime = now;
        
        createFloatingText(world, px, py - 20, `-${damage}`, '#ef4444');
        entities.soa.lastAttackTime[idx] = now;
        world.shake = Math.max(world.shake, 5);
      }
    }
  });

  // 2. 플레이어 -> 몬스터 공격 (드릴링 중 주변 몬스터 타격)
  if (player.isDrilling && world.intent.miningTarget) {
    const target = world.intent.miningTarget;
    const hitEntities = world.spatialHash.query(
        target.x * TILE_SIZE + TILE_SIZE / 2,
        target.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE * 0.5
    );
    
    hitEntities.forEach(idx => {
      const type = entities.soa.type[idx];
      if (type !== 1 && type !== 2) return;
      if (entities.soa.hp[idx] <= 0) return;

      const ex = entities.soa.x[idx];
      const ey = entities.soa.y[idx];
      const ew = entities.soa.width[idx] || TILE_SIZE;
      const eh = entities.soa.height[idx] || TILE_SIZE;
      
      const tx = target.x * TILE_SIZE;
      const ty = target.y * TILE_SIZE;
      
      const isHit = tx < ex + ew && tx + TILE_SIZE > ex && ty < ey + eh && ty + TILE_SIZE > ey;

      if (isHit) {
        const { finalDamage, attackInterval, isCrit } = calculateMiningDamage(player.stats, type === 2 ? 'boss' : 'monster');
        
        if (now - player.lastAttackTime > attackInterval) {
          const defIdx = entities.soa.monsterDefIndex[idx];
          const monsterDef = MONSTERS[defIdx];
          
          let actualDamage = finalDamage;
          let text = isCrit ? `Crit! -${finalDamage}` : `-${finalDamage}`;
          let color = isCrit ? '#f87171' : '#ffffff';

          // [특수 기믹] 크리티컬 온리 몬스터 처리
          if (monsterDef?.mechanic === 'critical_only' && !isCrit) {
            actualDamage = 0;
            text = 'BLOCK!';
            color = '#3b82f6'; // 파란색 (사용자 요청)
          }

          if (actualDamage > 0 || text === 'BLOCK!') {
            entities.soa.hp[idx] -= actualDamage;
            entities.markDirty(idx);
            createFloatingText(world, ex, ey - 30, text, color);
          }
          
          player.lastAttackTime = now;
          if (isCrit && actualDamage > 0) world.shake = Math.max(world.shake, 8);
        }
      }
    });
  }

  // 3. 플레이어 사망 체크
  if (player.stats.hp <= 0) player.stats.hp = 0;

  // 4. 사망 처리 및 보상 ($O(1)$ Swap-and-Pop)
  for (let i = entities.soa.count - 1; i >= 0; i--) {
     if ((entities.soa.type[i] === 1 || entities.soa.type[i] === 2) && entities.soa.hp[i] <= 0) {
        const defIdx = entities.soa.monsterDefIndex[i];
        const monsterDef = MONSTERS[defIdx];

        if (monsterDef) {
            // 보상 지급
            let multiplier = 1;
            switch (monsterDef.rarity) {
                case 'Uncommon': multiplier = 2; break;
                case 'Rare': multiplier = 3; break;
                case 'Epic': multiplier = 5; break;
                case 'Radiant': multiplier = 7; break;
                case 'Legendary': multiplier = 10; break;
                case 'Mythic': multiplier = 15; break;
                case 'Ancient': multiplier = 20; break;
            }
            if (entities.soa.type[i] === 2) multiplier *= 5;

            const baseGold = 10;
            const hpBonus = Math.floor(entities.soa.maxHp[i] * 0.1);
            const totalGold = Math.floor(baseGold + (hpBonus * multiplier));

            player.stats.goldCoins += totalGold;
            createFloatingText(world, entities.soa.x[i], entities.soa.y[i] - 60, `+${totalGold} G`, '#fde047', 1.5);
            
            // 보스 처치 시 진행 처리
            if (entities.soa.type[i] === 2) {
                handleBossDefeat(world, entities.soa.x[i], entities.soa.y[i]);
            }

            // 처치 기록 (ID가 있을 경우 활성화)
            // (참고: SoA에는 ID를 저장하지 않으므로, 필요 시 별도 매핑 테이블 사용)
        }
        
        entities.destroy(i);
     }
  }
};
