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
    name: 'Ancient Guardian',
    icon: '👾',
    depth: 1500,
    description: 'A mechanical lifeform guarding the gateway at 1000m. It holds an ancient core.',
    stats: {
      hp: 50000,
      attack: 100,
    },
  },
  {
    id: 'void_reaper',
    name: 'Void Reaper',
    icon: '👹',
    depth: 5000,
    description: 'A mysterious entity found at the end of the abyss. It has the property of absorbing all light.',
    stats: {
      hp: 250000,
      attack: 500,
    },
  },
];
