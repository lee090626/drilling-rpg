import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';
import { MONSTERS } from '../../shared/config/monsterData';
import { calculateMiningDamage } from '../mining/miningCalculator';
import { createFloatingText } from '../../shared/lib/effectUtils';

/**
 * 플레이어와 몬스터 간의 전투(대미지 처리, 사망 등)를 담당하는 시스템입니다.
 */
export const combatSystem = (world: GameWorld, deltaTime: number, now: number) => {
  const { player, entities, floatingTexts } = world;

  // 1. 몬스터 -> 플레이어 공격
  entities.forEach(entity => {
    if (entity.type !== 'monster' && entity.type !== 'boss') return;
    if (!entity.stats || entity.stats.hp <= 0) return;

    // 몬스터 사거리 체크 (AABB 확장 영역 이내에 플레이어가 있는지)
    const w = entity.width || 1;
    const h = entity.height || 1;
    
    const isInRange = 
      player.pos.x >= entity.x - 0.5 && 
      player.pos.x < entity.x + w + 0.5 &&
      player.pos.y >= entity.y - 0.5 &&
      player.pos.y < entity.y + h + 0.5;

    if (isInRange) {
      const cooldown = 1000; // 1초당 1회 공격
      if (!entity.lastAttackTime || now - entity.lastAttackTime > cooldown) {
        
        // 대미지 계산 (방어력 등 고려 가능)
        const damage = entity.stats.attack;
        player.stats.hp -= damage;
        player.lastHitTime = now;
        
        // 플로팅 텍스트
        createFloatingText(world, player.pos.x * TILE_SIZE, player.pos.y * TILE_SIZE - 20, `-${damage}`, '#ef4444');

        entity.lastAttackTime = now;
        
        // 화면 흔들림 효과
        world.shake = Math.max(world.shake, 5);
      }
    }
  });

  // 2. 플레이어 -> 몬스터 공격 (드릴링 중 주변 몬스터 타격)
  if (player.isDrilling && world.intent.miningTarget) {
    const target = world.intent.miningTarget;
    
    entities.forEach(entity => {
      if (entity.type !== 'monster' && entity.type !== 'boss') return;
      if (!entity.stats || entity.stats.hp <= 0) return;

      // 타겟팅 중인 타일이 엔티티 영역 내에 있는지 체크
      const w = entity.width || 1;
      const h = entity.height || 1;
      
      const isHit = 
        target.x >= entity.x && 
        target.x < entity.x + w && 
        target.y >= entity.y && 
        target.y < entity.y + h;

      if (isHit) {
        // 채굴 데이터(속도, 파워) 가져오기
        const { finalDamage, attackInterval } = calculateMiningDamage(player.stats, entity.type as any);
        
        // 드릴 쿨다운 동기화
        if (!player.lastAttackTime || now - player.lastAttackTime > attackInterval) {
          entity.stats.hp -= finalDamage;
          
          createFloatingText(world, entity.x * TILE_SIZE, (entity.y - 0.5) * TILE_SIZE, `${finalDamage}`, '#fbbf24');

          player.lastAttackTime = now;

          // 몬스터 사망 처리
          if (entity.stats.hp <= 0) {
             // 보상 골드 지급 (동적 계산: Base + MaxHP 비례 * 등급 배수 * 보스 배수)
             let multiplier = 1;
             
             // 1. 일반 등급(Rarity)에 따른 기본 배수 산정
             // (향후 몬스터나 보스 데이터에 rarity가 들어갈 것을 대비한 이름/ID 조회)
             const mobDef = MONSTERS.find(m => m.name === entity.name);
             if (mobDef && mobDef.rarity) {
               switch (mobDef.rarity) {
                 case 'Uncommon': multiplier = 2; break;
                 case 'Rare': multiplier = 3; break;
                 case 'Epic': multiplier = 5; break;
                 case 'Radiant': multiplier = 7; break;
                 case 'Legendary': multiplier = 10; break;
                 case 'Mythic': multiplier = 15; break;
                 case 'Ancient': multiplier = 20; break;
               }
             }

             // 2. 보스 중복 태그 (Boss Modifier)
             // 보스라면 위에서 구한 등급 배수에 추가로 5배를 곱함
             // (예: 기본 보스 = 1 * 5 = 5배 / 에픽 보스 = 5 * 5 = 25배)
             if (entity.type === 'boss') {
               multiplier *= 5; 
             }
             
             // 기본 골드 10 + (최대 체력의 10% * 최종 배수)
             const baseGold = 10;
             const hpBonus = Math.floor((entity.stats.maxHp || 100) * 0.1);
             const totalGold = Math.floor(baseGold + (hpBonus * multiplier));
             
             // 영구 처치 목록에 등록하여 다시 해당 좌표에 가도 부활하지 않게 방지 (시드 고정)
             if (!player.stats.killedMonsterIds) player.stats.killedMonsterIds = [];
             if (!player.stats.killedMonsterIds.includes(entity.id)) {
               player.stats.killedMonsterIds.push(entity.id);
             }
             
             player.stats.goldCoins += totalGold;
             
             createFloatingText(world, entity.x * TILE_SIZE, (entity.y - 1) * TILE_SIZE, `+${totalGold} G`, '#fde047', 1.5);
          }
        }
      }
    });
  }

  // 플레이어 사망 체크
  if (player.stats.hp <= 0) {
    player.stats.hp = 0;
    // 게임 오버 혹은 부활 로직은 상위에서 결정
  }
};
