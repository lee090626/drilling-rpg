'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/shared/lib/store';

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
}: SettingsProps) {
  const { screenShake, highPerformance } = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // 로컬 스토리지에서 처음 설정 로드 (Store 초기화)
  useEffect(() => {
    const saved = localStorage.getItem('drilling-game-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        updateSettings(parsed);
      } catch (e) {
        console.error('설정을 불러오는데 실패했습니다.', e);
      }
    }
  }, [updateSettings]);

  /**
   * 변경된 설정을 저장하고 스토어를 업데이트합니다.
   */
  const saveAndSync = (updates: Partial<GameSettings>) => {
    updateSettings(updates);
    const current = { screenShake, highPerformance, ...updates };
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
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      tabIndex={0}
      className={`flex justify-between items-center p-6 rounded-xl border transition-all duration-300 cursor-pointer group/toggle relative focus:outline-none focus:ring-2 focus:ring-amber-400/50
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
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">⚙️</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-400 leading-none">
                Settings
              </h2>
              <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase mt-1">System Configuration</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-100 hover:text-black hover:border-zinc-100 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
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
                  saveAndSync({ screenShake: !screenShake });
                }}
              />
              <Toggle
                label="High Performance"
                subLabel="Unlock maximum frame rate"
                active={highPerformance}
                onToggle={() => {
                  saveAndSync({ highPerformance: !highPerformance });
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
                    className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
                  >
                    <span>📤</span> Export Save
                  </button>
                  <button
                    onClick={onImport}
                    className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
                  >
                    <span>📥</span> Import Save
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
                    className="w-full h-12 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-500 text-[10px] font-bold tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
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
