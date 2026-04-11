import { useState, useCallback } from 'react';
import { PlayerStats } from '@/shared/types/game';
import { SKILL_RUNES } from '@/shared/config/skillRuneData';
import { MINERALS } from '@/shared/config/mineralData';

/** 가챠 연출 상태 타입 */
export type GachaState = 'idle' | 'drawing' | 'result';

export interface GachaResult {
  runeId: string;
  rarity: string;
}

export interface RouletteItem {
  runeId: string;
  rarity: string;
}

export interface UseGachaAnimationReturn {
  gachaState: GachaState;
  gachaResults: GachaResult[];
  isMultiDraw: boolean;
  rouletteItems: RouletteItem[];
  startRouletteAnim: boolean;
  performExtraction: (tierIndex: number, count?: number) => void;
  resetGacha: () => void;
}

/**
 * Shop 컴포넌트의 가챠(룬 뽑기) 연출 상태와 로직을 캡슐화한 Custom Hook.
 * 룰렛 애니메이션, 결과 계산, 상태 전이를 관리합니다.
 */
export function useGachaAnimation(
  stats: PlayerStats,
  onSummonRune: (tier: number, count?: number) => void
): UseGachaAnimationReturn {
  const [gachaState, setGachaState] = useState<GachaState>('idle');
  const [gachaResults, setGachaResults] = useState<GachaResult[]>([]);
  const [isMultiDraw, setIsMultiDraw] = useState(false);
  const [prevRuneCount, setPrevRuneCount] = useState(0);
  const [rouletteItems, setRouletteItems] = useState<RouletteItem[]>([]);
  const [startRouletteAnim, setStartRouletteAnim] = useState(false);

  const checkResults = useCallback((expectedTotal: number) => {
    // 최신 인벤토리에서 새로 추가된 룬들 추출
    const newRunes = stats.inventoryRunes.slice(prevRuneCount);
    setGachaResults(newRunes.map(r => ({ runeId: r.runeId, rarity: r.rarity })));
    setGachaState('result');
    setStartRouletteAnim(false);
  }, [stats.inventoryRunes, prevRuneCount]);

  const performExtraction = useCallback((tierIndex: number, count: number = 1) => {
    const cost = (500 * Math.pow(2, tierIndex)) * count;
    if (stats.goldCoins < cost) return;

    const currentCount = stats.inventoryRunes.length;
    setPrevRuneCount(currentCount);
    setIsMultiDraw(count > 1);
    onSummonRune(tierIndex, count);
    
    setGachaState('drawing');
    
    if (count === 1) {
      // 단일 뽑기: 룰렛 연출
      const availableRunes = Object.values(SKILL_RUNES);
      const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Radiant', 'Legendary', 'Mythic'];
      const items = Array.from({ length: 60 }, () => ({
        runeId: availableRunes[Math.floor(Math.random() * availableRunes.length)].id,
        rarity: rarities[Math.floor(Math.random() * 3)]
      }));
      setRouletteItems(items);
      setStartRouletteAnim(false);
      
      setTimeout(() => setStartRouletteAnim(true), 50);
      setTimeout(() => {
        const newRunes = stats.inventoryRunes.slice(currentCount);
        setGachaResults(newRunes.map(r => ({ runeId: r.runeId, rarity: r.rarity })));
        setGachaState('result');
        setStartRouletteAnim(false);
      }, 5500);
    } else {
      // 다중 뽑기: 빠른 연출
      setTimeout(() => {
        const newRunes = stats.inventoryRunes.slice(currentCount);
        setGachaResults(newRunes.map(r => ({ runeId: r.runeId, rarity: r.rarity })));
        setGachaState('result');
        setStartRouletteAnim(false);
      }, 1500);
    }
  }, [stats.goldCoins, stats.inventoryRunes, onSummonRune]);

  const resetGacha = useCallback(() => {
    setGachaState('idle');
    setGachaResults([]);
    setIsMultiDraw(false);
    setRouletteItems([]);
    setStartRouletteAnim(false);
  }, []);

  return {
    gachaState,
    gachaResults,
    isMultiDraw,
    rouletteItems,
    startRouletteAnim,
    performExtraction,
    resetGacha,
  };
}

/** 광물별 판매 가격 매핑 (정적 상수) */
export const RESOURCE_PRICES: Record<string, number> = MINERALS.reduce((acc, mineral) => {
  acc[mineral.key] = mineral.basePrice;
  return acc;
}, {} as Record<string, number>);

/** 등급별 색상 테마 정의 (정적 상수) */
export const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-zinc-900 border-zinc-700 text-zinc-400',
  Uncommon: 'bg-emerald-950/30 border-emerald-900 text-emerald-400',
  Rare: 'bg-blue-950/30 border-blue-900 text-blue-400',
  Epic: 'bg-purple-950/30 border-purple-900 text-purple-400',
  Radiant: 'bg-rose-950/30 border-rose-900 text-rose-400',
  Legendary: 'bg-amber-950/30 border-amber-900/50 text-amber-400',
  Mythic: 'bg-red-950/30 border-red-900/50 text-red-500',
  Unique: 'bg-cyan-950/30 border-cyan-900/50 text-cyan-400',
};
