import { useEffect, useRef, useCallback, useState } from 'react';
import { saveManager } from '@/shared/lib/saveManager';
import { useGameStore } from '@/shared/lib/store';

let globalWorker: Worker | null = null;

export function useGameWorker(
  isClient: boolean,
  snapshots: React.MutableRefObject<{ time: number, data: Float32Array }[]>,
  setIsEngineReady: (ready: boolean) => void,
  isReadyRef: React.MutableRefObject<boolean>,
  loadAssetsAndTransfer: (sendToWorker: (type: string, payload?: any, transfer?: Transferable[]) => void) => void,
  handleTravelDimension: (targetDepth: number) => void,
  handleOpenModal: (target: any) => void
) {
  const workerRef = useRef<Worker | null>(null);

  const sendToWorker = useCallback((type: string, payload?: any, transfer?: Transferable[]) => {
    if (globalWorker) {
      globalWorker.postMessage({ type, payload }, transfer || []);
    }
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    if (!globalWorker) {
      globalWorker = new Worker(new URL('../worker/game.worker.ts', import.meta.url));
      console.log('[Main] Worker Singleton Created.');
    }
    workerRef.current = globalWorker;

    const worker = globalWorker;
    const onMessage = (e: MessageEvent) => {
      const { type, payload, buffer } = e.data;
      
      if (type === 'RENDER_SYNC' && buffer) {
        const view = new Float32Array(buffer);
        const timestamp = view[1];
        
        snapshots.current.push({ time: timestamp, data: view });
        if (snapshots.current.length > 2) {
          const old = snapshots.current.shift();
          if (old) {
            worker.postMessage({ type: 'RETURN_BUFFER', payload: { buffer: old.data.buffer } }, [old.data.buffer]);
          }
        }

        if (!isReadyRef.current) {
          setIsEngineReady(true);
        }
      } else if (type === 'SYNC_UI' && payload) {
        // Zustand Update
        if (payload.stats) useGameStore.getState().updateStats(payload.stats);
        if (payload.ui) useGameStore.getState().updateUI(payload.ui);
        if (payload.boss) useGameStore.getState().updateBoss(payload.boss);
        else if (payload.boss === null) useGameStore.getState().updateBoss(null);
      } else if (type === 'ENGINE_READY') {
        setIsEngineReady(true);
        console.log('[Main] Engine is ready to render!');
      } else if (type === 'SAVE') {
        saveManager.save(payload);
      } else if (type === 'EXPORT_DATA') {
        const exported = saveManager.export(payload);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(exported);
          alert('Save code copied to clipboard!');
        }
      } else if (type === 'PORTAL_TRIGGERED') {
        if (confirm(`Circle ${payload.nextCircleId}로 하강하시겠습니까?\n새로운 심연 탐험이 시작됩니다!`)) {
          handleTravelDimension(payload.nextDepth);
        }
      } else if (type === 'DIMENSION_TRAVEL_COMPLETE') {
        alert(`원하는 Circle에 도착했습니다!`);
      } else if (type === 'TUTORIAL_TRIGGER') {
        // 워커로부터 튜토리얼 발생 신호를 받으면 가이드 창을 엶
        handleOpenModal('isGuideOpen');
      } else if (type === 'OPEN_MODAL' && payload) {
        // 워커에서 상호작용 성공 시 모달 오픈 신호를 보냄
        handleOpenModal(payload.target);
      } else if (type === 'SHOW_TOAST' && payload) {
        // 워커로부터 토스트 알림 요청을 받음
        useGameStore.getState().addToast(payload.message, payload.type, payload.duration);
      }
    };

    worker.addEventListener('message', onMessage);

    const saved = saveManager.load();
    console.log('[Main] Sending INIT to worker...');
    worker.postMessage({ 
      type: 'INIT', 
      payload: { seed: saved?.stats.mapSeed || 12345, saveData: saved } 
    });

    loadAssetsAndTransfer(sendToWorker);

    const timeoutId = setTimeout(() => {
      if (!isReadyRef.current) {
        console.warn('[Main] Engine initialization timeout (5s). Forcing start...');
        setIsEngineReady(true);
      }
    }, 5000);

    return () => {
      // NOTE: 페이지 이동(Unmount) 시 완전한 Worker 종료를 통한 메모리 누수 방지
      worker.removeEventListener('message', onMessage);
      worker.terminate();
      globalWorker = null; // 다음 Mount 시 새 Worker가 생성되도록 초기화
      clearTimeout(timeoutId);
    };
  }, [isClient, loadAssetsAndTransfer, sendToWorker, handleTravelDimension, handleOpenModal]);

  return { sendToWorker, globalWorker };
}
