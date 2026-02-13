'use client';

import React, { useState, useMemo } from 'react';
import { PlayerStats } from '../types/game';
import { DRILLS } from '../lib/DrillData';

interface InventoryProps {
  stats: PlayerStats;
  onClose: () => void;
  onEquip?: (drillId: string) => void;
}

type MineralKey =
  | 'dirt'
  | 'stone'
  | 'coal'
  | 'iron'
  | 'gold'
  | 'diamond'
  | 'emerald'
  | 'ruby'
  | 'sapphire'
  | 'uranium'
  | 'obsidian';

interface MineralDefinition {
  key: MineralKey;
  name: string;
  icon: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Exotic';
  description: string;
  color: string;
}

const mineralDefinitions: MineralDefinition[] = [
  {
    key: 'dirt',
    name: 'Standard Dirt',
    icon: '🟤',
    rarity: 'Common',
    description:
      'Common soil found near the surface. Used as construction filler or low-grade fuel stabilizer.',
    color: 'amber',
  },
  {
    key: 'stone',
    name: 'Raw Stone',
    icon: '🪨',
    rarity: 'Common',
    description:
      'Dense geological mineral found deeper than dirt. Sturdier building material.',
    color: 'slate',
  },
  {
    key: 'coal',
    name: 'Elastic Coal',
    icon: '⬛',
    rarity: 'Common',
    description:
      'Carbon-rich fossil fuel with high thermal efficiency. Essential for basic energy production.',
    color: 'gray',
  },
  {
    key: 'iron',
    name: 'Iron Ore',
    icon: '🥈',
    rarity: 'Uncommon',
    description:
      'Raw metal used for heavy-duty alloys. Primary material for industrial machine components.',
    color: 'blue',
  },
  {
    key: 'gold',
    name: 'Gold Vein',
    icon: '🟡',
    rarity: 'Rare',
    description:
      'Highly conductive precious metal. Vital for precision electronics and advanced circuitry.',
    color: 'yellow',
  },
  {
    key: 'diamond',
    name: 'Nano Diamond',
    icon: '💎',
    rarity: 'Exotic',
    description:
      'Ultra-hard gemstone. Used for high-grade drill sharpening and advanced optical sensors.',
    color: 'cyan',
  },
  {
    key: 'emerald',
    name: 'Emerald',
    icon: '🟩',
    rarity: 'Rare',
    description:
      'A bright green gemstone. Often used in high-efficiency laser focusing lenses.',
    color: 'emerald',
  },
  {
    key: 'ruby',
    name: 'Ruby',
    icon: '🟥',
    rarity: 'Rare',
    description:
      'A deep red gemstone. Essential for high-temperature thermal protective gear.',
    color: 'red',
  },
  {
    key: 'sapphire',
    name: 'Sapphire',
    icon: '🟦',
    rarity: 'Exotic',
    description:
      'A clear blue gemstone. Used in advanced cooling systems and superconductors.',
    color: 'blue',
  },
  {
    key: 'uranium',
    name: 'Uranium 235',
    icon: '☢️',
    rarity: 'Exotic',
    description:
      'Highly radioactive heavy metal. Putting it in your pocket is not recommended, but it is a powerful fuel source.',
    color: 'lime',
  },
  {
    key: 'obsidian',
    name: 'Obsidian',
    icon: '🌑',
    rarity: 'Exotic',
    description:
      'Volcanic glass formed from rapidly cooling magma. Extremely sharp and hard.',
    color: 'purple',
  },
];

type Tab = 'minerals' | 'drills';

