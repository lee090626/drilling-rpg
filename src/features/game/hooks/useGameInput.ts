import { useEffect, useRef } from 'react';
import { GameWorld } from '@/entities/world/model';

const SHORTCUTS: Record<string, keyof GameWorld['ui']> = {
  'i': 'isInventoryOpen',
  'c': 'isStatusOpen',
  'b': 'isEncyclopediaOpen',
  'v': 'isElevatorOpen',
  'r': 'isLaboratoryOpen',
  'h': 'isGuideOpen',
  's': 'isSettingsOpen'
};

export function useGameInput(
  worldRef: React.MutableRefObject<GameWorld>,
  isAnyModalOpen: () => boolean,
  closeAllModals: () => void,
  handleOpen: (modal: keyof GameWorld['ui']) => void,
  handleClose: (modal: keyof GameWorld['ui']) => void,
  sendToWorker: (type: string, payload?: any) => void
) {
  // 입력 상태를 캐싱하여 React 리렌더링을 방지 (Ref 활용)
  const keyStateRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'escape') {
        if (isAnyModalOpen()) closeAllModals();
        else handleOpen('isSettingsOpen');
        return;
      }

      const target = SHORTCUTS[key];
      if (target) {
        if (isAnyModalOpen()) {
           if (worldRef.current.ui[target]) handleClose(target);
        } else {
           handleOpen(target);
        }
        return;
      }
      
      if (key === 'p') {
        sendToWorker('ACTION', { action: 'STRESS_TEST' });
        return;
      }

      if (isAnyModalOpen()) return;
      
      if (!keyStateRef.current[key]) {
        keyStateRef.current[key] = true;
        sendToWorker('INPUT', { keys: { [key]: true } });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyStateRef.current[key]) {
        keyStateRef.current[key] = false;
        sendToWorker('INPUT', { keys: { [key]: false } });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAnyModalOpen, closeAllModals, handleOpen, handleClose, sendToWorker, worldRef]);
}
