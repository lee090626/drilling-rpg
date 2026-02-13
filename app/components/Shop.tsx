'use client';

import React from 'react';
import { PlayerStats, Quest } from '../types/game';

interface ShopProps {
  stats: PlayerStats;
  onUpgrade: (type: string, requirements: any) => void;
  onCraft: (requirements: any, result: any) => void;
  availableQuests: Quest[];
  onAcceptQuest: (id: string) => void;
  onCompleteQuest: (id: string) => void;
}

export default function Shop({
  stats,
  onUpgrade,
  onCraft,
  availableQuests,
  onAcceptQuest,
  onCompleteQuest,
}: ShopProps) {
  const categories = [
    {
      id: 'fuel',
      name: 'Fuel Tank',
      requirements: { dirt: 80, coal: 20 },
      upgrade: 'maxFuel',
      amount: 50,
      icon: '⛽',
    },
    // {
    //   id: 'power',
    //   name: 'Drill Power',
    //   requirements: { iron: 40, coal: 30 },
    //   upgrade: 'drillPower',
    //   amount: 5,
    //   icon: '⚡',
    // },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-4 text-white">
      {/* Left Column: Upgrades */}
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-8 text-gray-100 flex items-center gap-3 font-mono tracking-tight border-b border-white/10 pb-6 text-white text-3xl uppercase">
            🛠️ Upgrade Depot
          </h2>

          <div className="space-y-4">
            <p className="text-xs text-gray-500 mb-2 font-bold tracking-widest uppercase opacity-60">
              System Enhancements
            </p>
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
                    className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-black/40 rounded-xl flex items-center justify-center text-3xl border border-white/5">
                          {cat.icon}
                        </div>
                        <div>
                          <div className="font-bold text-base text-gray-200 uppercase tracking-tight">
                            {cat.name}
                          </div>
                          <div className="text-xs text-blue-400 font-mono mt-1 font-bold uppercase tracking-wider">
                            NEXT: +{cat.amount} UNIT
                          </div>
                        </div>
                      </div>
                      <button
                        disabled={!canUpgrade}
                        onClick={() => onUpgrade(cat.upgrade, cat.requirements)}
                        className={`px-8 py-3 rounded-xl font-bold text-xs font-mono border transition-all uppercase tracking-[0.15em] ${
                          canUpgrade
                            ? 'bg-white text-black border-white hover:bg-gray-200 active:scale-95'
                            : 'bg-transparent text-gray-700 border-gray-800 cursor-not-allowed'
                        }`}
                      >
                        Assemble
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(cat.requirements).map(([key, val]) => {
                        const currentVal =
                          (stats as any)[key] !== undefined
                            ? (stats as any)[key]
                            : (stats.inventory as any)[key] || 0;
                        const met = currentVal >= (val as number);
                        return (
                          <span
                            key={key}
                            className={`text-xs px-3 py-1 rounded-lg border font-bold font-mono ${met ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                          >
                            {key.toUpperCase()}: {currentVal}/{val}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Mission Log */}
      <div className="flex-1 space-y-8">
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-8 text-gray-100 flex items-center gap-3 font-mono tracking-tight uppercase">
            📜 Mission Manifest
          </h2>

          <div className="space-y-4 flex-1">
            {stats.activeQuests.length === 0 && (
              <div className="text-center py-16 border border-white/5 rounded-3xl bg-black/20">
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">
                  No active signals detected.
                </p>
                <p className="text-xs text-gray-700 font-mono italic text-center">
                  COMPLETE MISSIONS TO EARN RESOURCES
                </p>
              </div>
            )}

            {stats.activeQuests.map((q) => {
              const isReady = q.requirement.current >= q.requirement.target;
              const progress = Math.min(
                100,
                (q.requirement.current / q.requirement.target) * 100,
              );
              return (
                <div
                  key={q.id}
                  className="bg-black/40 p-6 rounded-2xl border border-white/5"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-base text-gray-200 uppercase mb-1">
                        {q.title}
                      </h3>
                      <div className="text-xs text-gray-500 font-mono font-bold tracking-tight uppercase">
                        PRIMARY REQUEST
                      </div>
                    </div>
                    {isReady && (
                      <button
                        onClick={() => onCompleteQuest(q.id)}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg uppercase tracking-wider"
                      >
                        TRANSMIT
                      </button>
                    )}
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-1000 ${isReady ? 'bg-green-500' : 'bg-white/40'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold font-mono text-gray-500">
                    <span>{isReady ? 'READY' : 'PROGRESSING'}</span>
                    <span>
                      {q.requirement.current} / {q.requirement.target}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pt-8 border-t border-white/5 mt-8 space-y-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest px-1 mb-2">
                Available Contracts
              </p>
              {availableQuests
                .filter(
                  (qa) =>
                    !stats.completedQuestIds.includes(qa.id) &&
                    !stats.activeQuests.find((aq) => aq.id === qa.id),
                )
                .map((qa) => (
                  <div
                    key={qa.id}
                    className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 group transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors uppercase block mb-1">
                        {qa.title}
                      </span>
                      <div className="text-xs text-gray-500 font-mono font-bold tracking-tight">
                        REWARD:{' '}
                        <span className="text-green-500 font-black">
                          {qa.reward.fuel
                            ? `FUEL +${qa.reward.fuel}`
                            : 'RESOURCES'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onAcceptQuest(qa.id)}
                      className="bg-transparent border border-white/10 hover:border-white text-gray-400 hover:text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all uppercase tracking-wider"
                    >
                      ACCEPT
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-10 p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl italic">
            <p className="text-xs text-blue-400/60 font-bold leading-relaxed uppercase tracking-tight text-center">
              Resources required for assembly can only be acquired through
              exploration and mission completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
