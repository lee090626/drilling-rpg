'use client';

import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onReset: () => void;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function Settings({
  onReset,
  onClose,
  onExport,
  onImport,
}: SettingsProps) {
  const [screenShake, setScreenShake] = useState(true);
  const [highPerformance, setHighPerformance] = useState(false);

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
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const saveSettings = (updates: any) => {
    const current = {
      screenShake,
      highPerformance,
      ...updates,
    };
    localStorage.setItem('drilling-game-settings', JSON.stringify(current));
  };

  const Toggle = ({ label, subLabel, active, onToggle }: any) => (
    <div
      onClick={onToggle}
      className={`flex justify-between items-center p-6 rounded-xl border transition-all duration-300 cursor-pointer group/toggle relative
        ${active 
          ? 'bg-[#eab308]/10 border-[#eab308]/40' 
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
    >
      <div className="flex flex-col gap-1 relative z-10">
        <span className={`text-base font-bold uppercase tracking-tight transition-colors duration-200 ${active ? 'text-white' : 'text-zinc-400 group-hover/toggle:text-zinc-200'}`}>
          {label}
        </span>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
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
      {/* Decorative vertical line (Side accent) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#eab308]/80" />

      {/* HEADER */}
      <div className="flex justify-between items-center px-10 py-8 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black tracking-tight text-[#eab308] uppercase">
            설정
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
          
          {/* GAMEPLAY SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-zinc-400">🎮</span>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                게임플레이 설정
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <Toggle
                label="화면 흔들림"
                subLabel="게임 내 카메라 진동 효과"
                active={screenShake}
                onToggle={() => {
                  setScreenShake(!screenShake);
                  saveSettings({ screenShake: !screenShake });
                }}
              />
              <Toggle
                label="고성능 모드"
                subLabel="최대 프레임 속도 제한 해제"
                active={highPerformance}
                onToggle={() => {
                  setHighPerformance(!highPerformance);
                  saveSettings({ highPerformance: !highPerformance });
                }}
              />
            </div>
          </div>

          {/* SYSTEM SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-zinc-400">⚙️</span>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                시스템 및 데이터
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* BACKUP GROUP */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                  데이터 백업
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onExport}
                    className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>📤</span> 세이브 복사
                  </button>
                  <button
                    onClick={onImport}
                    className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>📥</span> 세이브 로드
                  </button>
                </div>
              </div>

              {/* RESET GROUP */}
              <div className="bg-rose-950/10 border border-rose-900/30 p-6 rounded-2xl group/reset relative overflow-hidden">
                <div className="flex flex-col relative z-10">
                  <h4 className="text-sm font-bold text-rose-500 uppercase tracking-tight">
                    데이터 초기화
                  </h4>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1 mb-4 leading-relaxed">
                    모든 게임 진행 상황을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('모든 진행 상황을 삭제할까요? 이 작업은 되돌릴 수 없습니다.'))
                        onReset();
                    }}
                    className="w-full h-12 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-[0.98]"
                  >
                    데이터 삭제
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
