import { GameWorld } from '@/entities/world/model';
import { getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { calculateArtifactBonuses, hasArtifactEffect } from '@/shared/lib/artifactUtils';
import { miningTargeter } from './mining/MiningTargeter';
import { miningExecutor } from './mining/MiningExecutor';
import { masteryService } from './mining/MasteryService';

/**
 * 플레이어의 채굴 로직을 관리하는 메인 시스템(오케스트레이터)입니다.
 * 관심사의 분리에 따라 타겟팅, 실행, 보상 처리를 전문 시스템에 위임합니다.
 */
export const miningSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  // 1. 공통 보너스 및 캐시 연산 (전략적으로 필요한 데이터만 계산)
  const masteryBonuses = getMasteryBonuses(player.stats);
  const artifactBonuses = calculateArtifactBonuses(player.stats);

  let masteryExpMultiplier = 1.0 + masteryBonuses.masteryExpMult;
  if (hasArtifactEffect(player.stats, 'MASTERY_BOOST')) {
    masteryExpMultiplier += 3.0;
  }

  const luck = Math.max(
    0,
    (getTotalRuneStat(player.stats, 'luck') * 100 +
      masteryBonuses.luck +
      artifactBonuses.luck * 100) *
      (1 + masteryBonuses.luckMult),
  );
  const masteryExpGain = Math.floor(10 * masteryExpMultiplier);

  // 2. [SoC: 타겟팅] 무엇을 조준할 것인가?
  const { hasMonsterTarget } = miningTargeter(world);

  // 3. [SoC: 실행] 타격 및 파괴 수행
  const result = miningExecutor(world, now, hasMonsterTarget);

  // 4. [SoC: 보상] 파괴 성공 시 아이템 및 숙련도 처리
  if (result && result.destroyed) {
    masteryService(
      world,
      world.intent.miningTarget!.x,
      world.intent.miningTarget!.y,
      result.targetType,
      luck,
      masteryExpGain
    );
  }
};

