import { PlayerStats } from '../types/game';
import { RESEARCH_NODES } from '../config/researchData';

/**
 * 해금된 연구 항목들을 기반으로 플레이어의 총 보너스 수치를 계산합니다.
 */
export const getResearchBonuses = (stats: PlayerStats) => {
  const bonuses = {
    power: 0,
    miningSpeed: 0, // 기본 0 (연사 속도 감소 비율)
    moveSpeed: 1,   // 기본 1 (배수)
    luck: 1,        // 기본 1 (배수)
    goldBonus: 1,   // 기본 1 (배수)
    masteryExp: 1,  // 기본 1 (배수)
  };

  if (!stats.unlockedResearchIds) return bonuses;

  stats.unlockedResearchIds.forEach(id => {
    const node = RESEARCH_NODES.find(n => n.id === id);
    if (!node) return;

    switch (node.effect.type) {
      case 'power':
        bonuses.power += node.effect.value;
        break;
      case 'miningSpeed':
        bonuses.miningSpeed += node.effect.value;
        break;
      case 'moveSpeed':
        bonuses.moveSpeed += node.effect.value;
        break;
      case 'luck':
        bonuses.luck += node.effect.value;
        break;
      case 'goldBonus':
        bonuses.goldBonus += node.effect.value;
        break;
      case 'masteryExp':
        bonuses.masteryExp += node.effect.value;
        break;
    }
  });

  return bonuses;
};

/**
 * 연구 노드들의 계층 구조를 분석하여 자동으로 시각적 좌표를 계산합니다.
 */
export const calculateNodePositions = (nodes: any[]) => {
  const horizontalSpacing = 220;
  const verticalSpacing = 150;

  // 1. 각 노드의 깊이(Level) 계산
  const depths: { [id: string]: number } = {};
  
  const getDepth = (id: string): number => {
    if (depths[id] !== undefined) return depths[id];
    
    const node = nodes.find(n => n.id === id);
    if (!node || node.dependencies.length === 0) {
      depths[id] = 0;
      return 0;
    }
    
    const maxParentDepth = Math.max(...node.dependencies.map((depId: string) => getDepth(depId)));
    depths[id] = maxParentDepth + 1;
    return depths[id];
  };

  nodes.forEach(node => getDepth(node.id));

  // 2. 같은 깊이의 노드들 그룹화
  const levelGroups: { [level: number]: string[] } = {};
  Object.entries(depths).forEach(([id, level]) => {
    if (!levelGroups[level]) levelGroups[level] = [];
    levelGroups[level].push(id);
  });

  // 3. X, Y 좌표 할당
  const positionedNodes = nodes.map(node => {
    const level = depths[node.id];
    const siblings = levelGroups[level];
    const index = siblings.indexOf(node.id);
    
    // 중앙 정렬을 위한 오프셋 계산
    const totalHeight = (siblings.length - 1) * verticalSpacing;
    const y = index * verticalSpacing - totalHeight / 2;
    const x = level * horizontalSpacing;

    return {
      ...node,
      position: { x, y }
    };
  });

  return positionedNodes;
};
