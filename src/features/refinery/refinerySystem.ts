import { GameWorld } from '../../entities/world/model';
import { DRONES, getDroneData } from '../../shared/config/droneData';
import { REFINERY_RECIPES } from '../../shared/config/refineryData';

/**
 * 제련소의 자동화 로직을 담당하는 시스템입니다.
 * 특정 드론(Auto Refiner 등)이 장착되어 있을 때 자동으로 수집 및 시작을 수행합니다.
 */
export const refinerySystem = (world: GameWorld, now: number) => {
  const { player } = world;
  const stats = player.stats;
  
  if (!stats.equippedDroneId) return;
  
  const drone = getDroneData(stats.equippedDroneId);
  if (!drone || drone.specialEffect !== 'auto_smelt') return;

  // 1. 자동 수집 (Finished Jobs -> Inventory)
  const completedJobs = stats.activeSmeltingJobs.filter(job => {
    return now - job.startTime >= job.durationMs;
  });

  if (completedJobs.length > 0) {
    completedJobs.forEach(job => {
      // 인벤토리에 추가
      const inv = stats.inventory as any;
      inv[job.outputItem] = (inv[job.outputItem] || 0) + job.amount;
      
      // 알림 텍스트 (옵션, 너무 많으면 지저분할 수 있음)
      // console.log(`Auto-collected: ${job.outputItem} x ${job.amount}`);
    });

    // 수집된 작업 제거
    stats.activeSmeltingJobs = stats.activeSmeltingJobs.filter(job => {
      return now - job.startTime < job.durationMs;
    });
  }

  // 2. 자동 시작 (Empty Slots -> New Jobs)
  const speedMult = drone.smeltSpeedMult || 1;
  const extraSlots = drone.smeltSlotBonus || 0;
  const maxSlots = stats.refinerySlots + extraSlots;

  if (stats.activeSmeltingJobs.length < maxSlots) {
    // 제련 가능한 레시피 탐색 (우선순위: 다이아몬드 > 골드 > 아이언)
    const priority = ['diamond', 'gold', 'iron'];
    
    for (const mineralKey of priority) {
      const recipe = REFINERY_RECIPES.find(r => r.inputId === mineralKey);
      if (!recipe) continue;

      const rawAmount = (stats.inventory as any)[recipe.inputId] || 0;
      if (rawAmount >= recipe.inputAmount) {
        // 자동 시작
        (stats.inventory as any)[recipe.inputId] -= recipe.inputAmount;
        
        stats.activeSmeltingJobs.push({
          id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          inputMineral: recipe.inputId,
          outputItem: recipe.outputId,
          amount: recipe.outputAmount,
          startTime: Date.now(),
          durationMs: recipe.durationMs * speedMult
        });
        
        // 한 번에 하나씩만 시작 (다음 루프에서 나머지 처리)
        break;
      }
    }
  }
};
