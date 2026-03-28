'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PlayerStats, ResearchNode } from '../../shared/types/game';
import { RESEARCH_NODES } from '../../shared/config/researchData';
import { calculateNodePositions } from '../../shared/lib/researchUtils';

interface LaboratoryProps {
  stats: PlayerStats;
  onUnlockResearch: (id: string) => void;
  onClose: () => void;
}

export default function Laboratory({ stats, onUnlockResearch, onClose }: LaboratoryProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<ResearchNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 알고리즘을 통한 노드 좌표 계산
  const positionedNodes = useMemo(() => calculateNodePositions(RESEARCH_NODES), []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // 노드 간 연결선 렌더링
  const renderConnections = () => {
    return positionedNodes.map((node: ResearchNode) => {
      return node.dependencies.map((depId: string) => {
        const parent = positionedNodes.find((n) => n.id === depId);
        if (!parent || !parent.position || !node.position) return null;

        const isUnlocked = stats.unlockedResearchIds.includes(node.id) && stats.unlockedResearchIds.includes(parent.id);
        const canUnlock = stats.unlockedResearchIds.includes(parent.id);

        return (
          <line
            key={`${parent.id}-${node.id}`}
            x1={parent.position.x}
            y1={parent.position.y}
            x2={node.position.x}
            y2={node.position.y}
            stroke={isUnlocked ? '#fbbf24' : canUnlock ? '#4b5563' : '#1f2937'}
            strokeWidth="3"
            strokeDasharray={isUnlocked ? '0' : '8 4'}
            className="transition-all duration-500"
          />
        );
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 lg:p-12 overflow-hidden select-none">
      <div className="relative w-full h-full max-w-7xl bg-[#0a0a0b] border border-zinc-800 rounded-3xl md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden group">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 md:px-12 py-4 md:py-8 border-b border-zinc-800/50 bg-[#0c0c0d]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-amber-400/10 rounded-xl md:rounded-3xl flex items-center justify-center border border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
              <span className="text-xl md:text-3xl">🧪</span>
            </div>
            <div>
              <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter">Laboratory</h2>
              <p className="text-zinc-500 font-bold tracking-wider text-[8px] md:text-sm mt-0.5 md:mt-1 uppercase opacity-60">Research</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
             <div className="flex flex-col items-end">
                <span className="text-zinc-600 text-[8px] md:text-[10px] font-black tracking-widest uppercase mb-0.5 md:mb-1">Credits</span>
                <span className="text-lg md:text-3xl font-black text-amber-400 tabular-nums tracking-tighter">{stats.goldCoins.toLocaleString()} <span className="text-sm md:text-lg opacity-60 ml-0.5 md:ml-1 text-zinc-500">G</span></span>
             </div>
             <button onClick={onClose} className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-xl md:rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-xl">
               <span className="text-lg md:text-2xl font-bold">✕</span>
             </button>
          </div>
        </div>

        {/* Skill Tree Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(#1a1a1c_1px,transparent_1px)] bg-size-[40px_40px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="absolute transition-transform duration-75 ease-out"
            style={{ 
              left: '50%', 
              top: '50%', 
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` 
            }}
          >
            <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {renderConnections()}
            </svg>

            {positionedNodes.map((node: ResearchNode) => {
              const isUnlocked = stats.unlockedResearchIds.includes(node.id);
              const canUnlock = node.dependencies.every((d: string) => stats.unlockedResearchIds.includes(d));
              const isSelected = selectedNode?.id === node.id;
              
              if (!node.position) return null;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2 md:border-4 transition-all duration-300 cursor-pointer z-10
                    ${isUnlocked ? 'bg-amber-400 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] text-black' : 
                      canUnlock ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-amber-400/50 hover:bg-zinc-800' : 
                      'bg-zinc-950 border-zinc-900 text-zinc-700 opacity-40 grayscale'}
                    ${isSelected ? 'scale-125 border-white! z-20!' : 'hover:scale-110'}
                  `}
                  style={{ left: node.position.x, top: node.position.y }}
                >
                  <span className="text-2xl md:text-4xl">{node.icon}</span>
                  {!isUnlocked && canUnlock && (
                    <div className="absolute -top-1 md:-top-2 -right-1 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-amber-500 rounded-full border-2 border-[#0a0a0b] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-12 md:bottom-12 w-auto md:w-96 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-500 z-30">
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-950 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-zinc-800 shadow-inner">
                   {selectedNode.icon}
                 </div>
                 <div>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">{selectedNode.name}</h3>
                    <span className="text-[9px] md:text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">
                      {stats.unlockedResearchIds.includes(selectedNode.id) ? 'Research Completed' : 'Analysis Required'}
                    </span>
                 </div>
              </div>
              
              <p className="text-zinc-400 text-xs md:text-sm font-bold leading-relaxed mb-6 md:mb-8">
                {selectedNode.description}
              </p>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                 <div className="flex justify-between items-center text-[9px] md:text-[11px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-800 pb-2">
                    <span>Requirements</span>
                    <span>Cost</span>
                 </div>
                 {Object.entries(selectedNode.cost).map(([res, amount]) => {
                   const owned = res === 'goldCoins' ? stats.goldCoins : (stats.inventory as any)[res] || 0;
                   const met = owned >= (amount as number);
                   return (
                     <div key={res} className="flex justify-between items-center">
                        <span className="capitalize text-zinc-500 font-bold text-xs md:text-sm">{res}</span>
                        <span className={`font-black tabular-nums text-xs md:text-base ${met ? 'text-zinc-300' : 'text-rose-500'}`}>
                          {owned.toLocaleString()} / {amount.toLocaleString()}
                        </span>
                     </div>
                   );
                 })}
              </div>

              {!stats.unlockedResearchIds.includes(selectedNode.id) && (
                <button 
                  onClick={() => onUnlockResearch(selectedNode.id)}
                  disabled={!selectedNode.dependencies.every(d => stats.unlockedResearchIds.includes(d))}
                  className="w-full py-4 md:py-5 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black rounded-xl md:rounded-2xl font-black text-xs md:text-base tracking-widest transition-all shadow-xl active:scale-95"
                >
                  Initiate Research
                </button>
              )}
            </div>
          )}
          
          {/* Legend / Tooltips */}
          <div className="absolute left-6 bottom-6 hidden sm:flex gap-4 z-20">
              <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-[9px] font-black text-zinc-400 tracking-wider">Unlocked</span>
             </div>
             <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-zinc-600 rounded-full" />
                <span className="text-[9px] font-black text-zinc-400 tracking-wider">Available</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
