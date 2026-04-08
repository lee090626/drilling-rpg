import { GameWorld } from '@/entities/world/model';
import { createInitialEquipmentState } from '@/shared/lib/masteryUtils';
import { REFINERY_RECIPES } from '@/shared/config/refineryData';
import { RESEARCH_NODES } from '@/shared/config/researchData';
import { getDroneData } from '@/shared/config/droneData';
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
  
  if (action === 'STRESS_TEST') {
    console.log('[Worker] Stress Test: Spawning 5000 monsters...');
    const px = world.player.pos.x;
    const py = world.player.pos.y;
    
    for (let i = 0; i < 5000; i++) {
      const rx = px + (Math.random() - 0.5) * 60; // 60타일 범위
      const ry = py + (Math.random() - 0.5) * 60;
      // 0: none, 1: monster, 2: boss
      world.entities.create(1, rx * TILE_SIZE, ry * TILE_SIZE, undefined, 0);
    }
    return;
  }

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
      else if (data.type === 'drone') stats.equippedDroneId = data.id;
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
      if (data.res.droneId && !stats.ownedDroneIds.includes(data.res.droneId)) {
        stats.ownedDroneIds.push(data.res.droneId);
      }
      break;

    case 'extractRune': {
      const cost = 500 * Math.pow(2, data.tier);
      if (stats.goldCoins >= cost) {
        stats.goldCoins -= cost;
        const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
        const finalTierIdx = Math.min(data.tier + (Math.random() < 0.05 ? 1 : 0), rarities.length - 1);
        const availableRunes = Object.values(SKILL_RUNES);
        const rune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
        stats.inventoryRunes.push({
          id: `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          runeId: rune.id,
          rarity: rarities[finalTierIdx]
        });
      }
      break;
    }

    case 'regenerateWorld': {
      const newSeed = Math.floor(Math.random() * 1000000);
      stats.mapSeed = newSeed;
      world.tileMap = new TileMap(newSeed, stats.dimension);
      world.player.pos = { x: 15, y: 8 };
      world.player.visualPos = { x: 15, y: 8 };
      world.player.stats.depth = 0;
      world.particles = [];
      world.floatingTexts = [];
      world.droppedItems = [];
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
        const prevIdx = state.slottedRunes.indexOf(runeInstanceId);
        if (prevIdx !== -1) state.slottedRunes[prevIdx] = null;
        state.slottedRunes[slotIndex] = runeInstanceId;
      }
      break;
    }

    case 'unequipRune': {
      const state = stats.equipmentStates[data.drillId];
      if (state && state.slottedRunes[data.slotIndex]) state.slottedRunes[data.slotIndex] = null;
      break;
    }

    case 'selectCheckpoint': {
      world.player.pos.y = data.depth + 10;
      world.player.visualPos.y = data.depth + 10;
      stats.depth = data.depth;
      break;
    }

    case 'startSmelting': {
      const recipeId = data.recipeId;
      const recipe = REFINERY_RECIPES.find(r => r.id === recipeId);
      if (recipe) {
        (stats.inventory[recipe.inputId as any] as number) -= recipe.inputAmount;
        const speedMult = getDroneData(stats.equippedDroneId)?.smeltSpeedMult || 1;
        stats.activeSmeltingJobs.push({
          id: `smelt_${Date.now()}_${Math.random()}`,
          inputMineral: recipe.inputId,
          outputItem: recipe.outputId,
          amount: recipe.outputAmount,
          startTime: Date.now(),
          durationMs: recipe.durationMs * speedMult
        });
      }
      break;
    }

    case 'collectSmelting': {
      const idx = stats.activeSmeltingJobs.findIndex(j => j.id === data.jobId);
      if (idx !== -1) {
        const job = stats.activeSmeltingJobs[idx];
        stats.inventory[job.outputItem] += job.amount;
        stats.activeSmeltingJobs.splice(idx, 1);
      }
      break;
    }

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
      const nextDim = stats.dimension + 1;
      stats.dimension = nextDim;
      
      // 월드 초기화
      const newSeed = Math.floor(Math.random() * 1000000);
      stats.mapSeed = newSeed;
      world.tileMap.reset(newSeed, nextDim);
      
      // 플레이어 상태 초기화
      world.player.pos = { x: 15, y: 8 };
      world.player.visualPos = { x: 15, y: 8 };
      stats.depth = 0;
      
      // 휘발성 데이터 청소
      world.particles = [];
      world.floatingTexts = [];
      world.droppedItems = [];
      world.spawnedCoords.clear();
      
      console.log(`[Worker] Traveled to Dimension ${nextDim}`);
      
      // 메인 스레드에 알림 (필요시)
      self.postMessage({ type: 'DIMENSION_TRAVEL_COMPLETE', payload: { dimension: nextDim } });
      break;
    }
  }
}
