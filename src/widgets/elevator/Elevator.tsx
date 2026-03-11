import React from 'react';
import { MAP_WIDTH } from '../../shared/config/constants';
import { PlayerStats, Position } from '../../shared/types/game';

interface ElevatorProps {
  stats: PlayerStats;
  onSelectCheckpoint: (depth: number) => void;
  onClose: () => void;
}

const Elevator: React.FC<ElevatorProps> = ({ stats, onSelectCheckpoint, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/90 backdrop-blur-3xl">
      <div className="bg-[#1a1a1b] w-full max-w-2xl max-h-[85vh] rounded-3xl border-l-[6px] border-[#eab308] relative flex flex-col p-8 md:p-10 animate-modal shadow-2xl text-[#d1d5db]">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-black text-[#eab308] uppercase tracking-tighter flex items-center gap-3">
            <span>🛗</span> ELEVATOR
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar">
          <button
            onClick={() => onSelectCheckpoint(0)}
            className="w-full p-6 rounded-2xl bg-[#252526] border border-zinc-800 text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg"
          >
            <div className="flex flex-col items-start">
              <span className="text-[#eab308] text-[9px] uppercase tracking-widest mb-1 group-hover:brightness-125">
                지표면
              </span>
              <span className="text-xl">베이스 캠프</span>
            </div>
            <span className="bg-zinc-900 px-4 py-1.5 rounded-full text-xs font-mono text-[#eab308]">
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
              className="w-full p-6 rounded-2xl bg-[#252526] border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg"
            >
              <div className="flex flex-col items-start">
                <span className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">
                  체크포인트
                </span>
                <span className="text-xl">전초기지_{depth}</span>
              </div>
              <span className="bg-zinc-900 px-4 py-1.5 rounded-full text-xs font-mono">
                {depth}m
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Elevator;
