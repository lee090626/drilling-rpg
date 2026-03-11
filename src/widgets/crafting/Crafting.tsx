'use client';

import React, { useState } from 'react';
import { PlayerStats } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';

interface CraftingProps {
  stats: PlayerStats;
  onCraft: (requirements: any, result: any) => void;
  onClose: () => void;
}

export default function Crafting({ stats, onCraft, onClose }: CraftingProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const recipes = Object.values(DRILLS)
    .filter((drill) => drill.price) // Only craftable items
    .map((drill) => ({
      name: drill.name,
      icon: drill.icon,
      requirements: drill.price || {},
      result: {
        drillId: drill.id,
        drillName: drill.name,
        drillIcon: drill.icon,
      },
      description: drill.description,
      id: drill.id,
      power: drill.basePower,
    }));

  const canCraft = (rcp: any) => {
    if (stats.ownedDrillIds?.includes(rcp.id)) return false;
    return Object.entries(rcp.requirements).every(([key, val]) => {
      const currentVal =
        (stats as any)[key] !== undefined
          ? (stats as any)[key]
          : (stats.inventory as any)[key] || 0;
      return currentVal >= (val as number);
    });
  };

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans p-8 bg-[#1a1a1b] border-l-[6px] border-[#eab308] shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-[#eab308] uppercase">
          CRAFTING
        </h2>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
        >
          <span className="text-xl font-black">✕</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden min-h-0">
        {/* Left Column: Material Inventory */}
        <div className="w-full lg:w-64 flex flex-col h-full overflow-hidden min-h-0 flex-shrink-0">
          <div className="bg-[#252526] p-6 rounded-2xl border border-zinc-800 flex flex-col h-full overflow-hidden shadow-xl">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
              INGREDIENTS
            </h3>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {Object.entries(stats.inventory).map(([key, val]) => (
                <div
                  key={key}
                  className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900"
                >
                  <span className="text-[9px] font-bold uppercase text-zinc-600">
                    {key}
                  </span>
                  <span className="text-sm font-black text-[#eab308] tabular-nums">
                    {val as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Blueprints Grid */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
            EQUIPMENT BLUEPRINTS
          </h2>
          <div className="overflow-y-auto pr-4 custom-scrollbar flex-1 pb-10 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((rcp) => {
                const active = selectedRecipe?.name === rcp.name;
                const owned = stats.ownedDrillIds?.includes(rcp.id);

                return (
                  <button
                    key={rcp.name}
                    onClick={() => setSelectedRecipe(rcp)}
                    className={`relative p-6 rounded-2xl border transition-all flex items-center gap-6 text-left group overflow-hidden ${
                      active
                        ? 'bg-[#252526] border-[#eab308] shadow-2xl scale-[1.02]'
                        : 'bg-[#252526] border-zinc-800 hover:border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl border transition-all flex-shrink-0 ${
                        active
                          ? 'bg-zinc-900 border-[#eab308]/30'
                          : 'bg-zinc-950 border-zinc-900'
                      }`}
                    >
                      {rcp.icon}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`font-black text-lg tracking-tight uppercase mb-1 ${active ? 'text-white' : 'text-zinc-400'}`}
                      >
                        {rcp.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#eab308] font-black uppercase tracking-widest">
                          +{rcp.power} PWR
                        </span>
                        {owned && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 font-black">
                            OWNED
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detail & Action */}
        <div className="w-full lg:w-72 flex flex-col h-full overflow-hidden min-h-0 flex-shrink-0">
          {selectedRecipe ? (
            <div className="bg-[#252526] border border-zinc-800 p-8 rounded-[2rem] h-full flex flex-col overflow-hidden shadow-2xl">
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex flex-col items-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-2xl flex items-center justify-center text-5xl border border-zinc-900 mb-6">
                  {selectedRecipe.icon}
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 text-center">
                  {selectedRecipe.name}
                </h3>
                <p className="text-[11px] text-center text-zinc-500 font-bold mb-8 px-2 opacity-60">
                  {selectedRecipe.description}
                </p>

                <div className="w-full space-y-3 pt-4 border-t border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">
                    REQUIREMENTS
                  </p>
                  {Object.entries(selectedRecipe.requirements).map(
                    ([key, val]) => {
                      const currentVal =
                        (stats as any)[key] !== undefined
                          ? (stats as any)[key]
                          : (stats.inventory as any)[key] || 0;
                      const met = currentVal >= (val as number);
                      return (
                        <div
                          key={key}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="uppercase text-zinc-500 font-black text-[9px]">
                            {key}
                          </span>
                          <span
                            className={`font-black tabular-nums ${met ? 'text-[#eab308]' : 'text-rose-500'}`}
                          >
                            {currentVal}/{val}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <button
                  disabled={!canCraft(selectedRecipe)}
                  onClick={() =>
                    onCraft(selectedRecipe.requirements, selectedRecipe.result)
                  }
                  className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-xl ${
                    canCraft(selectedRecipe)
                      ? 'bg-[#eab308] text-black border-[#eab308] hover:brightness-110'
                      : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  {stats.ownedDrillIds?.includes(selectedRecipe.id)
                    ? 'OWNED'
                    : 'CRAFT'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#252526]/50 border border-zinc-800/50 p-8 rounded-[2rem] h-full flex items-center justify-center text-center opacity-10">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Select blueprint
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
