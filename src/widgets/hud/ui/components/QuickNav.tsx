import React from 'react';
import Image from 'next/image';
import { AtlasIcon } from '../AtlasIcon';
import { atlasMap } from '@/shared/config/atlasMap';

interface NavItem {
  label: string;
  key: string;
  icon?: string;
  iconKey?: keyof typeof atlasMap;
  onClick?: () => void;
  color: string;
}

interface QuickNavProps {
  items: NavItem[];
}

/**
 * 하단 중앙의 퀵 액세스 네비게이션 메뉴 컴포넌트입니다.
 */
export const QuickNav: React.FC<QuickNavProps> = React.memo(({ items }) => {
  return (
    <div className="absolute left-1/2 bottom-2 md:bottom-6 lg:bottom-10 -translate-x-1/2 flex gap-1.5 md:gap-4 lg:gap-6 pointer-events-auto z-20">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="group relative flex flex-col items-center gap-1 md:gap-2 focus:outline-none focus:ring-4 focus:ring-white/70 rounded-2xl md:rounded-3xl p-1 shadow-2xl transition-all"
        >
          <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 px-2 py-1 md:px-3 md:py-1.5 bg-zinc-900/95 text-white text-[10px] md:text-xs font-black rounded-md md:rounded-lg opacity-0 md:group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/20 shadow-2xl backdrop-blur-md">
            {item.label}
          </div>
          <div className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 bg-zinc-900/90 backdrop-blur-3xl border border-white/20 rounded-lg md:rounded-2xl lg:rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:border-white/50 group-hover:bg-zinc-800/95 active:scale-90 relative overflow-hidden shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)]">
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300"
              style={{ backgroundColor: item.color }}
            />

            <div className="relative w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 z-10 transition-all duration-300 flex items-center justify-center">
              {item.iconKey ? (
                <AtlasIcon name={item.iconKey as any} alt={item.label} size={48} />
              ) : (
                <span className="text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">{item.icon}</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});
