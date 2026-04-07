import React, { useState } from 'react';
import Image from 'next/image';
import { PlayerStats } from '../../shared/types/game';
import { MINERALS } from '../../shared/config/mineralData';
import { BOSSES } from '../../shared/config/bossData';
import GoldIconImg from '@/src/shared/assets/ui/icons/MoneyIcon.webp';

interface EncyclopediaProps {
  stats: PlayerStats;
  onClose: () => void;
}

function Encyclopedia({ stats, onClose }: EncyclopediaProps) {
  const [activeTab, setActiveTab] = useState<'minerals' | 'bosses'>('minerals');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const discoveredCount = stats.discoveredMinerals.length;
  const totalMinerals = MINERALS.length;
  const encounteredBossCount = stats.encounteredBossIds.length;
  const totalBosses = BOSSES.length;

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">📖</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-purple-400 leading-none">
                Books
              </h2>
              <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase mt-1">Discovery Archive</span>
            </div>
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('minerals'); setSelectedId(null); }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${activeTab === 'minerals' ? 'bg-zinc-800 text-purple-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Minerals
            </button>
            <button
              onClick={() => { setActiveTab('bosses'); setSelectedId(null); }}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${activeTab === 'bosses' ? 'bg-zinc-800 text-purple-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Bosses
            </button>
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
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-purple-400 hover:text-black hover:border-purple-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden pr-0 lg:pr-2">
        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar pb-10 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {activeTab === 'minerals' ? (
              MINERALS.map((m) => {
                const isDiscovered = stats.discoveredMinerals.includes(m.key);
                const isSelected = selectedId === m.key;

                return (
                  <button
                    key={m.key}
                    onClick={() => setSelectedId(m.key)}
                    className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                      isSelected
                        ? 'bg-[#252526] border-purple-400 shadow-2xl scale-[1.02]'
                        : !isDiscovered
                          ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                          : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-20 h-20 flex items-center justify-center text-6xl mb-4 transition-all ${!isDiscovered ? 'filter blur-md grayscale opacity-50' : ''}`}>
                      {isDiscovered ? (m.image ? <img src={typeof m.image === 'string' ? m.image : m.image.src || m.image} alt={m.name} className="w-full h-full object-contain drop-shadow-lg" /> : m.icon) : '?'}
                    </div>
                    <div className="text-[20px] text-zinc-500 font-bold tracking-widest">
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
                    className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                      isSelected
                        ? 'bg-[#252526] border-[#a855f7] shadow-2xl scale-[1.02]'
                        : !isEncountered
                          ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                          : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-20 h-20 flex items-center justify-center text-6xl mb-4 transition-all ${!isEncountered ? 'filter blur-md grayscale opacity-50' : ''}`}>
                      {isEncountered ? b.icon : '💀'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold tracking-widest">
                      {isEncountered ? b.name : 'Classified'}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DETAIL SECTION */}
        <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-5 md:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
          {selectedId ? (
            <DetailContent 
              id={selectedId} 
              tab={activeTab} 
              stats={stats} 
            />
          ) : (
            <div className="h-full py-8 md:py-0 flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-20 animate-pulse">📡</div>
              <h3 className="text-base md:text-lg font-black text-zinc-700 tracking-widest uppercase">
                Scanning Database...
              </h3>
              <p className="text-[9px] md:text-[10px] text-zinc-800 mt-2 font-bold tracking-widest uppercase">
                Select an entry for analysis
              </p>
              
              <div className="mt-8 md:mt-12 w-full space-y-3">
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
          <span className="text-[10px] font-black px-3 py-1.5 rounded-lg border tracking-widest uppercase" style={{ 
            backgroundColor: isDiscovered ? `${mineral.color}20` : '#18181b',
            borderColor: isDiscovered ? mineral.color : '#27272a',
            color: isDiscovered ? mineral.color : '#52525b'
          }}>
            {isDiscovered ? 'Mineral' : 'Unknown'}
          </span>
          <span className="text-[9px] font-black text-zinc-600 tracking-widest">
            ID: {id.toUpperCase()}
          </span>
        </div>

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div className={`w-36 h-36 flex items-center justify-center ${!isDiscovered ? 'filter blur-xl opacity-20' : ''}`}>
            {isDiscovered ? (mineral.image ? <img src={typeof mineral.image === 'string' ? mineral.image : mineral.image.src || mineral.image} alt={mineral.name} className="w-full h-full object-contain drop-shadow-2xl" /> : mineral.icon) : '?'}
          </div>
          {!isDiscovered && <div className="absolute inset-0 flex items-center justify-center text-zinc-800 font-black text-5xl opacity-40">LOCKED</div>}
          {isDiscovered && (
            <div className="absolute inset-0 rounded-3xl opacity-20" style={{ boxShadow: `inset 0 0 40px ${mineral.color}` }} />
          )}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-6 tracking-tighter">
          {isDiscovered ? mineral.name : 'Unknown Mineral'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="Min Depth" value={isDiscovered ? `${mineral.minDepth}m` : '???'} color="#94a3b8" />
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center flex flex-col items-center justify-center">
            <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest uppercase">Base Value</div>
            <div className="flex items-center gap-1.5">
               <span className="text-sm font-black text-amber-500">{isDiscovered ? mineral.basePrice.toLocaleString() : '???'}</span>
               {isDiscovered && <Image src={GoldIconImg} alt="Gold" width={14} height={14} />}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center italic">
          {isDiscovered ? mineral.description : 'Data is Locked. Please mine this mineral to unlock the data.'}
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
          <span className="bg-rose-950/30 border border-rose-900 text-rose-500 text-[9px] font-black px-3 py-1.5 rounded-lg tracking-widest">
            Boss Class
          </span>
          <span className="text-[9px] font-black text-zinc-600 tracking-widest">
            Depth: {boss.depth}m
          </span>
        </div>

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div className={!isEncountered ? 'filter blur-xl opacity-20' : ''}>
            {isEncountered ? boss.icon : '💀'}
          </div>
          {!isEncountered && <div className="absolute inset-0 flex items-center justify-center text-rose-900 font-black text-5xl opacity-40">MISSING</div>}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-6 tracking-tighter">
          {isEncountered ? boss.name : 'Unknown Entity'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="HP" value={isEncountered ? boss.stats.hp.toLocaleString() : '???'} color="#ef4444" />
          <StatBox label="ATK" value={isEncountered ? boss.stats.attack.toLocaleString() : '???'} color="#f59e0b" />
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center">
          {isEncountered ? boss.description : 'Strong biological signals detected in the depths. Data will be recorded upon encounter.'}
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
        <span className="text-[9px] font-black text-zinc-600 tracking-widest">{label}</span>
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
      <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest">{label}</div>
      <div className="text-sm font-black" style={{ color }}>{value}</div>
    </div>
  );
}

export default React.memo(Encyclopedia, (prev, next) => {
  return prev.stats === next.stats;
});
