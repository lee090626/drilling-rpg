/**
 * 연성 제단(Synthesis Altar)에서 사용하는 성물 제작 레시피 데이터입니다.
 */

export interface SynthesisRecipe {
  id: string; // 결과물 Artifact ID
  requirements: {
    [resource: string]: number;
  };
}

export const SYNTHESIS_RECIPES: SynthesisRecipe[] = [
  {
    id: 'relic_asmodeus_core',
    requirements: {
      circle_2_essence: 10,
      crimsonstone: 50,
      goldCoins: 10000
    }
  },
  {
    id: 'relic_beelzebub_core',
    requirements: {
      circle_3_essence: 15,
      moldstone: 75,
      goldCoins: 25000
    }
  },
  {
    id: 'relic_mammon_core',
    requirements: {
      circle_4_essence: 20,
      goldstone: 100,
      goldCoins: 50000
    }
  },
  {
    id: 'relic_belphegor_eye',
    requirements: {
      circle_4_essence: 10,
      midasite: 30,
      goldCoins: 30000
    }
  },
  {
      id: 'relic_phlegyas_brand',
      requirements: {
        circle_5_essence: 25,
        furystone: 50,
        goldCoins: 100000
      }
  },
  {
    id: 'relic_dismas_key',
    requirements: {
      circle_6_essence: 30,
      vexite: 40,
      goldCoins: 150000
    }
  },
  {
    id: 'relic_geryon_scale',
    requirements: {
      circle_8_essence: 40,
      phantomite: 20,
      goldCoins: 300000
    }
  },
  {
    id: 'relic_lucifer_crown',
    requirements: {
      circle_9_essence: 50,
      abyssstone: 10,
      goldCoins: 1000000
    }
  }
];

export const SYNTHESIS_DATA = SYNTHESIS_RECIPES.reduce((acc, current) => {
  acc[current.id] = current;
  return acc;
}, {} as Record<string, SynthesisRecipe>);
