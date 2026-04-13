import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { calculateArtifactBonuses } from '@/shared/lib/artifactUtils';

/**
 * 플레이어의 영구 스탯(체력, 이속 등)을 장비, 마스터리 및 유물 보너스에 맞춰 동기화합니다.
 */
export function syncPermanentStats(player: any) {
  const masteryBonuses = getMasteryBonuses(player.stats);
  const artifactBonuses = calculateArtifactBonuses(player.stats);

  // 1. 장착 데이터 안전 추출 (레거시 데이터 대응)
  let { equipment } = player.stats;
  
  // 데이터 마이그레이션: 구버전 세이브 유저를 위해 필드가 없을 경우 자동 생성
  if (!equipment) {
    player.stats.equipment = {
      drillId: player.stats.equippedDrillId || null,
      helmetId: null,
      armorId: null,
      bootsId: null,
    };
    equipment = player.stats.equipment;
  }

  // 기타 누락된 컬렉션들 자동 복구
  if (!player.stats.ownedEquipmentIds) {
    player.stats.ownedEquipmentIds = player.stats.ownedDrillIds || [];
  }
  if (!player.stats.equipmentStates) {
    player.stats.equipmentStates = {};
  }
  if (player.stats.defense === undefined) player.stats.defense = 0;
  if (player.stats.luck === undefined) player.stats.luck = 0;

  // 1. 장비 스탯 합계 계산 (초기값 0)
  let eqPower = 0;
  let eqMaxHp = 0;
  let eqMoveSpeed = 0;
  let eqDefense = 0;

  // 각 슬롯별 장착품 ID 수집
  const slotIds = [equipment.drillId, equipment.helmetId, equipment.armorId, equipment.bootsId];

  slotIds.forEach((id) => {
    if (!id) return;
    const eq = EQUIPMENTS[id];
    if (!eq) return;

    if (eq.stats.power) eqPower += eq.stats.power;
    if (eq.stats.maxHp) eqMaxHp += eq.stats.maxHp;
    if (eq.stats.moveSpeed) eqMoveSpeed += eq.stats.moveSpeed;
    if (eq.stats.defense) eqDefense += eq.stats.defense;
  });

  // 2. 최대 체력 동기화: (기본 200 + 장비HP + 마스터리고정 + 유물고정) * (1 + 마스터리배율)
  const baseHp = 200 + eqMaxHp + masteryBonuses.maxHp + (artifactBonuses?.maxHp || 0);
  const finalMaxHp = Math.floor(baseHp * (1 + masteryBonuses.maxHpMult));

  const hpRatio = player.stats.maxHp > 0 ? player.stats.hp / player.stats.maxHp : 1;
  player.stats.maxHp = finalMaxHp;
  player.stats.hp = Math.floor(finalMaxHp * hpRatio);

  // 3. 이동 속도 동기화: (기본 100 + 장비이속 + 유물 이속) * (기본 배율 1.0 + 마스터리 배율)
  const baseMoveSpeed = 100 + eqMoveSpeed + (artifactBonuses?.moveSpeed || 0) + masteryBonuses.moveSpeed;
  const totalMoveSpeedMult = 1.0 + masteryBonuses.moveSpeedMult;
  player.stats.moveSpeed = Math.floor(baseMoveSpeed * totalMoveSpeedMult);

  // 4. 공격력(Power) 동기화: (기본 20 + 장비Power) + 유물 공격력
  player.stats.power = 20 + eqPower + (artifactBonuses?.power || 0);

  // 5. 방어력 적용
  player.stats.defense = eqDefense + (artifactBonuses?.defense || 0);
}

/**
 * 매 프레임 호출되어 플레이어의 스탯을 최신 보너스 상태와 동기화하는 시스템입니다.
 */
export const statsSyncSystem = (player: any) => {
  syncPermanentStats(player);
};
