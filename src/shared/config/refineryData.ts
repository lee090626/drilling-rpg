export interface RefineryRecipe {
  id: string;
  name: string;
  inputId: string;
  inputAmount: number;
  outputId: string;
  outputAmount: number;
  durationMs: number;
}

export const REFINERY_RECIPES: RefineryRecipe[] = [
  {
    id: 'smelt_iron_ingot',
    name: 'Iron Ingot',
    inputId: 'iron',
    inputAmount: 5,
    outputId: 'iron_ingot',
    outputAmount: 1,
    durationMs: 10000,
  },
  {
    id: 'smelt_gold_ingot',
    name: 'Gold Ingot',
    inputId: 'gold',
    inputAmount: 5,
    outputId: 'gold_ingot',
    outputAmount: 1,
    durationMs: 15000,
  },
  {
    id: 'cut_diamond',
    name: 'Polished Diamond',
    inputId: 'diamond',
    inputAmount: 5,
    outputId: 'polished_diamond',
    outputAmount: 1,
    durationMs: 30000,
  }
];
