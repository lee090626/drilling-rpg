import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';
import AtlasIcon from '../hud/ui/AtlasIcon';

interface EncyclopediaDetailProps {
  id: string;
  tab: 'minerals' | 'bosses' | 'artifact';
  stats: PlayerStats;
  bossesData: any[]; // BOSSES array passed from parent
}

export function EncyclopediaDetail({ id, tab, stats, bossesData }: EncyclopediaDetailProps) {
  if (tab === 'artifact') {
    const item = ARTIFACT_DATA[id];
    if (!item) return null;

    const isStackable = item.type === 'stackable';
    const isUnlocked = isStackable
      ? (stats.collectionHistory?.[item.id] || 0) > 0
      : stats.unlockedResearchIds?.includes(item.id);
    const count = isStackable ? stats.collectionHistory?.[item.id] || 0 : 1;

    const bonusValue = isStackable ? count * (item.bonus?.value || 0) : item.bonus?.value || 0;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <span
            className={`text-[10px] font-black px-3 py-1.5 rounded-lg border tracking-widest uppercase ${isStackable ? 'bg-orange-900/20 border-orange-500/50 text-orange-400' : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400'}`}
          >
            {isStackable ? 'Stackable Artifact' : 'Unique Artifact'}
          </span>
          <span className="text-[9px] font-black text-zinc-600 tracking-widest">
            {isStackable ? `COLLECTED: ${count}` : isUnlocked ? 'STATE: UNLOCKED' : 'STATE: LOCKED'}
          </span>
        </div>

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div className={!isUnlocked ? 'filter grayscale opacity-20' : ''}>
            <span className="text-6xl">💎</span>
          </div>
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-800 font-black text-5xl opacity-40">
              LOCKED
            </div>
          )}
          {isUnlocked && (
            <div
              className={`absolute inset-0 rounded-3xl opacity-20 ${isStackable ? 'shadow-[inset_0_0_50px_#f97316]' : 'shadow-[inset_0_0_50px_#10b981]'}`}
            />
          )}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-2 tracking-tighter">
          {item.nameKo}
        </h3>
        <p className="text-[10px] text-zinc-500 text-center font-bold tracking-widest uppercase mb-8">
          {item.name}
        </p>

        {item.bonus && (
          <div className="bg-zinc-950 p-6 rounded-2xl border border-orange-950/30 mb-4 flex flex-col items-center">
            <div className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mb-3">
              Stat Bonus
            </div>
            <div className="text-2xl font-black text-orange-400 flex items-center gap-2">
              <span>+ {bonusValue.toLocaleString()}</span>
              <span className="text-xs text-zinc-600 tracking-tight">
                {item.bonus.stat.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {!isStackable && item.effectId && (
          <div className="bg-zinc-950 p-6 rounded-2xl border border-emerald-950/30 mb-4 flex flex-col items-center">
            <div className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mb-3">
              Unique Passive
            </div>
            <div className="text-sm font-black text-emerald-400 text-center leading-tight">
              {item.effectDescriptionKo}
            </div>
          </div>
        )}

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center italic mt-2">
          {item.descriptionKo}
        </div>
      </div>
    );
  }

  if (tab === 'minerals') {
    const mineral = MINERALS.find((m) => m.key === id);
    const isDiscovered = stats.discoveredMinerals.includes(id);
    if (!mineral) return null;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <span
            className="text-[10px] font-black px-3 py-1.5 rounded-lg border tracking-widest uppercase"
            style={{
              backgroundColor: isDiscovered ? `${mineral.color}20` : '#18181b',
              borderColor: isDiscovered ? mineral.color : '#27272a',
              color: isDiscovered ? mineral.color : '#52525b',
            }}
          >
            {isDiscovered ? 'Mineral' : 'Unknown'}
          </span>
          <span className="text-[9px] font-black text-zinc-600 tracking-widest">
            ID: {id.toUpperCase()}
          </span>
        </div>

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center text-8xl mx-auto mb-10 relative">
          <div
            className={`w-36 h-36 flex items-center justify-center ${!isDiscovered ? 'filter blur-xl opacity-20' : ''}`}
          >
            {isDiscovered ? (
              mineral.image ? (
                <AtlasIcon name={mineral.image} size={112} />
              ) : (
                <span className="text-8xl">{mineral.icon}</span>
              )
            ) : (
              '?'
            )}
          </div>
          {!isDiscovered && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-800 font-black text-5xl opacity-40">
              LOCKED
            </div>
          )}
          {isDiscovered && (
            <div
              className="absolute inset-0 rounded-3xl opacity-20"
              style={{ boxShadow: `inset 0 0 40px ${mineral.color}` }}
            />
          )}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-6 tracking-tighter">
          {isDiscovered ? mineral.name : 'Unknown Mineral'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox
            label="Min Depth"
            value={isDiscovered ? `${mineral.minDepth}m` : '???'}
            color="#94a3b8"
          />
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center flex flex-col items-center justify-center">
            <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest uppercase">
              Base Value
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-amber-500">
                {isDiscovered ? mineral.basePrice.toLocaleString() : '???'}
              </span>
              {isDiscovered && <AtlasIcon name="GoldIcon" size={14} />}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center italic">
          {isDiscovered
            ? mineral.description
            : 'Data is Locked. Please mine this mineral to unlock the data.'}
        </div>
      </div>
    );
  } else {
    const boss = bossesData.find((b) => b.id === id);
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

        <div className="w-40 h-40 bg-zinc-950 rounded-3xl shadow-inner border border-zinc-800 flex items-center justify-center mx-auto mb-10 relative">
          <div className={!isEncountered ? 'filter blur-xl opacity-20' : ''}>
            {isEncountered ? (
              <AtlasIcon name={boss.imagePath as any} size={128} />
            ) : (
              <span className="text-8xl">💀</span>
            )}
          </div>
          {!isEncountered && (
            <div className="absolute inset-0 flex items-center justify-center text-rose-900 font-black text-5xl opacity-40">
              MISSING
            </div>
          )}
        </div>

        <h3 className="text-3xl font-black text-white text-center mb-6 tracking-tighter">
          {isEncountered ? boss.name : 'Unknown Entity'}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox
            label="HP"
            value={isEncountered && boss.stats ? boss.stats.maxHp.toLocaleString() : '???'}
            color="#ef4444"
          />
          <StatBox
            label="ATK"
            value={isEncountered && boss.stats ? boss.stats.power.toLocaleString() : '???'}
            color="#f59e0b"
          />
        </div>

        <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 leading-relaxed text-xs text-zinc-400 text-center">
          {isEncountered
            ? boss.description
            : 'Strong biological signals detected in the depths. Data will be recorded upon encounter.'}
        </div>
      </div>
    );
  }
}

export function ProgressBox({
  label,
  current,
  total,
  color,
}: {
  label: string;
  current: number;
  total: number;
  color: string;
}) {
  const percent = (current / total) * 100;
  return (
    <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-black text-zinc-600 tracking-widest">{label}</span>
        <span className="text-xs font-black text-white tabular-nums">
          {current} / {total}
        </span>
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

export function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center">
      <div className="text-[8px] text-zinc-600 font-bold mb-1 tracking-widest">{label}</div>
      <div className="text-sm font-black" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
