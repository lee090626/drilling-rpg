'use client';

import React from 'react';
import Joystick from './Joystick';

interface MobileControllerProps {
  onJoystickMove: (data: { x: number; y: number; active: boolean }) => void;
  onActionPress?: () => void;
}

/**
 * 모바일 화면 하단에 표시되는 가상 컨트롤러 레이아웃입니다.
 * 좌측 조이스틱과 우측 액션 버튼을 포함합니다.
 */
export default function MobileController({ onJoystickMove, onActionPress }: MobileControllerProps) {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none select-none touch-none">
      {/* 좌측 조이스틱 영역 */}
      <div className="absolute bottom-4 left-4 md:bottom-12 md:left-12 pointer-events-auto">
        <Joystick onMove={onJoystickMove} size={100} stickSize={45} />
      </div>

      {/* 우측 액션 버튼 영역 */}
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 pointer-events-auto flex flex-col gap-4">
        {onActionPress && (
          <button
            onTouchStart={(e) => {
              if (e.cancelable) e.preventDefault();
              onActionPress();
            }}
            className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-linear-to-br from-rose-500 to-rose-600 backdrop-blur-xl border border-rose-400/40 shadow-[0_0_30px_rgba(244,63,94,0.4)] flex items-center justify-center active:scale-95 transition-all group"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
            <span className="relative text-white font-black text-[10px] md:text-sm tracking-tighter uppercase">
              Action
            </span>
          </button>
        )}
      </div>

      {/* 상단 중앙 설명 (터치 힌트) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
        <span className="text-white text-[8px] font-bold tracking-[0.3em] uppercase">
          Joystick to move • Space if needed
        </span>
      </div>
    </div>
  );
}
