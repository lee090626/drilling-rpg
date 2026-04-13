import { create } from 'zustand';
import { PlayerStats } from '../types/game';

/**
 * 게임의 UI 상태 및 저빈도 데이터를 관리하는 Zustand 스토어입니다.
 * 고성능 물리/랜더링 데이터는 워커에서 관리하며, 
 * UI 표시에 필요한 통계 데이터만 이 스토어를 통해 동기화됩니다.
 */
interface GameState {
  /** 플레이어 통계 및 진행 상태 */
  stats: PlayerStats | null;
  /** 게임 설정 (화면 흔들림 등) */
  settings: {
    screenShake: boolean;
    highPerformance: boolean;
  };
  /** 토스트 알림 큐 */
  toasts: import('../types/game').ToastMessage[];
  /** UI 상태 (상호작용 안내 등) */
  ui: {
    showInteractionPrompt: boolean;
    activeInteractionType: string | null;
  };
  /** 보스 전투 상태 */
  boss: {
    active: boolean;
    id: string | null;
    name: string | null;
    hp: number;
    maxHp: number;
    phase: number;
  } | null;
  /** 통계 데이터 업데이트 */
  updateStats: (stats: Partial<PlayerStats>) => void;
  /** UI 상태 업데이트 */
  updateUI: (ui: Partial<GameState['ui']>) => void;
  /** 설정 업데이트 */
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  /** 보스 상태 업데이트 */
  updateBoss: (boss: Partial<GameState['boss']> | null) => void;
  /** 초기 데이터 설정 */
  setStats: (stats: import('../types/game').PlayerStats) => void;
  /** 토스트 추가 */
  addToast: (message: string, type: import('../types/game').ToastType, duration?: number) => void;
  /** 토스트 제거 */
  removeToast: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  stats: null,
  settings: {
    screenShake: true,
    highPerformance: false,
  },
  ui: {
    showInteractionPrompt: false,
    activeInteractionType: null,
  },
  boss: null,
  
  updateStats: (newStats) => set((state) => ({
    stats: state.stats ? { ...state.stats, ...newStats } : (newStats as PlayerStats),
  })),

  updateUI: (newUi) => set((state) => ({
    ui: { ...state.ui, ...newUi }
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  updateBoss: (newBoss) => set((state) => ({
    boss: newBoss === null ? null : (state.boss ? { ...state.boss, ...newBoss } : (newBoss as any))
  })),

  setStats: (stats) => set({ stats }),
  
  toasts: [],
  addToast: (message, type, duration = 3000) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type, duration };
    return { toasts: [...state.toasts, newToast] };
  }),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));

/**
 * UI 업데이트를 위한 Throttling 도우미 (선택 사항)
 * 워커에서 이미 Throttling을 처리하여 보내는 것을 원칙으로 하지만,
 * 메인 스레드에서의 추가적인 제어가 필요할 때 사용할 수 있습니다.
 */
export const syncUiState = (payload: Partial<PlayerStats>) => {
  useGameStore.getState().updateStats(payload);
};
