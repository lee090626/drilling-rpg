import { useCallback } from 'react';
import { GameWorld } from '../../../entities/world/model';
import { saveManager, SaveData } from '../../../shared/lib/saveManager';
import { CraftRequirements, CraftResult, Rarity } from '../../../shared/types/game';
import { SKILL_RUNES } from '../../../shared/config/skillRuneData';
import { REFINERY_RECIPES } from '../../../shared/config/refineryData';
import { RESEARCH_NODES } from '../../../shared/config/researchData';
import { getResearchBonuses } from '../../../shared/lib/researchUtils';
import { getDroneData } from '../../../shared/config/droneData';

/**
 * 게임의 핵심 액션(업그레이드, 제작, 판매 등)을 처리하는 커스텀 훅입니다.
 * @param worldRef 게임 월드 상태 객체에 대한 Ref
 * @param updateUi UI 갱신을 트리거하는 콜백 함수
 */
export const useGameActions = (worldRef: React.MutableRefObject<GameWorld>, updateUi: () => void) => {

  /** 업그레이드(공격력, 최대 체력) 처리 */
  const handleUpgrade = useCallback((type: string, requirements: CraftRequirements) => {
    const { player } = worldRef.current;
    
    // 비용 차감 로직
    if (requirements) {
      Object.entries(requirements).forEach(([res, amount]) => {
        const amt = amount as number;
        if (res === 'goldCoins') {
          player.stats.goldCoins -= amt;
        } else if ((player.stats.inventory as any)[res] !== undefined) {
          (player.stats.inventory as any)[res] -= amt;
        }
      });
    }

    // 능력치 증가
    if (type === 'attackPower') player.stats.attackPower += 5;
    else if (type === 'maxHp') player.stats.maxHp += 20;
    
    updateUi();
  }, [worldRef, updateUi]);

  /** 새로운 아이템 제작 처리 */
  const handleCraft = useCallback((req: CraftRequirements, res: any) => {
    const { player } = worldRef.current;
    
    // 재료 차감
    if (req) {
      Object.entries(req).forEach(([resource, amount]) => {
        const amt = amount as number;
        if (resource === 'goldCoins') {
          player.stats.goldCoins -= amt;
        } else if ((player.stats.inventory as any)[resource] !== undefined) {
          (player.stats.inventory as any)[resource] -= amt;
        }
      });
    }

    // 보유 드릴/드론 목록에 추가
    if (res.drillId) {
      if (!player.stats.ownedDrillIds) player.stats.ownedDrillIds = [];
      if (!player.stats.ownedDrillIds.includes(res.drillId)) {
        player.stats.ownedDrillIds.push(res.drillId);
      }
    }
    if (res.droneId) {
      if (!player.stats.ownedDroneIds) player.stats.ownedDroneIds = [];
      if (!player.stats.ownedDroneIds.includes(res.droneId)) {
        player.stats.ownedDroneIds.push(res.droneId);
      }
    }
    updateUi();
  }, [worldRef, updateUi]);

  /** 펫 드론 장착 변경 */
  const handleEquipDrone = useCallback((id: string) => {
    worldRef.current.player.stats.equippedDroneId = id;
    updateUi();
  }, [worldRef, updateUi]);

  /** 수집한 자원 판매 처리 */
  const handleSell = useCallback((resource: string, amount: number, price: number) => {
    const { player } = worldRef.current;
    const inv = player.stats.inventory as any;
    if (inv[resource] >= amount) {
      inv[resource] -= amount;
      const researchBonuses = getResearchBonuses(player.stats);
      player.stats.goldCoins += Math.floor(price * researchBonuses.goldBonus);
      updateUi();
    }
  }, [worldRef, updateUi]);

  /** 가챠(Rune Extraction) 시스템: 랜덤 스킬룬 획득 */
  const handleExtractRune = useCallback((tier: number) => {
    const { player } = worldRef.current;
    const baseCost = 500;
    // 티어가 올라갈수록 비용 증가 (예: 500, 1000, 2000, 4000...)
    const cost = baseCost * Math.pow(2, tier);

    if (player.stats.goldCoins >= cost) {
      player.stats.goldCoins -= cost;
      
      const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
      
      // 베이스 등급 한계 처리
      const baseTierIdx = Math.min(tier, rarities.length - 1);
      
      // 확률 로직: 95% 확률로 기본 등급, 5% 확률로 한 단계 더 높은 등급 (크리티컬)
      const isCrit = Math.random() < 0.05;
      const finalTierIdx = Math.min(baseTierIdx + (isCrit ? 1 : 0), rarities.length - 1);
      const selectedRarity = rarities[finalTierIdx];
      
      // 6종의 베이스 룬 중 무작위 1개 선택
      const availableRunes = Object.values(SKILL_RUNES);
      const selectedRune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
      const newRuneId = `rune_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      if (!player.stats.inventoryRunes) {
         player.stats.inventoryRunes = [];
      }
      
      player.stats.inventoryRunes.push({
        id: newRuneId,
        runeId: selectedRune.id, 
        rarity: selectedRarity
      });
      
      if (isCrit) {
        alert(`🌟 CRITICAL EXTRACTION! 🌟\nTier ${tier} -> Acquired [${selectedRarity}] ${selectedRune.name}!`);
      } else {
        alert(`🎉 Tier ${tier} Extraction - Acquired [${selectedRarity}] ${selectedRune.name}! 🎉`);
      }
      updateUi();
    } else {
      alert(`Not enough gold! You need ${cost.toLocaleString()} G.`);
    }
  }, [worldRef, updateUi]);

  /** 동일 등급 + 동일 종류의 룬 5개를 상위 등급 1개로 확정 합성 */
  const handleSynthesizeRunes = useCallback(() => {
    const { player } = worldRef.current;
    if (!player.stats.inventoryRunes || player.stats.inventoryRunes.length === 0) {
      alert('No runes available for synthesis.');
      return;
    }

    const rarityOrder: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'];
    let totalSynthesized = 0;
    let currentRunes = [...player.stats.inventoryRunes];
    
    let hasMerged = true;
    while(hasMerged) {
      hasMerged = false;
      // 종류(runeId)와 등급(rarity)을 기준으로 그룹화
      const grouped: Record<string, any[]> = {};
      currentRunes.forEach(r => {
        const key = `${r.runeId}_${r.rarity}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
      });
      
      const nextRunes: any[] = [];
      
      Object.entries(grouped).forEach(([key, runes]) => {
        const rarity = runes[0].rarity as Rarity;
        const rarityIdx = rarityOrder.indexOf(rarity);
        
        // 최상위 등급이거나 스펙에 없으면 그대로 보존
        if (rarityIdx === -1 || rarityIdx >= rarityOrder.length - 1) {
          nextRunes.push(...runes);
          return;
        }
        
        const merges = Math.floor(runes.length / 5);
        const remainder = runes.length % 5;
        
        // 합성 안 된 나머지는 그대로 넣음
        for (let i = 0; i < remainder; i++) {
          nextRunes.push(runes[i]);
        }
        
        if (merges > 0) {
          hasMerged = true;
          totalSynthesized += merges;
          for (let i = 0; i < merges; i++) {
            nextRunes.push({
              id: `r_${Date.now()}_${Math.random()}`,
              runeId: runes[0].runeId,
              rarity: rarityOrder[rarityIdx + 1]
            });
          }
        }
      });
      
      currentRunes = nextRunes;
    }
    
    if (totalSynthesized > 0) {
      player.stats.inventoryRunes = currentRunes;
      updateUi();
      alert(`🎉 Successfully synthesized ${totalSynthesized} times! Check your inventory. 🎉`);
    } else {
      alert('You need at least 5 matching runes of the same type and rarity.');
    }
  }, [worldRef, updateUi]);

  /** 드릴 장착 변경 */
  const handleEquipDrill = useCallback((id: string) => {
    worldRef.current.player.stats.equippedDrillId = id;
    updateUi();
  }, [worldRef, updateUi]);

  /** 드릴 슬롯에 스킬룬 장착 */
  const handleEquipRune = useCallback((runeInstanceId: string, slotIndex: number) => {
    const { player } = worldRef.current;
    const drillId = player.stats.equippedDrillId;
    const state = player.stats.equipmentStates[drillId];
    
    if (state) {
      // 룬 슬롯 배열이 없거나 짧을 경우 초기화 (호환성 유지)
      if (!state.slottedRunes) state.slottedRunes = [];
      
      if (slotIndex < state.slottedRunes.length) {
        state.slottedRunes[slotIndex] = runeInstanceId;
        updateUi();
      }
    }
  }, [worldRef, updateUi]);

  /** 드릴 슬롯에서 스킬룬 해제 */
  const handleUnequipRune = useCallback((drillId: string, slotIndex: number) => {
    const { player } = worldRef.current;
    const state = player.stats.equipmentStates[drillId];
    if (state && state.slottedRunes && slotIndex < state.slottedRunes.length) {
      state.slottedRunes[slotIndex] = null;
      updateUi();
    }
  }, [worldRef, updateUi]);

  /** 엘리베이터를 통한 층 이동 처리 */
  const handleSelectCheckpoint = useCallback((depth: number) => {
    const world = worldRef.current;
    world.player.pos.y = depth + 10;
    world.player.visualPos.y = depth + 10;
    world.player.stats.depth = depth;
    world.ui.isElevatorOpen = false;
    updateUi();
  }, [worldRef, updateUi]);

  const toggleModal = useCallback((target: keyof GameWorld['ui']) => {
    const { ui } = worldRef.current;
    const current = ui[target];
    
    (ui as any)[target] = !current;
    updateUi();
  }, [worldRef, updateUi]);

  const handleClose = useCallback((target: keyof GameWorld['ui']) => {
    (worldRef.current.ui as any)[target] = false;
    updateUi();
  }, [worldRef, updateUi]);

  const handleOpen = useCallback((target: keyof GameWorld['ui']) => {
    (worldRef.current.ui as any)[target] = true;
    updateUi();
  }, [worldRef, updateUi]);

  /** 세이브 데이터 전체 초기화 */
  const handleResetGame = useCallback(() => {
    saveManager.clear();
    window.location.reload();
  }, []);

  /** 현재 세이브 데이터를 코드 형태로 내보내기 */
  const handleExportSave = useCallback(() => {
    const world = worldRef.current;
    const saveData: SaveData = {
      version: 1,
      timestamp: Date.now(),
      stats: world.player.stats,
      position: world.player.pos,
      tileMap: world.tileMap.serialize(),
    };
    const exported = saveManager.export(saveData);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(exported);
      alert('Save code copied to clipboard.');
    }
  }, [worldRef]);

  /** 세이브 코드를 통해 데이터를 가져오기 */
  const handleImportSave = useCallback((code: string) => {
    if (code) {
      const imported = saveManager.import(code);
      if (imported) {
        saveManager.save(imported);
        window.location.reload();
      } else {
        alert('Invalid save code.');
      }
    }
  }, []);

  /** 용광로에서 새로운 제련 작업 시작 */
  const handleStartSmelting = useCallback((recipeId: string) => {
    const world = worldRef.current;
    const stats = world.player.stats;
    const recipe = REFINERY_RECIPES.find(r => r.id === recipeId);
    
    if (!recipe) return;
    
    // 장착된 드론의 보너스 계산
    const equippedDrone = getDroneData(stats.equippedDroneId);
    const speedMult = equippedDrone?.smeltSpeedMult || 1;
    const extraSlots = equippedDrone?.smeltSlotBonus || 0;
    const maxSlots = stats.refinerySlots + extraSlots;
    
    // 조건 검사
    if (stats.activeSmeltingJobs.length >= maxSlots) {
      alert("No available furnace slots!");
      return;
    }
    if ((stats.inventory[recipe.inputId as any] || 0) < recipe.inputAmount) {
      alert("Not enough raw materials!");
      return;
    }
    
    // 자원 소모
    (stats.inventory[recipe.inputId as any] as number) -= recipe.inputAmount;
    
    // 큐에 추가 (드론 속도 보너스 적용)
    stats.activeSmeltingJobs.push({
      id: `smelt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      inputMineral: recipe.inputId,
      outputItem: recipe.outputId,
      amount: recipe.outputAmount,
      startTime: Date.now(),
      durationMs: recipe.durationMs * speedMult
    });
    
    updateUi();
  }, [worldRef, updateUi]);

  /** 완료된 제련 작업 수거 */
  const handleCollectSmelting = useCallback((jobId: string) => {
    const world = worldRef.current;
    const stats = world.player.stats;
    const jobIndex = stats.activeSmeltingJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) return;
    
    const job = stats.activeSmeltingJobs[jobIndex];
    if (Date.now() < job.startTime + job.durationMs) return; // 미완료 시 처리 안 함
    
    // 주괴 획득
    const outKey = job.outputItem as any;
    stats.inventory[outKey] = (stats.inventory[outKey] || 0) + job.amount;
    
    // 큐에서 제거
    stats.activeSmeltingJobs.splice(jobIndex, 1);
    
    updateUi();
  }, [worldRef, updateUi]);
  
  /** 연구소에서 새로운 연구(스킬) 해금 */
  const handleUnlockResearch = useCallback((researchId: string) => {
    const { player } = worldRef.current;
    const node = RESEARCH_NODES.find(n => n.id === researchId);
    
    if (!node) return;
    
    // 이미 해금된 경우
    if (player.stats.unlockedResearchIds.includes(researchId)) return;
    
    // 선행 연구 확인
    const hasDependencies = node.dependencies.every(depId => 
      player.stats.unlockedResearchIds.includes(depId)
    );
    if (!hasDependencies) {
      alert("Prerequisite research not completed.");
      return;
    }
    
    // 비용 확인 및 차감
    const canAfford = Object.entries(node.cost).every(([res, amount]) => {
      if (res === 'goldCoins') return player.stats.goldCoins >= amount;
      return (player.stats.inventory[res as any] || 0) >= (amount as number);
    });
    
    if (!canAfford) {
      alert("Not enough resources.");
      return;
    }
    
    // 비용 지불
    Object.entries(node.cost).forEach(([res, amount]) => {
      if (res === 'goldCoins') {
        player.stats.goldCoins -= amount;
      } else {
        (player.stats.inventory[res as any] as number) -= (amount as number);
      }
    });
    
    // 해금 처리
    player.stats.unlockedResearchIds.push(researchId);
    
    // 특수 효과 즉시 반영 (공격력, 최대체력 등)
    if (node.effect.type === 'attackPower') player.stats.attackPower += node.effect.value;
    if (node.effect.type === 'maxHp') {
        player.stats.maxHp += node.effect.value;
        player.stats.hp += node.effect.value; // 현재 체력도 증가
    }
    
    updateUi();
    alert(`🎉 Research [${node.name}] Unlocked! 🎉`);
  }, [worldRef, updateUi]);

  /** 맵을 새로운 시드로 재생성하고 플레이어 위치를 초기화 */
  const handleRegenerateWorld = useCallback(() => {
    const world = worldRef.current;
    
    // 1. 새로운 랜덤 시드 생성
    const newSeed = Math.floor(Math.random() * 1000000);
    world.player.stats.mapSeed = newSeed;
    
    // 2. 타일맵 인스턴스 새로 생성 (기존 수정 데이터 삭제됨)
    const { TileMap } = require('../../../entities/tile/TileMap');
    world.tileMap = new TileMap(newSeed, world.player.stats.dimension);
    
    // 3. 플레이어 위치를 지상(표면)으로 안전하게 이동
    world.player.pos = { x: 15, y: 8 };
    world.player.visualPos = { x: 15, y: 8 };
    world.player.stats.depth = 0;
    
    // 4. 기존 시각적 효과 및 드랍 아이템 소거
    world.particles = [];
    world.floatingTexts = [];
    world.droppedItems = [];
    
    // 5. 설정창 닫기 및 UI 갱신
    world.ui.isSettingsOpen = false;
    updateUi();
    
    alert('World regenerated with a new seed! Position reset to surface.');
  }, [worldRef, updateUi]);

  return {
    handleUpgrade,
    handleCraft,
    handleSell,
    handleExtractRune,
    handleSynthesizeRunes,
    handleEquipDrill,
    handleEquipDrone,
    handleEquipRune,
    handleUnequipRune,
    handleSelectCheckpoint,
    handleResetGame,
    handleRegenerateWorld,
    handleExportSave,
    handleImportSave,
    handleStartSmelting,
    handleCollectSmelting,
    handleUnlockResearch
  };
};