export default function Inventory({ stats, onClose, onEquip }: InventoryProps) {
  const [selectedKey, setSelectedKey] = useState<MineralKey | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('minerals');

  const selectedMineral = useMemo(
    () => mineralDefinitions.find((m) => m.key === selectedKey),
    [selectedKey],
  );

  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];

  return (
    <div className="flex flex-col h-full overflow-hidden min-h-[500px]">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('minerals')}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'minerals'
              ? 'bg-white text-black'
              : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
          }`}
        >
          Minerals
        </button>
        <button
          onClick={() => setActiveTab('drills')}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'drills'
              ? 'bg-white text-black'
              : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
          }`}
        >
          Drills
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Left Column: Status (Summary) */}
        <div className="w-full lg:w-60 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2">
          {/* Drill Summary */}
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center bg-black/40 rounded-2xl border border-white/10 mb-4 group hover:scale-105 transition-transform duration-500">
              <span className="text-6xl">{equippedDrill.icon}</span>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 opacity-60">
                Active Module
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                {equippedDrill.name}
              </h3>
              <div className="flex flex-col gap-2 items-center">
                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[10px] font-bold text-gray-300 font-mono">
                  PWR: {equippedDrill.basePower}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold font-mono">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  STABLE
                </span>
              </div>
            </div>
          </div>

          {/* Global Storage Status (Mini) */}
          <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 flex-1 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="text-6xl text-blue-500">∞</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">
                  Storage Protocol
                </span>
              </div>
              <div className="text-xl font-black text-white tracking-widest flex items-baseline gap-2">
                UNLIMITED{' '}
                <span className="text-sm text-blue-500 font-normal">
                  Active
                </span>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 opacity-60">
                  Data Encryption
                </div>
                <div className="text-xs font-bold text-blue-300 font-mono tracking-tight">
                  AES-256 QUANTUM-SECURED
                </div>
              </div>
              <div className="text-[10px] text-gray-400/60 font-medium uppercase font-mono italic leading-tight">
                Matter Compression technology is currently suppressing spatial
                constraints.
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'minerals' ? (
          <>
            {/* Middle Column: Item Grid */}
            <div className="flex-[2] flex flex-col gap-6 h-full min-w-[360px]">
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex-1 flex flex-col shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-2 h-6 bg-gray-500 rounded-full opacity-40" />
                    <h3 className="text-lg text-white font-black uppercase tracking-widest">
                      Material Manifest
                    </h3>
                  </div>
                  <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] text-gray-400 font-bold font-mono tracking-widest uppercase">
                      Scanner Online
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                  {mineralDefinitions.map((m) => {
                    const count = (stats.inventory as any)[m.key] || 0;
                    const isSelected = selectedKey === m.key;

                    return (
                      <button
                        key={m.key}
                        onClick={() => setSelectedKey(m.key)}
                        className={`
                          relative aspect-square rounded-2xl border transition-all duration-300 group overflow-hidden
                          ${
                            isSelected
                              ? 'bg-white/15 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-[0.98]'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-500">
                            {m.icon}
                          </span>
                          <div className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors duration-300">
                            {count.toLocaleString()} PCS
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]" />
                        )}

                        {/* Hover Overlay */}
                        <div
                          className={`absolute inset-x-0 bottom-0 h-1 transition-all duration-500 bg-gradient-to-r ${
                            m.key === 'dirt'
                              ? 'from-amber-600 to-amber-900'
                              : m.key === 'stone'
                                ? 'from-slate-600 to-slate-900'
                                : m.key === 'coal'
                                  ? 'from-gray-600 to-gray-900'
                                  : m.key === 'iron'
                                    ? 'from-blue-600 to-blue-900'
                                    : m.key === 'gold'
                                      ? 'from-yellow-600 to-yellow-900'
                                      : m.key === 'diamond'
                                        ? 'from-cyan-600 to-cyan-900'
                                        : m.key === 'emerald'
                                          ? 'from-emerald-600 to-emerald-900'
                                          : m.key === 'ruby'
                                            ? 'from-red-600 to-red-900'
                                            : m.key === 'sapphire'
                                              ? 'from-blue-600 to-blue-900'
                                              : m.key === 'uranium'
                                                ? 'from-lime-600 to-lime-900'
                                                : 'from-purple-600 to-purple-900'
                          } opacity-0 group-hover:opacity-100`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Item Detail */}
            <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0 h-full">
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10 h-full flex flex-col relative overflow-hidden group">
                {selectedMineral ? (
                  <>
                    {/* Background Glow */}
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] opacity-20 bg-${selectedMineral.color}-500/30`}
                    />

                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest
                          ${
                            selectedMineral.rarity === 'Common'
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                              : selectedMineral.rarity === 'Uncommon'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                : selectedMineral.rarity === 'Rare'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                          }
                        `}
                        >
                          {selectedMineral.rarity}
                        </span>
                      </div>

                      <div className="text-6xl mb-6">
                        {selectedMineral.icon}
                      </div>

                      <h3 className="text-3xl font-black text-white tracking-tight mb-4 leading-tight">
                        {selectedMineral.name}
                      </h3>

                      <div className="bg-black/30 p-5 rounded-2xl border border-white/5 mb-8">
                        <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                          "{selectedMineral.description}"
                        </p>
                      </div>

                      <div className="h-px bg-white/5 w-full" />
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Inventory
                        </span>
                        <span className="text-lg font-bold text-white font-mono">
                          {(stats.inventory as any)[selectedMineral.key] || 0}{' '}
                          PCS
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <span className="text-2xl opacity-20">🔍</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Item Intel
                    </h4>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      Select a mineral from the manifest <br /> to perform a
                      deep-scan analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Drills Tab Content */
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3 font-mono tracking-tight uppercase">
              ⚙️ Drill Armory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.ownedDrillIds?.map((drillId) => {
                const drill = DRILLS[drillId];
                if (!drill) return null;
                const isEquipped = stats.equippedDrillId === drillId;

                return (
                  <div
                    key={drillId}
                    className={`p-6 rounded-2xl border transition-all flex flex-col ${
                      isEquipped
                        ? 'bg-green-900/10 border-green-500/50 ring-1 ring-green-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{drill.icon}</div>
                      <div>
                        <h4 className="font-bold text-white uppercase">
                          {drill.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {drill.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
                      <div className="bg-black/30 p-2 rounded text-center">
                        <div className="text-gray-500 uppercase text-[9px]">
                          PWR
                        </div>
                        <div className="font-bold text-white">
                          {drill.basePower}
                        </div>
                      </div>
                      <div className="bg-black/30 p-2 rounded text-center">
                        <div className="text-gray-500 uppercase text-[9px]">
                          SPD
                        </div>
                        <div className="font-bold text-white">
                          {drill.cooldownMs}ms
                        </div>
                      </div>
                      <div className="bg-black/30 p-2 rounded text-center">
                        <div className="text-gray-500 uppercase text-[9px]">
                          FUEL
                        </div>
                        <div className="font-bold text-white">
                          {drill.fuelConsumption}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {isEquipped ? (
                        <div className="w-full py-3 bg-green-500/10 text-green-500 text-center font-bold text-xs uppercase tracking-widest rounded-xl border border-green-500/20">
                          Equipped
                        </div>
                      ) : (
                        <button
                          onClick={() => onEquip?.(drillId)}
                          className="w-full py-3 bg-white text-black hover:bg-gray-200 text-center font-bold text-xs uppercase tracking-widest rounded-xl transition-colors"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {(!stats.ownedDrillIds || stats.ownedDrillIds.length === 0) && (
              <div className="text-gray-500 text-center mt-10">
                No drills found. Check the shop?
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
