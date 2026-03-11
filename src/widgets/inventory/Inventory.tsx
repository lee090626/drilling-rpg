'use client';

import React, { useState, useMemo } from 'react';
import { PlayerStats, TileType } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';

interface InventoryProps {
  stats: PlayerStats;
  onClose: () => void;
  onEquip?: (drillId: string) => void;
}

import { MINERALS } from '../../shared/config/mineralData';

export default function Inventory({ stats, onClose, onEquip }: InventoryProps) {
  const [selectedKey, setSelectedKey] = useState<TileType | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'equipment'>(
    'ingredients',
  );

  const selectedMineral = useMemo(
    () => MINERALS.find((m) => m.key === selectedKey),
    [selectedKey],
  );
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans p-8 bg-[#1a1a1b] border-l-[6px] border-[#eab308] shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h2 className="text-4xl font-black tracking-tighter text-[#eab308] uppercase">
          INVENTORY
        </h2>

        <div className="flex items-center gap-6">
          <div className="flex gap-2 p-1 bg-[#252526] rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-8 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ingredients' ? 'bg-[#eab308] text-black shadow-lg shadow-[#eab308]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              INGREDIENTS
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-8 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'equipment' ? 'bg-[#eab308] text-black shadow-lg shadow-[#eab308]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              EQUIPMENT
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-xl font-black">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden pr-2">
        {activeTab === 'ingredients' ? (
          <>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {MINERALS.map((m) => {
                  const count = (stats.inventory as any)[m.key] || 0;
                  const isSelected = selectedKey === m.key;
                  const hasNone = count === 0;

                  return (
                    <button
                      key={m.key}
                      onClick={() => setSelectedKey(m.key as any)}
                      className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden ${
                        isSelected
                          ? 'bg-[#252526] shadow-2xl scale-[1.02]'
                          : hasNone
                            ? 'bg-[#1a1a1b] border-zinc-900 opacity-20 grayscale'
                            : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                      }`}
                      style={{ borderColor: isSelected ? m.color : undefined }}
                    >
                      {isSelected && (
                         <div className="absolute inset-0 opacity-10" style={{ backgroundColor: m.color }} />
                      )}
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        {m.icon}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`text-[11px] font-black tabular-nums ${isSelected ? 'text-white' : 'text-zinc-400'}`}
                        >
                          x{count.toLocaleString()}
                        </div>
                        <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
                          {m.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full lg:w-[350px] shrink-0 h-full flex flex-col bg-[#252526] rounded-[2rem] p-8 border border-zinc-800 relative shadow-2xl">
              {selectedMineral ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-start mb-6">
                    <span className="text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest" style={{ 
                      backgroundColor: `${selectedMineral.color}20`,
                      borderColor: selectedMineral.color,
                      color: selectedMineral.color
                    }}>
                      {selectedMineral.rarity}
                    </span>
                  </div>

                  <div className="w-32 h-32 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-7xl mx-auto mb-8">
                    {selectedMineral.icon}
                  </div>

                  <h3 className="text-3xl font-black text-white text-center mb-4 tracking-tighter uppercase">
                    {selectedMineral.name}
                  </h3>
                  <p className="text-xs text-zinc-500 text-center leading-relaxed mb-8 px-4">
                    {selectedMineral.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                      <div className="text-[9px] text-zinc-600 font-black mb-1 uppercase tracking-widest text-center">
                        QUANTITY
                      </div>
                      <div className="text-4xl font-black text-[#eab308] text-center tabular-nums">
                        {(stats.inventory as any)[selectedMineral.key] || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <div className="text-5xl mb-6">📦</div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Select an item
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {stats.ownedDrillIds?.map((drillId) => {
                const drill = DRILLS[drillId];
                if (!drill) return null;
                const isEquipped = stats.equippedDrillId === drillId;

                return (
                  <div
                    key={drillId}
                    className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col group relative overflow-hidden ${
                      isEquipped
                        ? 'bg-[#252526] border-[#eab308] shadow-2xl'
                        : 'bg-[#252526] border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-6 mb-8 text-left">
                      <div className="w-20 h-20 bg-zinc-950 rounded-2xl flex items-center justify-center text-5xl border border-zinc-900 shadow-inner">
                        {drill.icon}
                      </div>
                      <div>
                        <div
                          className={`text-[9px] font-bold uppercase mb-1 tracking-widest ${isEquipped ? 'text-[#eab308]' : 'text-zinc-600'}`}
                        >
                          {isEquipped ? 'EQUIPPED' : 'STORAGE'}
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase">
                          {drill.name}
                        </h4>
                      </div>
                    </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                          {[
                            ['POWER', drill.basePower],
                            ['SPEED', `${drill.cooldownMs}ms`],
                            ['MOBILITY', drill.moveSpeedMult && drill.moveSpeedMult > 1 ? `+${Math.round((drill.moveSpeedMult - 1) * 100)}%` : 'BASIC'],
                          ].map(([l, v]) => (
                            <div
                              key={l as string}
                              className="bg-zinc-950 p-3 rounded-xl text-center border border-zinc-900"
                            >
                              <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest uppercase">
                                {l}
                              </div>
                              <div className="text-xs font-black text-white">
                                {v}
                              </div>
                            </div>
                          ))}
                        </div>

                    <div className="mt-auto">
                      {!isEquipped && (
                        <button
                          onClick={() => onEquip?.(drillId)}
                          className="w-full py-4 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl active:scale-95 transition-all"
                        >
                          EQUIP
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
