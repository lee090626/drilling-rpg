import React from 'react';
import { SKILL_RUNES } from '../config/skillRuneData';
import { Rarity } from '../types/game';

export const rarityColors: Record<string, string> = {
  Common: 'from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-400',
  Uncommon: 'from-emerald-900/40 to-emerald-950 border-emerald-900 text-emerald-400 glow-emerald',
  Rare: 'from-blue-900/40 to-blue-950 border-blue-900 text-blue-400 glow-blue',
  Epic: 'from-purple-900/40 to-purple-950 border-purple-900 text-purple-400 glow-purple',
  Radiant: 'from-rose-900/40 to-rose-950 border-rose-900 text-rose-400 glow-rose',
  Legendary: 'from-amber-900/40 to-amber-950 border-amber-900/50 text-amber-400 glow-amber',
  Mythic: 'from-red-900/40 to-red-950 border-red-900/50 text-red-500 glow-red',
  Ancient: 'from-cyan-900/40 to-cyan-950 border-cyan-900/50 text-cyan-400 glow-cyan',
};

import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface SkillRuneIconProps {
  runeId: string;
  rarity: Rarity;
  size?: number; // 픽셀 단위 크기
  className?: string;
}

export default function SkillRuneIcon({
  runeId,
  rarity,
  size = 64,
  className = '',
}: SkillRuneIconProps) {
  const runeDef = SKILL_RUNES[runeId];
  if (!runeDef) return <div className={`${size} bg-zinc-900 rounded-2xl ${className}`} />;

  const themeClass = rarityColors[rarity] || rarityColors.Common;
  const imgSrc =
    typeof runeDef.image === 'string' ? runeDef.image : runeDef.image.src || runeDef.image;

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border bg-linear-to-br ${themeClass} overflow-hidden shadow-2xl transition-all duration-500 transform-gpu ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. Background Layers (Aura/Rays) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radiant/Legendary/Ancient: Rotating Rays */}
        {['Radiant', 'Legendary', 'Ancient'].includes(rarity) && (
          <div className="absolute -inset-[50%] bg-[radial-gradient(conic,transparent_20deg,currentColor_45deg,transparent_70deg)] opacity-20 animate-rune-spin-slow transform-gpu" />
        )}

        {/* Ancient: Reverse Rotating Orbit Layer */}
        {rarity === 'Ancient' && (
          <div className="absolute -inset-[30%] border border-current opacity-30 rounded-full animate-rune-orbit transform-gpu" />
        )}

        {/* Mythic: Lightning/Flicker Overlay */}
        {rarity === 'Mythic' && (
          <div className="absolute inset-0 bg-current opacity-20 animate-rune-lightning transform-gpu" />
        )}
      </div>

      {/* 2. Middle Layer (Glow/Pulse) */}
      <div
        className={`absolute inset-0 pointer-events-none transform-gpu
        ${rarity === 'Uncommon' ? 'animate-rune-fade' : ''}
        ${rarity === 'Rare' ? 'animate-rune-pulse' : ''}
        ${['Epic', 'Radiant', 'Legendary', 'Mythic', 'Ancient'].includes(rarity) ? 'animate-rune-pulse' : ''}
      `}
      >
        <div className="absolute inset-0 bg-current opacity-10" />
      </div>

      {/* 3. Front Particle Layer */}
      {['Legendary', 'Mythic', 'Ancient', 'Epic'].includes(rarity) && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-current/20 to-transparent animate-rune-fade pointer-events-none" />
      )}

      <div
        className={`relative z-10 w-[70%] h-[70%] flex items-center justify-center transform-gpu drop-shadow-2xl
        ${['Legendary', 'Mythic', 'Ancient'].includes(rarity) ? 'animate-rune-flicker brightness-110' : ''}
      `}
      >
        <AtlasIcon name={runeDef.image as any} size={Math.floor(size * 0.7)} />
      </div>

      {/* 5. Highlight/Gloss Overlay */}
      <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-white/10 opacity-50 pointer-events-none" />
    </div>
  );
}
