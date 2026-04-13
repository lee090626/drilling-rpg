import { GameWorld } from '@/entities/world/model';
import { createInitialEquipmentState } from '@/shared/lib/masteryUtils';
import { hasArtifactEffect } from '@/shared/lib/artifactUtils';

/**
 * 업그레이드, 판매, 제작 등 경제 관련 액션을 처리합니다.
 */
export const handleEconomyAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;

  switch (action) {
    case 'upgrade':
      if (data.type === 'power') stats.power += 5;
      else if (data.type === 'maxHp') stats.maxHp += 20;
      if (data.requirements) {
        Object.entries(data.requirements).forEach(([res, amt]) => {
          const amount = amt as number;
          if (res === 'goldCoins') stats.goldCoins -= amount;
          else if (stats.inventory[res as any] !== undefined) {
            (stats.inventory as any)[res] -= amount;
          }
        });
      }
      break;

    case 'sell':
      if (stats.inventory[data.resource] >= data.amount) {
        stats.inventory[data.resource] -= data.amount;
        // [유물] 마몬의 황금 주화 (GOLD_SELL_BOOST): 판매가 2배
        const priceMultiplier = hasArtifactEffect(stats, 'GOLD_SELL_BOOST') ? 2.0 : 1.0;
        stats.goldCoins += Math.floor(data.price * priceMultiplier);
      }
      break;

    case 'craft':
      if (data.req) {
        Object.entries(data.req).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else if (stats.inventory[res as any] !== undefined)
            (stats.inventory as any)[res] -= amt as number;
        });
      }
      if (data.res.drillId && !stats.ownedEquipmentIds.includes(data.res.drillId)) {
        stats.ownedEquipmentIds.push(data.res.drillId);
        if (!stats.equipmentStates[data.res.drillId]) {
          stats.equipmentStates[data.res.drillId] = createInitialEquipmentState(data.res.drillId);
        }
      }
      break;
  }
};
