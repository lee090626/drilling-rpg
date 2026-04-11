import React, { useMemo } from 'react';
import Image, { StaticImageData } from 'next/image';
import { PlayerStats } from '@/shared/types/game';
import { getDimensionConfig } from '@/shared/config/dimensionData';
import { getDrillData } from '@/shared/config/drillData';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';

import { AtlasIcon } from './AtlasIcon';
import { atlasMap } from '@/shared/config/atlasMap';
// Icons are now sourced from the texture atlas via AtlasIcon

interface NavItem {
  label: string;
  key: string;
  src?: StaticImageData;
  icon?: string;
  iconKey?: keyof typeof atlasMap;
  onClick?: () => void;
  color: string;
}

interface HudProps {
  stats: PlayerStats;
  pos: { x: number; y: number };
  onOpenStatus?: () => void;
  onOpenInventory?: () => void;
  onOpenEncyclopedia?: () => void;
  onOpenElevator?: () => void;
  onOpenSettings?: () => void;
  onOpenGuide?: () => void;
}

/**
 * 게임 메인 화면의 오버레이 UI(체력, 깊이, 퀵 메뉴 등)를 표시하는 컴포넌트입니다.
 */
const Hud: React.FC<HudProps> = React.memo(({ 
  stats, 
  pos,
  onOpenStatus, 
  onOpenInventory, 
  onOpenEncyclopedia, 
  onOpenElevator,
  onOpenSettings,
  onOpenGuide
}) => {
  const hpPercent = Math.max(0, (stats.hp / stats.maxHp) * 100);
  const config = getDimensionConfig(stats.dimension);

  /** 하단 네비게이션 메뉴 항목 */
  const navItems: NavItem[] = useMemo(() => [
    { label: 'Status', key: 'C', iconKey: 'status', onClick: onOpenStatus, color: '#eab308' },
    { label: 'Inventory', key: 'I', iconKey: 'inventory', onClick: onOpenInventory, color: '#f59e0b' },
    { label: 'Book', key: 'B', iconKey: 'book', onClick: onOpenEncyclopedia, color: '#a855f7' },
    { label: 'Setting', key: 'S', iconKey: 'settings', onClick: onOpenSettings, color: '#94a3b8' },
    { label: 'Guide', key: 'H', icon: '❓', onClick: onOpenGuide, color: '#22d3ee' },
  ], [onOpenStatus, onOpenInventory, onOpenEncyclopedia, onOpenSettings, onOpenGuide]);

  const equippedDrill = getDrillData(stats.equippedDrillId);

  return (
    <div className="absolute top-0 left-0 w-full h-full p-4 md:p-8 pointer-events-none select-none flex flex-col justify-between overflow-hidden">
      
      {/* --- 상단 섹션 --- */}
      <div className="flex justify-between items-start w-full">
        
        {/* 상단 좌측: 생존 상태 (HP) */}
        <div className="flex flex-col gap-1 md:gap-2 w-32 md:w-48 lg:w-72 mt-1">
          <div className="relative h-4 md:h-6 lg:h-8 bg-black/60 backdrop-blur-xl rounded-full p-px md:p-[2px] border shadow-inner overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)] ${
                hpPercent > 50 ? 'bg-linear-to-r from-emerald-600 to-emerald-400' : 
                hpPercent > 20 ? 'bg-linear-to-r from-orange-500 to-orange-300' : 
                'bg-linear-to-r from-rose-600 to-rose-400 animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
            {/* HP 텍스트를 바 내부에 절대 위치로 표시 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white font-mono text-[8px] md:text-xs lg:text-sm font-bold tracking-wider">
                {Math.floor(stats.hp)} <span className="text-white text-[8px] md:text-xs lg:text-sm hidden sm:inline">/ {stats.maxHp}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 상단 우측: 자산 모니터링 */}
        <div className="flex flex-col items-end gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 md:gap-3 bg-zinc-900/80 backdrop-blur-md border border-yellow-500/20 px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg">
                <div className="flex items-center justify-center rounded-full bg-transparent w-4 h-4 md:w-6 md:h-7 relative">
                    <AtlasIcon name="gold" alt="Gold" size={24} />
                </div>
                <span className="text-yellow-400 font-mono text-sm md:text-xl lg:text-2xl font-black tracking-tight">
                    {stats.goldCoins.toLocaleString()}
                </span>
            </div>
        </div>
      </div>

      {/* --- 하단 섹션 --- */}
      <div className="flex justify-between items-end w-full">
        
        {/* 하단 좌측: 현재 장착 장비 정보 */}
        <div className="flex gap-4 items-end">
          <div className="hidden md:flex bg-zinc-900/60 backdrop-blur-md border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl items-center gap-3 md:gap-4 shadow-xl z-10 opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-800 rounded-lg md:rounded-xl flex items-center justify-center border border-white/10 relative">
                  {equippedDrill?.image ? (
                      <AtlasIcon name={equippedDrill.image} alt="Drill" size={40} className="object-contain p-1" />
                  ) : (
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-white/10 rounded-full" />
                  )}
              </div>
              <div className="flex flex-col">
                  <span className="text-white font-bold text-xs md:text-base lg:text-lg leading-tight">{equippedDrill?.name || 'Standard Drill'}</span>
                  <div className="font-mono text-[10px] md:text-sm lg:text-[18px] font-bold text-white/50">
                    X: {Math.floor(pos.x)} Y: {Math.floor(pos.y)}
                  </div>
              </div>
          </div>

          {/* 하단 좌측: 현재 장착 유물 (Artifact) */}
          {stats.equippedArtifactId && (
            <div className="hidden md:flex bg-zinc-900/60 backdrop-blur-md border border-purple-500/30 p-3 md:p-4 rounded-xl md:rounded-2xl items-center gap-3 md:gap-4 shadow-xl z-10 opacity-90 pointer-events-auto">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-800 rounded-lg md:rounded-xl flex items-center justify-center border border-purple-500/20 relative overflow-hidden group">
                {(() => {
                  const config = ARTIFACT_DATA[stats.equippedArtifactId!];
                  if (!config) return null;
                  const lastUsed = stats.artifactCooldowns[stats.equippedArtifactId!] || 0;
                  const elapsed = Date.now() - lastUsed;
                  const progress = Math.min(100, (elapsed / config.cooldownMs) * 100);
                  const isReady = progress >= 100;

                  return (
                    <>
                      <span className={`text-2xl md:text-3xl transition-transform ${isReady ? 'group-hover:scale-125' : 'grayscale'}`}>
                        {config.icon}
                      </span>
                      {!isReady && (
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-purple-600/40 transition-all duration-300"
                          style={{ height: `${100 - progress}%` }}
                        >
                          <div className="absolute top-0 left-0 w-full h-px bg-purple-400 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-[8px] font-black px-1 rounded-bl shadow-sm">Q</div>
                    </>
                  );
                })()}
              </div>
              <div className="flex flex-col">
                <span className="text-purple-400 font-bold text-[10px] md:text-xs tracking-tighter uppercase leading-tight">Artifact Active</span>
                <span className="text-white font-black text-xs md:text-base leading-tight">
                  {ARTIFACT_DATA[stats.equippedArtifactId!]?.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 하단 중앙: 퀵 액세스 네비게이션 메뉴 (정중앙 절대 위치) */}
        <div className="absolute left-1/2 bottom-2 md:bottom-6 lg:bottom-10 -translate-x-1/2 flex gap-1.5 md:gap-4 lg:gap-6 pointer-events-auto z-20">
            {navItems.map((item) => (
                <button
                    key={item.label}
                    onClick={item.onClick}
                    className="group relative flex flex-col items-center gap-1 md:gap-2 focus:outline-none focus:ring-4 focus:ring-white/70 rounded-2xl md:rounded-3xl p-1 shadow-2xl transition-all"
                >
                    <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 px-2 py-1 md:px-3 md:py-1.5 bg-zinc-900/95 text-white text-[10px] md:text-xs font-black rounded-md md:rounded-lg opacity-0 md:group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/20 shadow-2xl backdrop-blur-md">
                        {item.label}
                    </div>
                    <div 
                        className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 bg-zinc-900/90 backdrop-blur-3xl border border-white/20 rounded-lg md:rounded-2xl lg:rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:border-white/50 group-hover:bg-zinc-800/95 active:scale-90 relative overflow-hidden shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)]"
                    >
                        <div 
                            className="absolute inset-0 opacity-0 transition-opacity duration-300"
                            style={{ backgroundColor: item.color }}
                        />
                        
                        <div className="relative w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 z-10 transition-all duration-300 flex items-center justify-center">
                            {item.iconKey ? (
                                <AtlasIcon name={item.iconKey as any} alt={item.label} size={48} />
                            ) : item.src ? (
                                <Image 
                                    src={item.src} 
                                    alt={item.label} 
                                    fill 
                                    className="object-contain" 
                                    priority={item.label === 'Status'}
                                />
                            ) : (
                                <span className="text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">{item.icon}</span>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>

        {/* 하단 우측: 현재 월드 정보 */}
        <div className="hidden md:flex flex-col items-end gap-1 opacity-80">
            <span className="text-emerald-400 font-mono text-sm md:text-xl lg:text-3xl font-black tracking-widest uppercase">{config.name}</span>
        </div>
      </div>

    </div>
  );
});

export default Hud;
