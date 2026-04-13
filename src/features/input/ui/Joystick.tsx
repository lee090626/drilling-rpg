'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface JoystickProps {
  size?: number;
  stickSize?: number;
  onMove: (data: { x: number; y: number; active: boolean }) => void;
}

/**
 * 모바일 화면에서 사용자의 터치 입력을 받아 방향 데이터를 생성하는 가상 조이스틱 컴포넌트입니다.
 */
export default function Joystick({ size = 150, stickSize = 60, onMove }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  // 조이스틱 중심 좌표 (컨테이너 기준)
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size - stickSize) / 2;

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const touchX = clientX - rect.left;
      const touchY = clientY - rect.top;

      // 중심으로부터의 거리 계산
      const dx = touchX - centerX;
      const dy = touchY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 최대 반경 내로 제한
      const limitedDistance = Math.min(distance, maxRadius);
      const angle = Math.atan2(dy, dx);

      const newX = Math.cos(angle) * limitedDistance;
      const newY = Math.sin(angle) * limitedDistance;

      setStickPos({ x: newX, y: newY });

      // 정규화된 값 (-1 ~ 1) 전달
      onMove({
        x: limitedDistance > 0 ? newX / maxRadius : 0,
        y: limitedDistance > 0 ? newY / maxRadius : 0,
        active: true,
      });
    },
    [centerX, centerY, maxRadius, onMove],
  );

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    setIsActive(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleMove(clientX, clientY);
  };

  const handleEnd = useCallback(() => {
    setIsActive(false);
    setStickPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0, active: false });
  }, [onMove]);

  useEffect(() => {
    if (!isActive) return;

    const onGlobalMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      handleMove(clientX, clientY);
    };

    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('touchmove', onGlobalMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', onGlobalMove);
      window.removeEventListener('touchmove', onGlobalMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isActive, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl touch-none select-none"
      style={{ width: size, height: size }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      {/* 가이드 라인 (옵션) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-px h-full bg-white/30" />
        <div className="h-px w-full bg-white/30 absolute" />
      </div>

      {/* 조이스틱 핸들 */}
      <div
        className={`absolute rounded-full transition-transform duration-75 shadow-lg flex items-center justify-center
          ${isActive ? 'bg-amber-400 scale-110 shadow-amber-400/50' : 'bg-white/80 scale-100 shadow-white/20'}`}
        style={{
          width: stickSize,
          height: stickSize,
          left: centerX - stickSize / 2,
          top: centerY - stickSize / 2,
          transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
        }}
      >
        <div className="w-1/3 h-1/3 rounded-full bg-black/20" />
      </div>
    </div>
  );
}
