import React, { useState } from 'react';
import { PlayerStats, TileType } from '@/shared/types/game';
import { ARTIFACT_DATA, ARTIFACT_LIST, ArtifactDefinition } from '@/shared/config/artifactData';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface SynthesisAltarProps {
  stats: PlayerStats;
  onSynthesize: (id: string, requirements: any) => void;
  onClose: () => void;
}

export default function SynthesisAltar({ stats, onSynthesize, onClose }: SynthesisAltarProps) {
  const synthesisList = ARTIFACT_LIST.filter(item => item.type === 'unique');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(synthesisList[0]?.id || null);

  const selectedArtifact = synthesisList.find(r => r.id === selectedArtifactId);
  const isUnlocked = selectedArtifactId ? stats.unlockedResearchIds.includes(selectedArtifactId) : false;

  const checkRequirements = (artifact: ArtifactDefinition) => {
    if (!artifact.requirements) return false;
    return Object.entries(artifact.requirements).every(([res, amount]) => {
      const owned = res === 'goldCoins' ? stats.goldCoins : (stats.inventory as any)[res] || 0;
      return owned >= (amount as number);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 lg:p-12 overflow-hidden select-none">
      <div className="relative w-full h-full max-w-6xl bg-[#0a0a0b] border border-orange-950/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(249,115,22,0.15)] flex flex-col overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* HEADER */}
        <div className="flex justify-between items-center p-8 z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-4xl border border-orange-900/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              🔥
            </div>
            <div>
              <h2 className="text-3xl font-black text-orange-500 tracking-tighter uppercase italic">Synthesis Altar</h2>
              <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase opacity-60 mt-1">Sacred Relic Forging Station</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-zinc-950 px-6 py-3 rounded-2xl border border-zinc-900 shadow-inner">
               <AtlasIcon name="GoldIcon" size={24} />
               <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                 {stats.goldCoins.toLocaleString()}
               </span>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:bg-orange-500 hover:text-black hover:border-orange-500 transition-all active:scale-90 shadow-xl"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 p-8 pt-0 overflow-hidden z-10">
          
          {/* LEFT: Recipe List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
             {synthesisList.map((artifact) => {
               const active = selectedArtifactId === artifact.id;
               const unlocked = stats.unlockedResearchIds.includes(artifact.id);
               const canCraft = !unlocked && checkRequirements(artifact);

               return (
                 <button
                   key={artifact.id}
                   onClick={() => setSelectedArtifactId(artifact.id)}
                   className={`relative w-full p-5 rounded-2xl border transition-all flex items-center gap-4 group
                     ${active ? 'bg-zinc-900/80 border-orange-500/50 shadow-lg' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-700'}
                     ${unlocked ? 'opacity-60' : ''}
                   `}
                 >
                   <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-500 group-hover:scale-110
                     ${unlocked ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-900 text-zinc-500'}
                     ${active ? 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}
                   `}>
                     💎
                   </div>
                   
                   <div className="flex-1 text-left">
                     <h3 className={`text-sm font-black tracking-tight ${active ? 'text-orange-400' : 'text-zinc-300'}`}>
                        {artifact.nameKo}
                     </h3>
                     <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                       {artifact.bonus ? `${artifact.bonus.stat} +${artifact.bonus.value}` : 'Unique Growth Effect'}
                     </p>
                   </div>

                   {unlocked && (
                     <div className="text-[10px] font-black text-orange-500/50 uppercase tracking-widest bg-orange-950/20 px-3 py-1 rounded-full border border-orange-500/10">
                       Mastered
                     </div>
                   )}
                   {!unlocked && canCraft && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]" />
                   )}
                 </button>
               );
             })}
          </div>

          {/* RIGHT: Selected Detail & Altar Mechanism */}
          <div className="w-full lg:w-[450px] bg-zinc-950 rounded-[2rem] border border-orange-900/10 p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
              {selectedArtifact ? (
                <div className="w-full h-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
                   {/* Altar Area */}
                   <div className="w-48 h-48 bg-[#0a0a0b] border border-zinc-900 rounded-full flex items-center justify-center relative mb-8 group">
                      <div className="absolute inset-0 rounded-full bg-orange-500/5 blur-[40px] animate-pulse" />
                      <div className="absolute inset-2 rounded-full border border-dashed border-orange-500/10 animate-[spin_20s_linear_infinite]" />
                      <div className={`text-8xl p-8 rounded-full transition-transform duration-700 group-hover:scale-110 z-10 ${isUnlocked ? 'filter-none' : 'grayscale brightness-50'}`}>
                        💎
                      </div>

                      {/* Success Sparkles */}
                      {isUnlocked && (
                         <div className="absolute -inset-4 border-2 border-orange-500/20 rounded-full animate-ping" />
                      )}
                   </div>

                   <h3 className="text-2xl font-black text-white text-center mb-1">{selectedArtifact.nameKo}</h3>
                   <p className="text-[10px] text-orange-500 text-center font-bold tracking-[0.2em] mb-6 uppercase italic">
                      Sacred Artifact of the Abyss
                   </p>

                   <div className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 mb-6 text-center text-xs text-zinc-400 font-bold leading-relaxed italic">
                      "{selectedArtifact.descriptionKo}"
                   </div>

                   {/* Stats / Effect Section */}
                   <div className="w-full flex flex-col gap-4 mb-8">
                      {selectedArtifact.bonus && (
                        <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base Stat Bonus</span>
                           <span className="text-orange-400 font-black tracking-tight underline decoration-orange-950 underline-offset-4">
                              {selectedArtifact.bonus.stat.toUpperCase()} +{selectedArtifact.bonus.value}
                           </span>
                        </div>
                      )}
                      {selectedArtifact.effectDescriptionKo && (
                        <div className="flex flex-col items-center bg-zinc-900 p-4 rounded-xl border border-emerald-900/30">
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Growth Effect</span>
                           <span className="text-xs text-zinc-200 font-black text-center leading-tight">
                              {selectedArtifact.effectDescriptionKo}
                           </span>
                        </div>
                      )}
                   </div>

                   {/* Requirements Section */}
                   <div className="w-full space-y-3 mb-10 flex-1">
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-4 text-center">Synthesis Materials</p>
                      {selectedArtifact.requirements && Object.entries(selectedArtifact.requirements).map(([res, amount]) => {
                        const owned = res === 'goldCoins' ? stats.goldCoins : (stats.inventory as any)[res] || 0;
                        const met = owned >= (amount as number);
                        return (
                          <div key={res} className="flex justify-between items-center px-4 py-3 bg-zinc-900/30 rounded-xl border border-zinc-900/50">
                             <div className="flex items-center gap-3">
                                {res === 'goldCoins' ? (
                                   <AtlasIcon name="GoldIcon" size={16} />
                                ) : (
                                   <div className="w-4 h-4 bg-zinc-800 rounded-sm flex items-center justify-center text-[10px]">📦</div>
                                )}
                                <span className="text-xs font-bold text-zinc-500 capitalize">{res === 'goldCoins' ? 'Gold Coins' : res}</span>
                             </div>
                             <span className={`text-xs font-black tabular-nums ${met ? 'text-zinc-300' : 'text-rose-500 animate-pulse'}`}>
                                {owned.toLocaleString()} / {amount.toLocaleString()}
                             </span>
                          </div>
                        );
                      })}
                   </div>

                   {isUnlocked ? (
                      <div className="w-full py-5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl text-center font-black tracking-widest uppercase flex items-center justify-center gap-2">
                         <span>✨ ALREADY SYNTHESIZED</span>
                      </div>
                   ) : (
                      <button
                        onClick={() => onSynthesize(selectedArtifact.id, selectedArtifact.requirements)}
                        disabled={!checkRequirements(selectedArtifact)}
                        className="w-full py-5 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black rounded-2xl font-black text-lg tracking-widest transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                      >
                         <span className="group-hover:rotate-12 inline-block transition-transform">🔥</span> INITIATE SYNTHESIS
                      </button>
                   )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                   <div className="text-8xl mb-6">🕯️</div>
                   <h3 className="text-xl font-black uppercase tracking-widest">Awakening the Altar...</h3>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
