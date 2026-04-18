import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import { GameWorld } from '@/entities/world/model';

/**
 * 부활, 체크포인트 이동, 유물 합성 등 월드 관련 액션을 처리합니다.
 */
export const handleWorldAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;

  switch (action) {
    case 'respawn': {
      stats.hp = stats.maxHp;
      world.player.pos = { x: 15, y: 8 };
      world.player.visualPos = { x: 15, y: 8 };

      // 보스 전투 상태 및 환경 물리력 강제 초기화
      // [Rebase Resolve] bossCombatStatus가 Record로 변경됨에 따라 빈 객체로 초기화
      world.bossCombatStatus = {};
      world.environmentalForce = { vx: 0, vy: 0 };
      world.shake = 0;
      
      console.log('[Worker] Player respawned at Base Camp. Combat status reset.');
      break;
    }

    case 'selectCheckpoint': {
      world.player.pos.y = data.depth + 10;
      world.player.visualPos.y = data.depth + 10;
      stats.depth = data.depth;
      break;
    }

    case 'synthesizeRelic': {
      const artifact = ARTIFACT_DATA[data.relicId];
      if (artifact && artifact.requirements) {
        // Unique 아이템이고 이미 해금했다면 중단
        if (artifact.type === 'unique' && stats.unlockedResearchIds.includes(data.relicId)) break;

        const hasEnough = Object.entries(artifact.requirements).every(([res, amt]) => {
          const owned = res === 'goldCoins' ? stats.goldCoins : stats.inventory[res as any] || 0;
          return owned >= (amt as number);
        });

        if (!hasEnough) break;

        // 자원 소모
        Object.entries(artifact.requirements).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else (stats.inventory[res as any] as number) -= amt as number;
        });

        // 결과 반영 (Unique는 ID 리스트, Stackable은 collectionHistory 수치 증가)
        if (artifact.type === 'unique') {
          stats.unlockedResearchIds.push(data.relicId);
        } else {
          if (!stats.collectionHistory) stats.collectionHistory = {};
          stats.collectionHistory[data.relicId] = (stats.collectionHistory[data.relicId] || 0) + 1;
        }
      }
      break;
    }

    case 'useArtifact': {
      world.intent.action = 'artifact';
      break;
    }

    case 'equip': {
      const { id, part } = data;
      if (part === 'Drill') stats.equipment.drillId = id;
      else if (part === 'Helmet') stats.equipment.helmetId = id;
      else if (part === 'Armor') stats.equipment.armorId = id;
      else if (part === 'Boots') stats.equipment.bootsId = id;
      else if (part === 'artifact') stats.equippedArtifactId = id;
      break;
    }
  }
};
