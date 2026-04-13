import { GameWorld } from '@/entities/world/model';
import { handleEconomyAction } from './actions/economyActions';
import { handleRuneAction } from './actions/runeActions';
import { handleWorldAction } from './actions/worldActions';

type ActionHandler = (world: GameWorld, action: string, data: any) => void;

/**
 * 액션 도메인별 핸들러 맵 (Strategy Pattern)
 */
const actionHandlers: Record<string, ActionHandler> = {
  // 경제 관련
  upgrade: handleEconomyAction,
  sell: handleEconomyAction,
  craft: handleEconomyAction,

  // 룬 관련
  summonRune: handleRuneAction,
  equipRune: handleRuneAction,
  unequipRune: handleRuneAction,
  synthesizeRunes: handleRuneAction,
};

/**
 * 게임 내 플레이어의 명시적인 액션(아이템 구매, 강화, 제련, 차원 이동 등)을 처리하는 시스템입니다.
 * 도메인별 핸들러 맵핑을 통해 액션을 적절한 로직으로 위임합니다.
 */
export function handlePlayerAction(world: GameWorld, payload: any) {
  const { action, data } = payload;
  const handler = actionHandlers[action] || handleWorldAction;

  handler(world, action, data);
}
