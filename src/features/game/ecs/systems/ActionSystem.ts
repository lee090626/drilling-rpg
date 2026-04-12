import { GameWorld } from '@/entities/world/model';
import { createInitialEquipmentState } from '@/shared/lib/masteryUtils';
import { RESEARCH_NODES } from '@/shared/config/researchData';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { TileMap } from '@/entities/tile/TileMap';
import { Rarity } from '@/shared/types/game';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 게임 내 플레이어의 명시적인 액션(아이템 구매, 강화, 제련, 차원 이동 등)을 처리하는 시스템입니다.
 * 게임 워커(게임 루프)와 분리되어 이벤트 방식으로 호출됩니다.
 */
export function handlePlayerAction(world: GameWorld, payload: any) {
  const { action, data } = payload;
  

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
        stats.goldCoins += data.price;
      }
      break;

    case 'equip':
      if (data.type === 'drill') stats.equippedDrillId = data.id;
      else if (data.type === 'artifact') stats.equippedArtifactId = data.id;
      break;

    case 'craft':
      if (data.req) {
        Object.entries(data.req).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else if (stats.inventory[res as any] !== undefined) (stats.inventory as any)[res] -= amt as number;
        });
      }
      if (data.res.drillId && !stats.ownedDrillIds.includes(data.res.drillId)) {
        stats.ownedDrillIds.push(data.res.drillId);
        if (!stats.equipmentStates[data.res.drillId]) {
           stats.equipmentStates[data.res.drillId] = createInitialEquipmentState(data.res.drillId);
        }
      }
      break;

    case 'summonRune': {
      const count = data.count || 1;
      const baseCost = 500 * Math.pow(2, data.tier);
      const totalCost = baseCost * count;

      if (stats.goldCoins >= totalCost) {
        stats.goldCoins -= totalCost;
        const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
        const availableRunes = Object.values(SKILL_RUNES);

        for (let i = 0; i < count; i++) {
          const finalTierIdx = Math.min(data.tier + (Math.random() < 0.05 ? 1 : 0), rarities.length - 1);
          const rune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
          stats.inventoryRunes.push({
            id: `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}_${i}`,
            runeId: rune.id,
            rarity: rarities[finalTierIdx]
          });
        }
      }
      break;
    }

    case 'regenerateWorld': {
      // Logic moved to game.worker.ts (safeReset)
      break;
    }
    
    case 'useArtifact': {
      world.intent.action = 'artifact';
      break;
    }

    case 'respawn': {
      // HP 회복 및 위치 초기화
      stats.hp = stats.maxHp;
      world.player.pos = { x: 15, y: 8 };
      world.player.visualPos = { x: 15, y: 8 };
      console.log('[Worker] Player respawned at Base Camp.');
      break;
    }

    case 'equipRune': {
      const { runeInstanceId, slotIndex } = data;
      const drillId = stats.equippedDrillId;
      const state = stats.equipmentStates[drillId];
      if (state) {
        if (!state.slottedRunes) state.slottedRunes = [];
        const prevIdx = state.slottedRunes.indexOf(runeInstanceId);
        if (prevIdx !== -1) state.slottedRunes[prevIdx] = null;
        state.slottedRunes[slotIndex] = runeInstanceId;
      }
      break;
    }

    case 'unequipRune': {
      const state = stats.equipmentStates[data.drillId];
      if (state && state.slottedRunes && state.slottedRunes[data.slotIndex]) state.slottedRunes[data.slotIndex] = null;
      break;
    }

    case 'selectCheckpoint': {
      world.player.pos.y = data.depth + 10;
      world.player.visualPos.y = data.depth + 10;
      stats.depth = data.depth;
      break;
    }

    // [삭제됨] startSmelting / collectSmelting — 용광로 시스템 제거됨
    case 'unlockResearch': {
      const node = RESEARCH_NODES.find(n => n.id === data.researchId);
      if (node) {
        Object.entries(node.cost).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else (stats.inventory[res as any] as number) -= amt as number;
        });
        stats.unlockedResearchIds.push(data.researchId);
        if (node.effect.type === 'power') stats.power += node.effect.value;
        if (node.effect.type === 'maxHp') {
          stats.hp += node.effect.value;
          stats.maxHp += node.effect.value;
        }
      }
      break;
    }

    case 'synthesizeRunes': {
      const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
      const runeGroups = new Map<string, any[]>();
      
      for (const rune of stats.inventoryRunes) {
        const key = `${rune.runeId}_${rune.rarity}`;
        if (!runeGroups.has(key)) runeGroups.set(key, []);
        runeGroups.get(key)!.push(rune);
      }

      for (const [, group] of runeGroups) {
        if (group.length >= 5) {
          const sample = group[0];
          const currentTierIdx = rarities.indexOf(sample.rarity as Rarity);
          
          if (currentTierIdx !== -1 && currentTierIdx < rarities.length - 1) {
            // 5개 제거
            let removedCount = 0;
            stats.inventoryRunes = stats.inventoryRunes.filter(r => {
              if (removedCount < 5 && group.includes(r)) {
                removedCount++;
                return false;
              }
              return true;
            });

            // 상위 등급 1개 추가
            stats.inventoryRunes.push({
              id: `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
              runeId: sample.runeId,
              rarity: rarities[currentTierIdx + 1]
            });
            
            console.log(`[Worker] Synthesized 5 ${sample.rarity} ${sample.runeId} into 1 ${rarities[currentTierIdx + 1]}`);
          }
          break; // 한 번에 한 종류만 합성
        }
      }
      break;
    }

    case 'travelDimension': {
      // Logic moved to game.worker.ts (safeReset)
      break;
    }
  }
}
