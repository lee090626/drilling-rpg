import { ToastType } from '@/shared/types/game';

/**
 * 워커 스레드에서 메인 스레드로 토스트 알림을 요청하는 유틸리티입니다.
 * 
 * @param message 표시할 메시지
 * @param type 알림 타입 ('success' | 'info' | 'warning' | 'error')
 * @param duration 표시 지속 시간 (ms)
 */
export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  if (typeof self !== 'undefined' && self.postMessage) {
    self.postMessage({
      type: 'SHOW_TOAST',
      payload: {
        message,
        type,
        duration
      }
    });
  }
};
