import { useState, useMemo } from 'react';
import { PlayerStats } from '@/shared/types/game';

/**
 * 상점(Shop) 컴포넌트의 상태 및 비즈니스 로직을 관리하는 커스텀 훅입니다.
 */
export function useShopTrade(stats: PlayerStats) {
  const [activeTab, setActiveTab] = useState<'minerals' | 'runes'>('minerals');
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});

  /** 보유 중인 룬 등급별 개수 집계 (메모이제이션) */
  const runeCounts = useMemo(() => {
    return (stats.inventoryRunes || []).reduce(
      (acc, rune) => {
        acc[rune.rarity] = (acc[rune.rarity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [stats.inventoryRunes]);

  const updateSellAmount = (resource: string, amount: number) => {
    setSellAmounts((prev) => ({ ...prev, [resource]: amount }));
  };

  const resetSellAmount = (resource: string) => {
    setSellAmounts((prev) => ({ ...prev, [resource]: 0 }));
  };

  return {
    activeTab,
    setActiveTab,
    sellAmounts,
    updateSellAmount,
    resetSellAmount,
    runeCounts,
  };
}
