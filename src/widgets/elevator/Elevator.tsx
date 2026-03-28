import React from 'react';
import { PlayerStats, Position } from '../../shared/types/game';

interface ElevatorProps {
  stats: PlayerStats;
  onSelectCheckpoint: (depth: number) => void;
  onClose: () => void;
}

const Elevator: React.FC<ElevatorProps> = ({ stats, onSelectCheckpoint, onClose }) => {
  return (
      <div className="bg-[#1a1a1b] w-full max-w-2xl max-h-[90vh] rounded-2xl md:rounded-3xl border border-zinc-800 relative flex flex-col p-6 md:p-10 shadow-2xl text-[#d1d5db]">
        <div className="flex justify-between items-center mb-6 md:mb-8 shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-[#eab308] tracking-tighter flex items-center gap-2 md:gap-3">
            <span>🛗</span> Elevator
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
        <div className="space-y-3 md:space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar">
          <button
            onClick={() => onSelectCheckpoint(0)}
            className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg"
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
              className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg"
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
