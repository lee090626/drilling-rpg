import { getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { calculateArtifactBonuses } from '@/shared/lib/artifactUtils';

/**
 * 플레이어의 영구 스탯(체력, 이속 등)을 마스터리 및 유물 보너스에 맞춰 동기화합니다.
 */
export function syncPermanentStats(player: any) {
  const masteryBonuses = getMasteryBonuses(player.stats);
  const artifactBonuses = calculateArtifactBonuses(player.stats);

  // 1. 최대 체력 동기화: (기본 100 + 마스터리고정 + 유물고정) * (1 + 마스터리배율)
  const baseHp = 100 + masteryBonuses.maxHp + (artifactBonuses?.maxHp || 0);
  const finalMaxHp = Math.floor(baseHp * (1 + masteryBonuses.maxHpMult));

  // 현재 체력 비율 유지하며 최대 체력 갱신
  const hpRatio = player.stats.maxHp > 0 ? player.stats.hp / player.stats.maxHp : 1;
  player.stats.maxHp = finalMaxHp;
  player.stats.hp = Math.floor(finalMaxHp * hpRatio);

  // 2. 이동 속도 동기화: (기본 이속 + 유물 이속) * (기본 배율 1.0 + 마스터리 배율)
  const baseMoveSpeed = 100 + (artifactBonuses?.moveSpeed || 0) + masteryBonuses.moveSpeed;
  const totalMoveSpeedMult = 1.0 + masteryBonuses.moveSpeedMult;
  player.stats.moveSpeed = Math.floor(baseMoveSpeed * totalMoveSpeedMult);

  // 3. 공격력(Power) 동기화: 기본 공격력 + 유물 공격력
  player.stats.power = 10 + (artifactBonuses?.power || 0);
}

/**
 * 매 프레임 호출되어 플레이어의 스탯을 최신 보너스 상태와 동기화하는 시스템입니다.
 */
export const statsSyncSystem = (player: any) => {
  syncPermanentStats(player);
};
