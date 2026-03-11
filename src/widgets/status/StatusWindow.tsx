'use client';

import React from 'react';
import { PlayerStats } from '../../shared/types/game';
import { DRILLS } from '../../shared/config/drillData';

interface StatusWindowProps {
  stats: PlayerStats;
  onClose: () => void;
}

export default function StatusWindow({ stats, onClose }: StatusWindowProps) {
  const equippedDrill = DRILLS[stats.equippedDrillId] || DRILLS['rusty_drill'];
  const baseAttack = equippedDrill.basePower;

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans p-8 bg-[#1a1a1b] border-l-[6px] border-[#eab308] shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-[#eab308] uppercase">
          STATUS
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-[#252526] px-6 py-2 rounded-xl border border-zinc-800">
            <span className="text-xl font-black text-white tabular-nums">
              {stats.goldCoins.toLocaleString()}{' '}
              <span className="text-[#eab308] text-sm">G</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-xl font-black">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pr-2 custom-scrollbar">
        {/* COLUMN 1: BASE METRICS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
            ATTRIBUTES
          </h3>

          {[
            { label: 'POWER', value: stats.attackPower + baseAttack },
            { label: 'MAX HP', value: stats.maxHp },
            { label: 'CURRENT DEPTH', value: `${Math.floor(stats.depth)}m` },
            {
              label: 'MAX DEPTH',
              value: `${Math.floor(stats.maxDepthReached)}m`,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#252526] p-5 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-[#eab308]/50 transition-colors"
            >
              <div className="text-[11px] font-bold text-white tracking-tight">
                {stat.label}
              </div>
              <div className="text-2xl font-black text-[#eab308] tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* COLUMN 2: PLAYER DETAILS */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
            PLAYER STATUS
          </h3>

          <div className="bg-[#252526] p-6 rounded-2xl border border-zinc-800 space-y-8">
            {/* HP BAR */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  Health
                </span>
                <span className="text-sm font-black text-white tabular-nums">
                  {Math.floor(stats.hp)}{' '}
                  <span className="text-zinc-500">/ {stats.maxHp}</span>
                </span>
              </div>
              <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[2px]">
                <div
                  className="h-full bg-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#252526] p-6 rounded-2xl border border-zinc-800">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
              ARTIFACTS
            </h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
              {stats.artifacts.length > 0 ? (
                stats.artifacts.map((art, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-zinc-300 tracking-tight">
                      {art}
                    </span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-20 text-[10px] font-bold uppercase tracking-widest">
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: EQUIPPED HARDWARE */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
            EQUIPPED GEAR
          </h3>

          <div className="bg-[#252526] p-8 rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col items-center text-center relative group overflow-hidden">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center text-6xl mb-6 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
              {equippedDrill.icon}
            </div>

            <h4 className="text-2xl font-black text-white tracking-tighter mb-4">
              {equippedDrill.name}
            </h4>

            <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-zinc-800 pt-6">
              <div className="text-center">
                <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">
                  POWER
                </div>
                <div className="text-xl font-black text-white">
                  {equippedDrill.basePower}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">
                  SPEED
                </div>
                <div className="text-xl font-black text-white">
                  {equippedDrill.cooldownMs}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
