'use client';

import React from 'react';
import { PlayerStats } from '../types/game';
import { DRILLS } from '../lib/DrillData';

interface StatusWindowProps {
  stats: PlayerStats;
  onClose: () => void;
}

export default function StatusWindow({ stats, onClose }: StatusWindowProps) {
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];

  return (
    <div className="flex flex-col h-full overflow-hidden min-h-[500px] text-white font-sans">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">
              System Status
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] text-gray-500 font-mono font-bold tracking-[0.2em] uppercase">
                Core Online / ID: OMEGA-01
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {/* Vitality & Tech Stats */}
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-red-500 rounded-full" /> Core Vitality
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 shadow-inner">
              {/* HP Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-red-400">STRUCTURE INTEGRITY (HP)</span>
                  <span>
                    {Math.floor(stats.hp)} / {stats.maxHp}
                  </span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* Fuel Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-blue-400">ENERGY CELLS (FUEL)</span>
                  <span>
                    {Math.floor(stats.fuel)} / {stats.maxFuel}
                  </span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    style={{ width: `${(stats.fuel / stats.maxFuel) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-yellow-500 rounded-full" /> Tactical
              Data
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">
                  Attack Power
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {stats.attackPower}
                </div>
                <div className="text-[9px] text-purple-400 font-bold mt-1">
                  ATK
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">
                  Current Depth
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {Math.floor(stats.depth)}m
                </div>
                <div className="text-[9px] text-green-400 font-bold mt-1">
                  LOC
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">
                  Record Depth
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {Math.floor(stats.maxDepthReached)}m
                </div>
                <div className="text-[9px] text-blue-400 font-bold mt-1">
                  MAX
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center relative overflow-hidden group">
                <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">
                  Collected Items
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {Object.values(stats.inventory).reduce(
                    (a, b) => a + (b as number),
                    0,
                  )}
                </div>
                <div className="text-[9px] text-amber-400 font-bold mt-1">
                  INV
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Equipment & Artifacts */}
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-cyan-500 rounded-full" /> Active
              Module
            </h3>
            <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6 group">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                  {equippedDrill.icon}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white mb-1 uppercase italic tracking-tighter">
                    {equippedDrill.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mb-3 leading-tight italic">
                    "{equippedDrill.description}"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold font-mono border border-white/10 text-cyan-400">
                      PWR: {equippedDrill.basePower}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold font-mono border border-white/10 text-cyan-400">
                      SPD: {equippedDrill.cooldownMs}ms
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold font-mono border border-white/10 text-cyan-400">
                      F.C: {equippedDrill.fuelConsumption}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="h-full flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-purple-500 rounded-full" /> Artifacts
              Collection
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 min-h-[150px]">
              {stats.artifacts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {stats.artifacts.map((art, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl group hover:bg-purple-500/10 transition-colors"
                    >
                      <div className="text-3xl animate-bounce-slow">✨</div>
                      <div>
                        <div className="text-sm font-black text-purple-300 uppercase italic tracking-widest">
                          {art}
                        </div>
                        <div className="text-[10px] text-purple-400/60 font-mono font-bold">
                          LEGENDARY COMPONENT ACQUIRED
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                  <div className="text-4xl mb-2">💎</div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em]">
                    No Artifacts Detected
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600">
        <div className="flex gap-4">
          <span>OS: DRILL-TECH v4.2.1</span>
          <span>FIRMWARE: QUANTUM-SYNC</span>
        </div>
        <div className="animate-pulse">SYSTEM STATUS: OPTIMAL</div>
      </div>
    </div>
  );
}
