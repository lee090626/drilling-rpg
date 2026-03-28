'use client';

import React, { useState, useEffect } from 'react';

/**
 * 설정 컴포넌트의 Props 인터페이스입니다.
 */
interface SettingsProps {
  /** 데이터 초기화 함수 */
  onReset: () => void;
  /** 설정 창 닫기 함수 */
  onClose: () => void;
  /** 세이브 데이터 내보내기 함수 */
  onExport: () => void;
  /** 세이브 데이터 가져오기 함수 */
  onImport: () => void;
  /** 맵 재생성 함수 */
  onRegenerateWorld: () => void;
}

/**
 * 게임 환경 설정 데이터 구조입니다.
 */
interface GameSettings {
  /** 화면 흔들림 효과 활성화 여부 */
  screenShake: boolean;
  /** 고성능 모드(프레임 제한 해제 등) 활성화 여부 */
  highPerformance: boolean;
}

/**
 * 게임의 각종 환경 설정을 관리하고 표시하는 모달 컴포넌트입니다.
 */
export default function Settings({
  onReset,
  onClose,
  onExport,
  onImport,
  onRegenerateWorld,
}: SettingsProps) {
  const [screenShake, setScreenShake] = useState(true);
  const [highPerformance, setHighPerformance] = useState(false);

  // 로컬 스토리지에서 저장된 설정 로드
  useEffect(() => {
    const saved = localStorage.getItem('drilling-game-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.screenShake !== undefined)
          setScreenShake(parsed.screenShake);
        if (parsed.highPerformance !== undefined)
          setHighPerformance(parsed.highPerformance);
      } catch (e) {
        console.error('설정을 불러오는데 실패했습니다.', e);
      }
    }
  }, []);

  /**
   * 변경된 설정을 로컬 스토리지에 저장합니다.
   */
  const saveSettings = (updates: Partial<GameSettings>) => {
    const current: GameSettings = {
      screenShake,
      highPerformance,
      ...updates,
    };
    localStorage.setItem('drilling-game-settings', JSON.stringify(current));
  };

  /**
   * 개별 설정 항목을 토글하는 스위치 컴포넌트입니다 (내부용).
   */
  const Toggle = ({ 
    label, 
    subLabel, 
    active, 
    onToggle 
  }: { 
    label: string; 
    subLabel: string; 
    active: boolean; 
    onToggle: () => void; 
  }) => (
    <div
      onClick={onToggle}
      className={`flex justify-between items-center p-6 rounded-xl border transition-all duration-300 cursor-pointer group/toggle relative
        ${active 
          ? 'bg-[#eab308]/10 border-[#eab308]/40' 
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
    >
      <div className="flex flex-col gap-1 relative z-10">
        <span className={`text-base font-bold tracking-tight transition-colors duration-200 ${active ? 'text-white' : 'text-zinc-400 group-hover/toggle:text-zinc-200'}`}>
          {label}
        </span>
        <span className="text-[10px] text-zinc-600 font-bold tracking-widest">
          {subLabel}
        </span>
      </div>

      <div className={`w-14 h-7 rounded-full relative transition-all duration-300 p-1 flex items-center
        ${active ? 'bg-[#eab308]' : 'bg-zinc-800 border border-zinc-700'}`}
      >
        <div
          className={`w-5 h-5 rounded-full transition-transform duration-300
            ${active 
              ? 'translate-x-7 bg-zinc-950' 
              : 'translate-x-0 bg-zinc-500'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full text-[#d1d5db] font-sans bg-[#121213] border border-zinc-800 rounded-3xl relative overflow-hidden">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center px-10 py-8 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black tracking-tight text-[#eab308]">
            Settings
          </h2>
          <div className="h-1 w-8 bg-[#eab308] mt-1 rounded-full" />
        </div>
        
        <button
          onClick={onClose}
          className="group/close w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all duration-200 active:scale-90"
        >
          <span className="text-lg font-bold">✕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-10 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 게임플레이 설정 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-zinc-400">🎮</span>
              <h3 className="text-[10px] font-bold text-zinc-500 tracking-[0.2em]">
                Gameplay Settings
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <Toggle
                label="Screen Shake"
                subLabel="In-game camera vibration effects"
                active={screenShake}
                onToggle={() => {
                  setScreenShake(!screenShake);
                  saveSettings({ screenShake: !screenShake });
                }}
              />
              <Toggle
                label="High Performance"
                subLabel="Unlock maximum frame rate"
                active={highPerformance}
                onToggle={() => {
                  setHighPerformance(!highPerformance);
                  saveSettings({ highPerformance: !highPerformance });
                }}
              />
            </div>
          </div>

          {/* 시스템 및 데이터 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-zinc-400">⚙️</span>
              <h3 className="text-[10px] font-bold text-zinc-500 tracking-[0.2em]">
                System & Data
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* 백업 그룹 */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h4 className="text-[10px] font-bold text-zinc-400 tracking-widest mb-4">
                  Data Backup
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onExport}
                    className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>📤</span> Export Save
                  </button>
                  <button
                    onClick={onImport}
                    className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>📥</span> Import Save
                  </button>
                </div>
              </div>

              {/* 맵 재생성 그룹 */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 p-6 rounded-2xl group/regen relative overflow-hidden">
                <div className="flex flex-col relative z-10">
                  <h4 className="text-sm font-bold text-emerald-500">
                    World Regeneration
                  </h4>
                  <p className="text-[9px] text-zinc-600 font-bold tracking-widest mt-1 mb-4 leading-relaxed">
                    Regenerates the underground map with a new seed. Your inventory and stats will be preserved.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Regenerate world? You will be moved to the surface. Progress will be saved.'))
                        onRegenerateWorld();
                    }}
                    className="w-full h-12 rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-500 text-[10px] font-bold tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all active:scale-[0.98]"
                  >
                    Regenerate Map
                  </button>
                </div>
              </div>

              {/* 초기화 그룹 */}
              <div className="bg-rose-950/10 border border-rose-900/30 p-6 rounded-2xl group/reset relative overflow-hidden">
                <div className="flex flex-col relative z-10">
                  <h4 className="text-sm font-bold text-rose-500">
                    Data Reset
                  </h4>
                  <p className="text-[9px] text-zinc-600 font-bold tracking-widest mt-1 mb-4 leading-relaxed">
                    Permanently deletes all game progress. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Delete all progress? This action cannot be undone.'))
                        onReset();
                    }}
                    className="w-full h-12 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-500 text-[10px] font-bold tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-[0.98]"
                  >
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
