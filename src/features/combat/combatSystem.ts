import { GameWorld } from '../../entities/world/model';
import { TILE_SIZE } from '../../shared/config/constants';

/**
 * 플레이어와 몬스터 간의 전투(대미지 처리, 사망 등)를 담당하는 시스템입니다.
 */
export const combatSystem = (world: GameWorld, deltaTime: number) => {
  const { player, entities, floatingTexts } = world;
  const now = Date.now();

  // 1. 몬스터 -> 플레이어 공격
  entities.forEach(entity => {
    if (entity.type !== 'monster' && entity.type !== 'boss') return;
    if (!entity.stats || entity.stats.hp <= 0) return;

    // 몬스터의 타일 중앙과의 거리 계산
    const dx = player.pos.x - (entity.x + 0.5);
    const dy = player.pos.y - (entity.y + 0.5);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 공격 사거리 (타일 1.2배 이내)
    if (distance < 1.2) {
      const cooldown = 1000; // 1초당 1회 공격
      if (!entity.lastAttackTime || now - entity.lastAttackTime > cooldown) {
        
        // 대미지 계산 (방어력 등 고려 가능)
        const damage = entity.stats.attack;
        player.stats.hp -= damage;
        player.lastHitTime = now;
        
        // 플로팅 텍스트
        floatingTexts.push({
          x: player.pos.x * TILE_SIZE,
          y: player.pos.y * TILE_SIZE - 20,
          text: `-${damage}`,
          color: '#ef4444', // 빨간색
          life: 1.0,
        });

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

      // 타겟팅 중인 타일의 주변 몬스터 체크 (반경 1.5타일)
      const dx = target.x + 0.5 - entity.x;
      const dy = target.y + 0.5 - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1.5) {
        // 채굴 위력의 일부 혹은 전체를 몬스터 대미지로 전환
        const attackCooldown = 200; // 공격 주기
        const attackPower = player.stats.attackPower || 10;
        
        // 드릴 쿨다운은 별도 관리되지만 여기서는 단순화하여 처리
        if (!player.lastAttackTime || now - player.lastAttackTime > attackCooldown) {
          entity.stats.hp -= attackPower;
          
          floatingTexts.push({
            x: entity.x * TILE_SIZE,
            y: (entity.y - 0.5) * TILE_SIZE,
            text: `${attackPower}`,
            color: '#fbbf24', // 노란색
            life: 1.0,
          });

          player.lastAttackTime = now;

          // 몬스터 사망 처리
          if (entity.stats.hp <= 0) {
             // 보상 골드 지급 (임시)
             const gold = entity.type === 'boss' ? 5000 : 50;
             player.stats.goldCoins += gold;
             
             floatingTexts.push({
               x: entity.x * TILE_SIZE,
               y: (entity.y - 1) * TILE_SIZE,
               text: `+${gold} G`,
               color: '#fde047',
               life: 1.5,
             });
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
