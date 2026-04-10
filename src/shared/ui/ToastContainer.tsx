'use client';

import React from 'react';
import { useGameStore } from '@/shared/lib/store';
import Toast from './Toast';

/**
 * 게임 화면 우측 상단(골드 표시 아래)에 토스트 알림을 렌더링하는 컨테이너입니다.
 */
const ToastContainer: React.FC = () => {
  const toasts = useGameStore((state) => state.toasts);
  const removeToast = useGameStore((state) => state.removeToast);

  return (
    <div className="absolute top-24 right-4 md:right-8 flex flex-col items-end gap-3 z-50 pointer-events-none max-w-[320px] md:max-w-[400px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
