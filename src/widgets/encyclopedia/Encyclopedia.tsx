import React, { useState } from 'react';

import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { MONSTER_LIST } from '@/shared/config/monsterData';
import { CIRCLES } from '@/shared/config/circleData';
import { ARTIFACT_LIST } from '@/shared/config/artifactData';
import AtlasIcon from '../hud/ui/AtlasIcon';
import { EncyclopediaDetail, ProgressBox } from './EncyclopediaDetail';

interface EncyclopediaProps {
  stats: PlayerStats;
  onClose: () => void;
}

const BOSSES = MONSTER_LIST.filter((m) => m.type === 'boss').map((m) => {
  const circle = CIRCLES.find((c) => c.boss?.id === m.id);
  return {
    id: m.id,
    name: m.nameKo || m.name,
    icon: m.imagePath,
    depth: circle ? circle.depthEnd : 0,
    description: m.description,
    imagePath: m.imagePath,
    stats: m.stats,
  };
});

function Encyclopedia({ stats, onClose }: EncyclopediaProps) {
  const [activeTab, setActiveTab] = useState<'minerals' | 'bosses' | 'artifact'>('minerals');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const discoveredCount = stats.discoveredMinerals.length;
  const totalMinerals = MINERALS.length;
  const encounteredBossCount = stats.encounteredBossIds.length;
  const totalBosses = BOSSES.length;

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">📖</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-purple-400 leading-none">
                Books
              </h2>
              <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase mt-1">
                Discovery Archive
              </span>
            </div>
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('minerals');
                setSelectedId(null);
              }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${activeTab === 'minerals' ? 'bg-zinc-800 text-purple-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Minerals
            </button>
            <button
              onClick={() => {
                setActiveTab('bosses');
                setSelectedId(null);
              }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${activeTab === 'bosses' ? 'bg-zinc-800 text-purple-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Bosses
            </button>
            <button
              onClick={() => {
                setActiveTab('artifact');
                setSelectedId(null);
              }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${activeTab === 'artifact' ? 'bg-zinc-800 text-orange-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Artifact
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center justify-center gap-2 md:gap-4 bg-zinc-950 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-zinc-800 shadow-inner">
            <div className="flex items-center justify-center">
              <AtlasIcon name="GoldIcon" size={32} />
            </div>
            <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-purple-400 hover:text-black hover:border-purple-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden pr-0 lg:pr-2">
        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar pb-10 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {activeTab === 'minerals'
              ? MINERALS.map((m) => {
                  const isDiscovered = stats.discoveredMinerals.includes(m.key);
                  const isSelected = selectedId === m.key;

                  return (
                    <button
                      key={m.key}
                      onClick={() => setSelectedId(m.key)}
                      className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                        isSelected
                          ? 'bg-[#252526] border-purple-400 shadow-2xl scale-[1.02]'
                          : !isDiscovered
                            ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                            : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-20 h-20 flex items-center justify-center mb-4 transition-all ${!isDiscovered ? 'filter blur-md grayscale opacity-50' : ''}`}
                      >
                        {isDiscovered ? (
                          m.image ? (
                            <AtlasIcon name={m.image} size={64} />
                          ) : (
                            <span className="text-6xl">{m.icon}</span>
                          )
                        ) : (
                          '?'
                        )}
                      </div>
                      <div className="text-[20px] text-zinc-500 font-bold tracking-widest">
                        {isDiscovered ? m.name : 'Unknown'}
                      </div>
                      {!isDiscovered && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-zinc-800 text-6xl font-black opacity-20">?</span>
                        </div>
                      )}
                    </button>
                  );
                })
              : activeTab === 'bosses'
                ? BOSSES.map((b) => {
                    const isEncountered = stats.encounteredBossIds.includes(b.id);
                    const isSelected = selectedId === b.id;

                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedId(b.id)}
                        className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                          isSelected
                            ? 'bg-[#252526] border-[#a855f7] shadow-2xl scale-[1.02]'
                            : !isEncountered
                              ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                              : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-20 h-20 flex items-center justify-center mb-4 transition-all ${!isEncountered ? 'filter blur-md grayscale opacity-50' : ''}`}
                        >
                          {isEncountered ? (
                            <AtlasIcon name={b.imagePath as any} size={64} />
                          ) : (
                            <span className="text-6xl">💀</span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold tracking-widest">
                          {isEncountered ? b.name : 'Classified'}
                        </div>
                      </button>
                    );
                  })
                : // Artifact (Unified)
                  ARTIFACT_LIST.map((item) => {
                    const isStackable = item.type === 'stackable';
                    const isUnlocked = isStackable
                      ? (stats.collectionHistory?.[item.id] || 0) > 0
                      : stats.unlockedResearchIds?.includes(item.id);
                    const count = isStackable ? stats.collectionHistory?.[item.id] || 0 : 0;
                    const isSelected = selectedId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                          isSelected
                            ? 'bg-[#252526] border-orange-400 shadow-2xl scale-[1.02]'
                            : !isUnlocked
                              ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                              : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-20 h-20 flex items-center justify-center text-4xl mb-4 transition-all ${!isUnlocked ? 'filter grayscale opacity-50' : ''}`}
                        >
                          <span className="text-3xl">💎</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold tracking-widest text-center">
                          {item.nameKo}
                        </div>
                        {isStackable && count > 0 && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                            x{count}
                          </div>
                        )}
                        {!isStackable && isUnlocked && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                            UNIQUE
                          </div>
                        )}
                      </button>
                    );
                  })}
          </div>
        </div>

        {/* DETAIL SECTION */}
        <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-5 md:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
          {selectedId ? (
            <EncyclopediaDetail id={selectedId} tab={activeTab} stats={stats} bossesData={BOSSES} />
          ) : (
            <div className="h-full py-8 md:py-0 flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-20 animate-pulse">📡</div>
              <h3 className="text-base md:text-lg font-black text-zinc-700 tracking-widest uppercase">
                Scanning Database...
              </h3>
              <p className="text-[9px] md:text-[10px] text-zinc-800 mt-2 font-bold tracking-widest uppercase">
                Select an entry for analysis
              </p>

              <div className="mt-8 md:mt-12 w-full space-y-3">
                <ProgressBox
                  label="Minerals Discovery"
                  current={discoveredCount}
                  total={totalMinerals}
                  color="#a855f7"
                />
                <ProgressBox
                  label="Boss Encounters"
                  current={encounteredBossCount}
                  total={totalBosses}
                  color="#ef4444"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Encyclopedia, (prev, next) => {
  return prev.stats === next.stats;
});
