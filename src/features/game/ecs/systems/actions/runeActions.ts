import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { Rarity } from '@/shared/types/game';
import { GameWorld } from '@/entities/world/model';

/**
 * 룬 소환, 장착, 합성 등 룬 관련 액션을 처리합니다.
 */
export const handleRuneAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;
  const rarities: Rarity[] = [
    'Common',
    'Uncommon',
    'Rare',
    'Epic',
    'Radiant',
    'Legendary',
    'Mythic',
    'Ancient',
  ];

  switch (action) {
    case 'summonRune': {
      const count = data.count || 1;
      const baseCost = 500 * Math.pow(2, data.tier);
      const totalCost = baseCost * count;

      if (stats.goldCoins >= totalCost) {
        stats.goldCoins -= totalCost;
        const availableRunes = Object.values(SKILL_RUNES);

        for (let i = 0; i < count; i++) {
          const finalTierIdx = Math.min(
            data.tier + (Math.random() < 0.05 ? 1 : 0),
            rarities.length - 1,
          );
          const rune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
          stats.inventoryRunes.push({
            id: `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}_${i}`,
            runeId: rune.id,
            rarity: rarities[finalTierIdx],
          });
        }
      }
      break;
    }

    case 'equipRune': {
      const { runeInstanceId, slotIndex } = data;
      const drillId = stats.equipment.drillId;
      if (!drillId) return;

      const state = stats.equipmentStates[drillId as string];
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
      if (state && state.slottedRunes && state.slottedRunes[data.slotIndex])
        state.slottedRunes[data.slotIndex] = null;
      break;
    }

    case 'synthesizeRunes': {
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
            stats.inventoryRunes = stats.inventoryRunes.filter((r) => {
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
              rarity: rarities[currentTierIdx + 1],
            });

            console.log(
              `[Worker] Synthesized 5 ${sample.rarity} ${sample.runeId} into 1 ${rarities[currentTierIdx + 1]}`,
            );
          }
          break; // 한 번에 한 종류만 합성
        }
      }
      break;
    }
  }
};
