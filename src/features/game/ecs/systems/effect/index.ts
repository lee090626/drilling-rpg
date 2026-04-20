import { GameWorld } from '@/entities/world/model';
import { showToast } from '../toastSystem';
import { updateParticles } from './ParticlePhysics';
import { updateFloatingTexts } from './FloatingTextPhysics';
import { updateLootCollection } from './LootCollector';

// Buffer for item pickup aggregation
const pickupBuffer: Record<string, number> = {};
let lastPickupEventTime = 0;
const AGGREGATION_WINDOW = 1200; 

/**
 * 시각 효과(파티클, 부동 텍스트) 및 아이템 드롭/수집을 관리하는 도메인 오케스트레이터입니다.
 * - 화면 흔들림(Shake) 관리
 * - 개별 시각 효과 및 물리 시스템 실행 (Specialists)
 * - 아이템 획득 알림 취합(Aggregation) 처리
 */
export const effectSystem = (world: GameWorld, deltaTime: number) => {
  const now = Date.now();

  // 1. 아이템 획득 알림(Toast) 취합 처리
  if (lastPickupEventTime > 0 && now - lastPickupEventTime > AGGREGATION_WINDOW) {
    const entries = Object.entries(pickupBuffer);
    if (entries.length > 0) {
      const message = entries.map(([id, count]) => `${id.toUpperCase()} x${count}`).join(', ');
      showToast(`${message} Acquired!`, 'info', 2000);
      for (const key in pickupBuffer) delete pickupBuffer[key];
      lastPickupEventTime = 0;
    }
  }

  // 2. 화면 흔들림(Shake) 감쇠 처리
  if (world.shake > 0) {
    world.shake *= Math.pow(0.8, deltaTime / 16.6);
    if (world.shake < 0.1) world.shake = 0;
  }

  // 3. [Specialist] 파티클 물리 업데이트
  updateParticles(world, deltaTime);

  // 4. [Specialist] 부동 텍스트 물리 및 추적 업데이트
  updateFloatingTexts(world, deltaTime);

  // 5. [Specialist] 드롭 아이템 물리 및 수집 업데이트
  updateLootCollection(world, deltaTime);
  
  // 6. Specialist가 수집한 데이터를 UI Toast용 버퍼로 전이
  const buffer = world.aggregationBuffer || {};
  const bufferEntries = Object.entries(buffer);
  if (bufferEntries.length > 0) {
    for (const [id, amount] of bufferEntries) {
      pickupBuffer[id] = (pickupBuffer[id] || 0) + (amount as number);
      delete buffer[id];
    }
    lastPickupEventTime = now;
  }
};
