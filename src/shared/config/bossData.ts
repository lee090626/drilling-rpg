export interface BossDefinition {
  id: string;
  name: string;
  icon: string;
  depth: number;
  description: string;
  stats: {
    hp: number;
    attack: number;
  };
}

export const BOSSES: BossDefinition[] = [
  {
    id: 'ancient_guardian',
    name: '고대 수호자 (Ancient Guardian)',
    icon: '👾',
    depth: 1000,
    description: '지하 1000m 지점의 관문을 지키는 기계 생명체입니다. 고대의 코어를 품고 있습니다.',
    stats: {
      hp: 50000,
      attack: 100,
    },
  },
  {
    id: 'void_reaper',
    name: '공허의 수확자 (Void Reaper)',
    icon: '👹',
    depth: 5000,
    description: '심연의 끝에서 발견된 미지의 존재입니다. 모든 빛을 흡수하는 성질을 가졌습니다.',
    stats: {
      hp: 250000,
      attack: 500,
    },
  },
];
