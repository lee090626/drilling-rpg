import React from 'react';
import Image from 'next/image';
import { PlayerStats, Position } from '../../shared/types/game';
import GoldIconImg from '@/src/shared/assets/ui/icons/MoneyIcon.webp';

interface ElevatorProps {
  stats: PlayerStats;
  onSelectCheckpoint: (depth: number) => void;
  onClose: () => void;
}

const Elevator: React.FC<ElevatorProps> = ({ stats, onSelectCheckpoint, onClose }) => {
  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">🛗</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-amber-500 leading-none">
                Elevator
              </h2>
              <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase mt-1">Vertical Transport</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center justify-center gap-2 md:gap-4 bg-zinc-950 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-zinc-800 shadow-inner">
            <div className="w-6 h-6 md:w-8 md:h-8 relative">
               <Image src={GoldIconImg} alt="Gold" fill className="object-contain" />
            </div>
            <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>
        <div className="space-y-3 md:space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar">
          <button
            onClick={() => onSelectCheckpoint(0)}
            className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            <div className="flex flex-col items-start">
              <span className="text-[#eab308] text-[8px] md:text-[9px] tracking-widest mb-0.5 md:mb-1 group-hover:brightness-125">
                Surface
              </span>
              <span className="text-lg md:text-xl">Base Camp</span>
            </div>
            <span className="bg-zinc-900 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-mono text-[#eab308]">
              0m
            </span>
          </button>

          {Array.from(
            { length: Math.floor(stats.maxDepthReached / 100) },
            (_, i) => (i + 1) * 100,
          ).map((depth) => (
            <button
              key={depth}
              onClick={() => onSelectCheckpoint(depth)}
              className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            >
              <div className="flex flex-col items-start">
                <span className="text-zinc-600 text-[8px] md:text-[9px] tracking-widest mb-0.5 md:mb-1 uppercase">
                  Checkpoint
                </span>
                <span className="text-lg md:text-xl">Outpost_{depth}</span>
              </div>
              <span className="bg-zinc-900 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-mono">
                {depth}m
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default Elevator;
