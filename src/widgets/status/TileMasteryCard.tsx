import React from 'react';
import { MINERALS } from '@/shared/config/mineralData';
import { getNextLevelExp, getMasteryMultiplier } from '@/shared/lib/masteryUtils';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { AtlasIconName } from '@/shared/config/atlasMap';

interface TileMasteryCardProps {
  tileKey: string;
  mastery: { level: number; exp: number };
  unlockedPerks?: string[];
  hoveredTooltipId?: string;
  onHoverPerk: (e: React.MouseEvent, perkId: string, name: string, desc: string) => void;
  onLeavePerk: () => void;
}

export function TileMasteryCard({
  tileKey,
  mastery,
  unlockedPerks = [],
  hoveredTooltipId,
  onHoverPerk,
  onLeavePerk
}: TileMasteryCardProps) {
  const mineral = MINERALS.find(m => m.key === tileKey);
  const nextExp = getNextLevelExp(mastery.level);
  const expPercent = Math.min(100, (mastery.exp / nextExp) * 100);
  const masteryMult = getMasteryMultiplier(mastery.level);

  return (
    <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
      <div className="flex items-center gap-5 mb-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
          {mineral?.image ? (
            <AtlasIcon name={mineral.image as AtlasIconName} size={48} />
          ) : (
            <span className="text-2xl">{mineral?.icon || '❓'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end gap-2 mb-2">
            <span className="text-sm font-black text-zinc-300 italic truncate uppercase tracking-tighter">{mineral?.name || tileKey}</span>
            <span className="text-xs font-black text-emerald-500 shrink-0">LV.{mastery.level}</span>
          </div>
          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
            <div 
              className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000" 
              style={{ width: `${expPercent}%` }} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/50">
        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
          <span className="text-zinc-500 italic">Damage Buff</span>
          <span className="text-emerald-400 text-xs">+{((masteryMult - 1) * 100).toFixed(0)}%</span>
        </div>
        
        {/* BREAKTHROUGH BADGES */}
        <div className="flex justify-between items-center gap-1.5 mt-1">
          {[50, 100, 150, 200].map(level => {
            const isUnlocked = mastery.level >= level;
            const perkId = `perk_${tileKey}_${level}`;
            const perk = MASTERY_PERKS.find(p => p.id === perkId);
            const hasPerk = unlockedPerks.includes(perkId);
            
            return (
              <div 
                key={level}
                className={`
                  flex-1 flex items-center justify-center h-8 rounded-lg border text-[10px] font-black transition-all cursor-help
                  ${isUnlocked 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }
                  ${hoveredTooltipId === perkId ? 'scale-110 border-emerald-400! bg-emerald-500/20!' : ''}
                `}
                onMouseEnter={(e) => {
                  if (perk) {
                    onHoverPerk(e, perkId, perk.name, perk.description);
                  }
                }}
                onMouseLeave={onLeavePerk}
              >
                {level}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[8px] font-bold tabular-nums">
          <span className="text-zinc-600">EXPERIENCE</span>
          <span className="text-zinc-400">{mastery.exp} <span className="text-zinc-700">/</span> {nextExp}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TileMasteryCard);
