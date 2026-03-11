'use client';

import React, { useState } from 'react';
import { PlayerStats } from '../../shared/types/game';
import { MINERALS } from '../../shared/config/mineralData';
import { BOSSES } from '../../shared/config/bossData';

interface EncyclopediaProps {
  stats: PlayerStats;
  onClose: () => void;
}

export default function Encyclopedia({ stats, onClose }: EncyclopediaProps) {
  const [activeTab, setActiveTab] = useState<'minerals' | 'bosses'>('minerals');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const discoveredCount = stats.discoveredMinerals.length;
  const totalMinerals = MINERALS.length;
  const encounteredBossCount = stats.encounteredBossIds.length;
  const totalBosses = BOSSES.length;

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans p-8 bg-[#1a1a1b] border-l-[6px] border-[#a855f7] shadow-2xl relative overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-[#a855f7] uppercase">
            ENCYCLOPEDIA
          </h2>
          <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
            Data Log & Discovery Records
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-2 p-1 bg-[#252526] rounded-xl border border-zinc-800">
            <button
              onClick={() => { setActiveTab('minerals'); setSelectedId(null); }}
              className={`px-8 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'minerals' ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              MINERALS
            </button>
            <button
              onClick={() => { setActiveTab('bosses'); setSelectedId(null); }}
              className={`px-8 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bosses' ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              BOSSES
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#a855f7] text-white hover:brightness-110 transition-all active:scale-90 shadow-xl"
          >
            <span className="text-xl font-black">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden pr-2">
        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTab === 'minerals' ? (
              MINERALS.map((m) => {
                const isDiscovered = stats.discoveredMinerals.includes(m.key);
                const isSelected = selectedId === m.key;

                return (
                  <button
                    key={m.key}
                    onClick={() => setSelectedId(m.key)}
                    className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden ${
                      isSelected
                        ? 'bg-[#252526] border-[#a855f7] shadow-2xl scale-[1.02]'
                        : !isDiscovered
                          ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                          : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`text-4xl mb-3 transition-all ${!isDiscovered ? 'filter blur-md grayscale' : 'group-hover:scale-110'}`}>
                      {isDiscovered ? m.icon : '?'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {isDiscovered ? m.name : 'Unknown'}
                    </div>
                    {!isDiscovered && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-zinc-800 text-6xl font-black opacity-20">?</span>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              BOSSES.map((b) => {
                const isEncountered = stats.encounteredBossIds.includes(b.id);
                const isSelected = selectedId === b.id;

                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden ${
                      isSelected
                        ? 'bg-[#252526] border-[#a855f7] shadow-2xl scale-[1.02]'
                        : !isEncountered
                          ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                          : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`text-4xl mb-3 transition-all ${!isEncountered ? 'filter blur-md grayscale' : 'group-hover:scale-110'}`}>
                      {isEncountered ? b.icon : '💀'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {isEncountered ? b.name : 'Classified'}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DETAIL SECTION */}
        <div className="w-full lg:w-[400px] shrink-0 h-full flex flex-col bg-[#252526] rounded-[2rem] p-8 border border-zinc-800 relative shadow-2xl overflow-hidden">
          {selectedId ? (
            <DetailContent 
              id={selectedId} 
              tab={activeTab} 
              stats={stats} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-6 opacity-20 animate-pulse">📡</div>
              <h3 className="text-lg font-black text-zinc-700 uppercase tracking-widest">
                Scanning Database...
              </h3>
              <p className="text-[10px] text-zinc-800 mt-2 font-bold uppercase tracking-widest">
                Select an entry to view detailed telemetry
              </p>
              
              <div className="mt-12 w-full space-y-3">
                <ProgressBox 
                  label="Minerals Discovery" 
                  current={discoveredCount} 
                  total={totalMinerals} 
                  color="#a855f7" 
                />
                <ProgressBox 
                  label="Boss Encounters" 
                  current={encounteredBossCount} 
                  total={totalBosses} 
                  color="#ef4444" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailContent({ id, tab, stats }: { id: string, tab: 'minerals' | 'bosses', stats: PlayerStats }) {
  if (tab === 'minerals') {
    const mineral = MINERALS.find(m => m.key === id);
    const isDiscovered = stats.discoveredMinerals.includes(id);
    if (!mineral) return null;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest`} style={{ 
            backgroundColor: isDiscovered ? `${mineral.color}20` : '#18181b',
            borderColor: isDiscovered ? mineral.color : '#27272a',
            color: isDiscovered ? mineral.color : '#52525b'
          }}>
            {isDiscovered ? mineral.rarity : 'Unknown Rarity'}
          </span>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            ID: {id.toUpperCase()}
          </span>
        </div>

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div className={!isDiscovered ? 'filter blur-xl opacity-20' : ''}>
            {isDiscovered ? mineral.icon : '?'}
          </div>
          {!isDiscovered && <div className="absolute inset-0 flex items-center justify-center text-zinc-800 font-black text-5xl opacity-40">LOCKED</div>}
          {isDiscovered && (
            <div className="absolute inset-0 rounded-3xl opacity-20" style={{ boxShadow: `inset 0 0 40px ${mineral.color}` }} />
          )}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-6 tracking-tighter uppercase">
          {isDiscovered ? mineral.name : 'Unknown Mineral'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="Min Depth" value={isDiscovered ? `${mineral.minDepth}m` : '???'} color="#94a3b8" />
          <StatBox label="Base Value" value={isDiscovered ? `${mineral.basePrice}G` : '???'} color="#fbbf24" />
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center italic">
          {isDiscovered ? mineral.description : '데이터가 암호화되어 있습니다. 해당 광물을 채굴하여 정보를 갱신하십시오.'}
        </div>
      </div>
    );
  } else {
    const boss = BOSSES.find(b => b.id === id);
    const isEncountered = stats.encounteredBossIds.includes(id);
    if (!boss) return null;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <span className="bg-rose-950/30 border border-rose-900 text-rose-500 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
            Boss Class
          </span>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            Depth: {boss.depth}m
          </span>
        </div>

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div className={!isEncountered ? 'filter blur-xl opacity-20' : ''}>
            {isEncountered ? boss.icon : '💀'}
          </div>
          {!isEncountered && <div className="absolute inset-0 flex items-center justify-center text-rose-900 font-black text-5xl opacity-40">MISSING</div>}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-6 tracking-tighter uppercase">
          {isEncountered ? boss.name : 'Unknown Entity'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="HP" value={isEncountered ? boss.stats.hp.toLocaleString() : '???'} color="#ef4444" />
          <StatBox label="ATK" value={isEncountered ? boss.stats.attack.toLocaleString() : '???'} color="#f59e0b" />
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center">
          {isEncountered ? boss.description : '심층부에서 감지된 강력한 생체 신호입니다. 조우 시 데이터가 기록됩니다.'}
        </div>
      </div>
    );
  }
}

function ProgressBox({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
  const percent = (current / total) * 100;
  return (
    <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-white tabular-nums">{current} / {total}</span>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000" 
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center">
      <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest uppercase">{label}</div>
      <div className="text-sm font-black" style={{ color }}>{value}</div>
    </div>
  );
}
