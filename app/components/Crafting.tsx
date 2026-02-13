'use client';

import React, { useState } from 'react';
import { PlayerStats } from '../types/game';

interface CraftingProps {
  stats: PlayerStats;
  onCraft: (requirements: any, result: any) => void;
}

import { DRILLS } from '../lib/DrillData';

// ...

export default function Crafting({ stats, onCraft }: CraftingProps) {
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
      id: drill.id, // Keep ID for checking ownership
      power: drill.basePower, // For UI display
    }));

  const canCraft = (rcp: any) => {
    // Check if already owned
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
    <div className="flex flex-col lg:flex-row gap-6 text-white h-full w-full overflow-hidden min-h-0">
      {/* Left Column: Material Inventory */}
      <div className="w-full lg:w-64 flex flex-col h-full overflow-hidden min-h-0 flex-shrink-0">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col h-full overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-3 flex-shrink-0">
            Materials
          </h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar min-h-0">
            {Object.entries(stats.inventory).map(([key, val]) => (
              <div
                key={key}
                className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-gray-500">
                  {key}
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {val as number}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex-shrink-0"></div>
        </div>
      </div>

      {/* Middle Column: Blueprints Grid (Scrollable) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3 font-mono tracking-tight uppercase border-b border-white/10 pb-4 flex-shrink-0">
          ⚙️ Forge Manifest
        </h2>
        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((rcp) => {
              const active = selectedRecipe?.name === rcp.name;
              const craftable = canCraft(rcp);
              return (
                <div
                  key={rcp.name}
                  onClick={() => setSelectedRecipe(rcp)}
                  className={`cursor-pointer p-6 rounded-2xl border transition-all lg:min-h-36 flex flex-col justify-center ${
                    active
                      ? 'bg-white/10 border-white ring-1 ring-white/50'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl border transition-all flex-shrink-0 ${
                        active
                          ? 'bg-white text-black border-white'
                          : 'bg-black/40 border-white/10'
                      }`}
                    >
                      {rcp.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm tracking-tight uppercase truncate">
                        {rcp.name}
                      </div>
                      <div className="text-xs text-green-500 font-bold font-mono mt-1">
                        +{rcp.power} PWR
                      </div>
                    </div>
                  </div>
                  {!craftable && (
                    <div className="mt-3 flex gap-1 opacity-50">
                      {Object.entries(rcp.requirements).map(([key, val]) => {
                        const currentVal =
                          (stats as any)[key] !== undefined
                            ? (stats as any)[key]
                            : (stats.inventory as any)[key] || 0;
                        if (currentVal < (val as number)) {
                          return (
                            <div
                              key={key}
                              className="w-1.5 h-1.5 rounded-full bg-red-500"
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Detail & Action */}
      <div className="w-full lg:w-72 flex flex-col h-full overflow-hidden min-h-0 flex-shrink-0">
        {selectedRecipe ? (
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] h-full flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
              <div className="w-20 h-20 bg-black/60 rounded-3xl flex items-center justify-center text-5xl border border-white/10 mx-auto mb-6 shadow-2xl">
                {selectedRecipe.icon}
              </div>
              <h3 className="text-lg font-bold text-center text-white uppercase tracking-tight mb-2">
                {selectedRecipe.name}
              </h3>
              <p className="text-[11px] text-center text-gray-500 font-mono italic mb-6 px-2 leading-relaxed">
                {selectedRecipe.description}
              </p>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                  Requirements
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
                        className="flex justify-between items-center text-xs font-mono"
                      >
                        <span className="uppercase text-gray-400">{key}</span>
                        <span
                          className={
                            met
                              ? 'text-green-500 font-bold'
                              : 'text-red-500 font-bold'
                          }
                        >
                          {currentVal}/{val}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="pt-6 mt-auto flex-shrink-0">
              <button
                disabled={!canCraft(selectedRecipe)}
                onClick={() =>
                  onCraft(selectedRecipe.requirements, selectedRecipe.result)
                }
                className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] border transition-all ${
                  canCraft(selectedRecipe)
                    ? 'bg-white text-black border-white hover:bg-gray-200 active:scale-95 shadow-xl'
                    : 'bg-transparent text-gray-700 border-gray-800 cursor-not-allowed'
                }`}
              >
                Assemble Module
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] h-full flex items-center justify-center text-center">
            <div className="space-y-4">
              <div className="text-4xl opacity-20">📐</div>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-[0.2em]">
                Select Prototype
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
