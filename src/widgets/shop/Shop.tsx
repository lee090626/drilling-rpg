'use client';

import React from 'react';
import { PlayerStats, Quest } from '../../shared/types/game';
import { MINERALS } from '../../shared/config/mineralData';

interface ShopProps {
  stats: PlayerStats;
  onUpgrade: (type: string, requirements: any) => void;
  onCraft: (requirements: any, result: any) => void;
  onSell: (resource: string, amount: number, price: number) => void;
  availableQuests: Quest[];
  onAcceptQuest: (id: string) => void;
  onCompleteQuest: (id: string) => void;
  onClose: () => void;
}

export default function Shop({
  stats,
  onUpgrade,
  onCraft,
  onSell,
  availableQuests,
  onAcceptQuest,
  onCompleteQuest,
  onClose,
}: ShopProps) {
  const powerLevel = Math.floor((stats.attackPower - 10) / 20);
  const powerUpgradeCost = Math.floor(1000 * Math.pow(1.5, powerLevel));

  const armorLevel = Math.floor((stats.maxHp - 200) / 50);
  const armorUpgradeCost = Math.floor(800 * Math.pow(1.4, armorLevel));

  const categories = [
    {
      id: 'power',
      name: 'DRILL POWER',
      requirements: { goldCoins: powerUpgradeCost },
      upgrade: 'attackPower',
      icon: '⚡',
      desc: 'Improve mining speed and force.',
    },
    {
      id: 'armor',
      name: 'HULL CHASSIS',
      requirements: { goldCoins: armorUpgradeCost },
      upgrade: 'maxHp',
      icon: '🛡️',
      desc: 'Strengthen structure integrity.',
    },
  ];

  const resourcePrices = MINERALS.reduce((acc, mineral) => {
    acc[mineral.key] = mineral.basePrice;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans p-8 bg-[#1a1a1b] border-l-[6px] border-[#eab308] shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h2 className="text-4xl font-black tracking-tighter text-[#eab308] uppercase">
          SHOP
        </h2>

        <div className="bg-[#252526] border border-zinc-800 px-6 py-2 rounded-xl flex items-center gap-4">
          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
            {stats.goldCoins.toLocaleString()}{' '}
            <span className="text-[#eab308] text-sm">G</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden pr-2">
        {/* UPGRADES SECTION */}
        <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar pb-10">
          <section>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">
              EQUIPMENT UPGRADES
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat) => {
                const canUpgrade = Object.entries(cat.requirements).every(
                  ([key, val]) => {
                    const currentVal =
                      (stats as any)[key] !== undefined
                        ? (stats as any)[key]
                        : (stats.inventory as any)[key] || 0;
                    return currentVal >= (val as number);
                  },
                );

                return (
                  <div
                    key={cat.id}
                    className="bg-[#252526] rounded-2xl p-6 border border-zinc-800 flex items-center gap-6 group hover:border-[#eab308]/30 transition-colors"
                  >
                    <div className="w-16 h-16 bg-zinc-950 rounded-xl flex items-center justify-center text-4xl shadow-inner border border-zinc-900 group-hover:scale-105 transition-transform">
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-white tracking-tight">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                        {cat.desc}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(cat.requirements).map(([key, val]) => {
                          const met =
                            ((stats as any)[key] ||
                              (stats.inventory as any)[key] ||
                              0) >= (val as number);
                          return (
                            <span
                              key={key}
                              className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${met ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-rose-950/20 border-rose-900/50 text-rose-500'}`}
                            >
                              REQ: {val.toLocaleString()}G {met ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      disabled={!canUpgrade}
                      onClick={() => onUpgrade(cat.upgrade, cat.requirements)}
                      className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                        canUpgrade
                          ? 'bg-[#eab308] text-black hover:brightness-110'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                      }`}
                    >
                      UPGRADE
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">
              INGREDIENTS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(resourcePrices).map(([res, price]) => {
                const count = (stats.inventory as any)[res] || 0;
                if (count <= 0) return null;
                return (
                  <div
                    key={res}
                    className="bg-[#252526] p-5 rounded-xl border border-zinc-800 flex justify-between items-center group transition-all"
                  >
                    <div className="flex flex-col">
                      <div className="text-lg font-black text-white uppercase tracking-tighter">
                        {res}
                      </div>
                      <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                        STOCK: {count.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-emerald-500 tabular-nums">
                        +{price.toLocaleString()}G
                      </span>
                      <button
                        onClick={() => onSell(res, count, count * price)}
                        className="px-6 py-2 bg-zinc-800 text-zinc-400 hover:bg-[#eab308] hover:text-black text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 border border-zinc-700"
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* QUESTS SECTION */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col h-full bg-[#252526] rounded-[2rem] p-8 border border-zinc-800 shadow-2xl overflow-hidden">
          <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-tighter border-b border-zinc-800 pb-4">
            QUESTS
          </h2>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats.activeQuests.map((q) => {
              const isReady = q.requirement.current >= q.requirement.target;
              const progress = Math.min(
                100,
                (q.requirement.current / q.requirement.target) * 100,
              );
              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl transition-all border ${isReady ? 'bg-zinc-800 border-[#eab308]/50 shadow-lg' : 'bg-zinc-950 border-zinc-900 opacity-50'}`}
                >
                  <h3 className="text-lg font-black text-white tracking-tight mb-4">
                    {q.title}
                  </h3>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden mb-4 border border-zinc-900">
                    <div
                      className={`h-full transition-all duration-700 ${isReady ? 'bg-[#eab308]' : 'bg-zinc-700'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {isReady && (
                    <button
                      onClick={() => onCompleteQuest(q.id)}
                      className="w-full bg-[#eab308] hover:brightness-110 text-black py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      COMPLETE
                    </button>
                  )}
                </div>
              );
            })}
            {stats.activeQuests.length === 0 && (
              <div className="text-center py-20 opacity-10">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  No active quests
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
