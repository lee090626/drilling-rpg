import React from 'react';
import { createPortal } from 'react-dom';

interface TooltipState {
  id: string;
  name: string;
  desc: string;
  x: number;
  y: number;
  type: 'stat' | 'perk';
  details?: { label: string; value: string | number; color?: string }[];
}

interface StatTooltipProps {
  tooltip: TooltipState | null;
}

export function StatTooltip({ tooltip }: StatTooltipProps) {
  if (!tooltip || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed z-1000000 pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        opacity: 1,
      }}
    >
      <div className="bg-zinc-950/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.15)] min-w-[200px] max-w-[280px] ring-1 ring-white/10">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <span className="text-[12px] text-emerald-400">
              {tooltip.type === 'stat' ? '📊' : '✨'}
            </span>
          </div>
          <span className="text-xs font-black text-white tracking-widest uppercase">
            {tooltip.name}
          </span>
        </div>

        {tooltip.type === 'stat' && tooltip.details ? (
          <div className="space-y-1.5 mt-2">
            {tooltip.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center gap-4 text-[11px]">
                <span className="text-zinc-500 font-medium">{detail.label}</span>
                <span className={`font-bold tabular-nums ${detail.color || 'text-zinc-300'}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-zinc-400 font-medium leading-relaxed mt-1">
            {tooltip.desc}
          </p>
        )}
      </div>
      <div className="w-3 h-3 bg-zinc-950/95 border-r border-b border-emerald-500/30 absolute left-1/2 -translate-x-1/2 -bottom-1.5 rotate-45" />
    </div>,
    document.body,
  );
}

export default React.memo(StatTooltip);
