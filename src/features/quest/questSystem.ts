import { GameWorld } from '../../entities/world/model';

export const questSystem = (world: GameWorld) => {
  const { player } = world;
  const { activeQuests, completedQuestIds } = player.stats;

  activeQuests.forEach((quest, index) => {
    // 1. Update progress based on type
    if (quest.requirement.type === 'depth') {
      quest.requirement.current = Math.floor(player.stats.depth);
    }
    // Other types (mining counts) are updated directly in MiningSystem

    // 2. Auto-complete check (or marking as ready)
    if (quest.requirement.current >= quest.requirement.target) {
      // In this game, quests seem to be completed via the NPC, 
      // but we update the current progress here.
    }
  });
};
