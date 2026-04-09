import { useCallback } from 'react';
import { GameWorld } from '@/entities/world/model';
import { saveManager, SaveData } from '@/shared/lib/saveManager';
import { CraftRequirements, CraftResult, Rarity } from '@/shared/types/game';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { DRILLS } from '@/shared/config/drillData';
import { REFINERY_RECIPES } from '@/shared/config/refineryData';
import { RESEARCH_NODES } from '@/shared/config/researchData';
import { getResearchBonuses } from '@/shared/lib/researchUtils';
import { getDroneData } from '@/shared/config/droneData';
import { createInitialMasteryState } from '@/shared/lib/masteryUtils';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import { TILE_SIZE } from '@/shared/config/constants';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';

/**
 * 게임의 핵심 액션(업그레이드, 제작, 판매 등)을 처리하는 커스텀 훅입니다.
 */
export const useGameActions = (
  worldRef: React.MutableRefObject<GameWorld>, 
  updateUi: () => void,
  sendToWorker: (type: string, payload?: any) => void
) => {

  /** 업그레이드(공격력, 최대 체력) 처리 */
  const handleUpgrade = useCallback((type: string, requirements: CraftRequirements) => {
    sendToWorker('ACTION', { 
      action: 'upgrade', 
      data: { type, requirements } 
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 새로운 아이템 제작 처리 */
  const handleCraft = useCallback((req: CraftRequirements, res: any) => {
    // 실제 재료 차감 및 데이터 추가는 워커에서 처리하도록 액션 전송
    sendToWorker('ACTION', {
      action: 'craft',
      data: { req, res }
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 펫 드론 장착 변경 */
  const handleEquipDrone = useCallback((id: string) => {
    sendToWorker('ACTION', {
      action: 'equip',
      data: { type: 'drone', id }
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 수집한 자원 판매 처리 */
  const handleSell = useCallback((resource: string, amount: number, price: number) => {
    sendToWorker('ACTION', {
      action: 'sell',
      data: { resource, amount, price }
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 드릴 장착 변경 */
  const handleEquipDrill = useCallback((id: string) => {
    sendToWorker('ACTION', {
      action: 'equip',
      data: { type: 'drill', id }
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 가챠(Summon) 시스템: 랜 스킬룬 획득 */
  const handleSummonRune = useCallback((tier: number, count: number = 1) => {
    sendToWorker('ACTION', {
      action: 'summonRune',
      data: { tier, count }
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 동일 등급 + 동일 종류의 룬 5개를 상위 등급 1개로 확정 합성 */
  const handleSynthesizeRunes = useCallback(() => {
    sendToWorker('ACTION', {
      action: 'synthesizeRunes'
    });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 유물 장착 변경 */
  const handleEquipArtifact = useCallback((id: string) => {
    sendToWorker('ACTION', { action: 'equip', data: { type: 'artifact', id } });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 드릴 슬롯에 스킬룬 장착 */
  const handleEquipRune = useCallback((runeInstanceId: string, slotIndex: number) => {
    sendToWorker('ACTION', { action: 'equipRune', data: { runeInstanceId, slotIndex } });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 드릴 슬롯에서 스킬룬 해제 */
  const handleUnequipRune = useCallback((drillId: string, slotIndex: number) => {
    sendToWorker('ACTION', { action: 'unequipRune', data: { drillId, slotIndex } });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 엘리베이터를 통한 층 이동 처리 */
  const handleSelectCheckpoint = useCallback((depth: number) => {
    sendToWorker('ACTION', { action: 'selectCheckpoint', data: { depth } });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 용광로에서 새로운 제련 작업 시작 */
  const handleStartSmelting = useCallback((recipeId: string) => {
    const stats = worldRef.current.player.stats;
    const recipe = REFINERY_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // UI 스레드에서 간단한 유효성 검사 (피드백용)
    if ((stats.inventory[recipe.inputId as any] || 0) < recipe.inputAmount) {
      alert("Not enough raw materials!");
      return;
    }
    
    sendToWorker('ACTION', { action: 'startSmelting', data: { recipeId } });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 완료된 제련 작업 수거 */
  const handleCollectSmelting = useCallback((jobId: string) => {
    sendToWorker('ACTION', { action: 'collectSmelting', data: { jobId } });
    updateUi();
  }, [sendToWorker, updateUi]);
  
  /** 연구소에서 새로운 연구(스킬) 해금 */
  const handleUnlockResearch = useCallback((researchId: string) => {
    sendToWorker('ACTION', { action: 'unlockResearch', data: { researchId } });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 맵을 새로운 시드로 재생성하고 플레이어 위치를 초기화 */
  const handleRegenerateWorld = useCallback(() => {
    sendToWorker('ACTION', { action: 'regenerateWorld' });
    updateUi();
  }, [sendToWorker, updateUi]);

  /** 장착된 액티브 유물 스킬 사용 처리 */
  const handleUseArtifact = useCallback(() => {
    sendToWorker('ACTION', { action: 'useArtifact' });
    updateUi();
  }, [sendToWorker, updateUi]);

  const handleResetGame = useCallback(() => {
    if (confirm("Are you sure you want to reset all progress?")) {
      saveManager.clear();
      window.location.reload();
    }
  }, []);

  const handleExportSave = useCallback(() => {
    sendToWorker('SAVE_REQUEST', { type: 'export' });
  }, [sendToWorker]);

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

  return {
    handleUpgrade,
    handleCraft,
    handleSell,
    handleSummonRune,
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
    handleUnlockResearch,
    handleUseArtifact,
    handleEquipArtifact,
    handleTravelDimension: useCallback(() => {
      sendToWorker('ACTION', { action: 'travelDimension' });
      updateUi();
    }, [sendToWorker, updateUi]),
    handleRespawn: useCallback(() => {
      sendToWorker('ACTION', { action: 'respawn' });
      updateUi();
    }, [sendToWorker, updateUi])
  };
};
