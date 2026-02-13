'use client';

import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onReset: () => void;
}

export default function Settings({ onReset }: SettingsProps) {
  // Local state for settings, synced with localStorage
  const [masterVolume, setMasterVolume] = useState(80);
  const [bgmVolume, setBgmVolume] = useState(60);
  const [sfxVolume, setSfxVolume] = useState(70);
  const [screenShake, setScreenShake] = useState(true);
  const [highPerformance, setHighPerformance] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('drilling-game-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.masterVolume !== undefined)
          setMasterVolume(parsed.masterVolume);
        if (parsed.bgmVolume !== undefined) setBgmVolume(parsed.bgmVolume);
        if (parsed.sfxVolume !== undefined) setSfxVolume(parsed.sfxVolume);
        if (parsed.screenShake !== undefined)
          setScreenShake(parsed.screenShake);
        if (parsed.highPerformance !== undefined)
          setHighPerformance(parsed.highPerformance);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  // Save settings on change
  const saveSettings = (updates: any) => {
    const current = {
      masterVolume,
      bgmVolume,
      sfxVolume,
      screenShake,
      highPerformance,
      ...updates,
    };
    localStorage.setItem('drilling-game-settings', JSON.stringify(current));
  };

  const handleVolumeChange = (type: string, value: number) => {
    if (type === 'master') {
      setMasterVolume(value);
      saveSettings({ masterVolume: value });
    } else if (type === 'bgm') {
      setBgmVolume(value);
      saveSettings({ bgmVolume: value });
    } else if (type === 'sfx') {
      setSfxVolume(value);
      saveSettings({ sfxVolume: value });
    }
  };

  const Slider = ({ label, value, min = 0, max = 100, onChange }: any) => (
    <div className="flex flex-col gap-3 group/slider">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover/slider:text-blue-400 transition-colors">
          {label}
        </span>
        <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {value}%
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
        />
      </div>
    </div>
  );

  const Toggle = ({
    label,
    subLabel,
    active,
    onToggle,
    color = 'blue',
  }: any) => (
    <div
      onClick={onToggle}
      className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all cursor-pointer group/toggle"
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-200 group-hover/toggle:text-white transition-colors">
          {label}
        </span>
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
          {subLabel}
        </span>
      </div>
      <div
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? `bg-${color}-500/20 border border-${color}-500/30` : 'bg-gray-800 border border-white/5'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${active ? `translate-x-7 bg-${color}-500 shadow-[0_0_10px_${color}-500]` : 'translate-x-1 bg-gray-600'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-4 text-white animate-modal w-full max-w-4xl mx-auto">
      {/* Active Controls - Centralized */}
      <div className="flex flex-col gap-8 w-full">
        {/* Audio Control Module */}
        <div className="bg-gray-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-6xl">🔊</span>
          </div>
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
            <span className="w-8 h-px bg-blue-500/50" />
            Audio Frequencies
          </h3>

          <div className="space-y-8">
            <Slider
              label="Master Output"
              value={masterVolume}
              onChange={(v: number) => handleVolumeChange('master', v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <Slider
                label="Background Feed"
                value={bgmVolume}
                onChange={(v: number) => handleVolumeChange('bgm', v)}
              />
              <Slider
                label="Signal FX"
                value={sfxVolume}
                onChange={(v: number) => handleVolumeChange('sfx', v)}
              />
            </div>
          </div>
        </div>

        {/* System Calibration Module */}
        <div className="bg-gray-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
          <h3 className="text-xs font-black text-purple-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
            <span className="w-8 h-px bg-purple-500/50" />
            System Calibration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              label="Visual Stability"
              subLabel="Screen Shake Effects"
              active={screenShake}
              onToggle={() => {
                setScreenShake(!screenShake);
                saveSettings({ screenShake: !screenShake });
              }}
              color="blue"
            />
            <Toggle
              label="Turbo Engine"
              subLabel="High Performance Mode"
              active={highPerformance}
              onToggle={() => {
                setHighPerformance(!highPerformance);
                saveSettings({ highPerformance: !highPerformance });
              }}
              color="purple"
            />
          </div>
        </div>

        {/* Danger Zone: Data Purge */}
        <div className="relative overflow-hidden bg-red-950/10 border border-red-500/10 p-10 rounded-[2.5rem] group hover:border-red-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-red-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="flex items-center gap-8 mb-8 relative z-10">
            <div className="w-20 h-20 bg-red-500/5 rounded-2xl flex items-center justify-center border border-red-500/10 group-hover:border-red-500/30 transition-all shadow-inner">
              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-500">
                ☢️
              </span>
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.5em] mb-2 group-hover:text-red-500 transition-colors">
                Terminal Protocol
              </div>
              <h4 className="text-3xl font-black text-white italic tracking-tighter">
                HARD RESET
              </h4>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-bold mb-10 leading-relaxed relative z-10 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
            Critical Failure Risk: Executing this protocol will permanently
            terminate all session data, equipment upgrades, and resource
            manifests. Data retrieval is impossible post-execution.
          </p>

          <button
            onClick={() => {
              if (
                confirm(
                  'SYSTEM ALERT: Permantly erase all progress results? This terminal action is final.',
                )
              ) {
                onReset();
              }
            }}
            className="relative z-10 w-full py-6 rounded-2xl bg-red-600/5 border border-red-500/20 text-red-500/60 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-[0.98] shadow-2xl"
          >
            Initiate System Purge
          </button>
        </div>
      </div>
    </div>
  );
}
