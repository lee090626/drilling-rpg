import { useCallback } from 'react';
import { GameWorld } from '@/entities/world/model';

/**
 * 게임의 UI 상태(모달 창의 열림/닫힘)를 관리하는 커스텀 훅입니다.
 * @param worldRef 게임 월드 상태 객체에 대한 Ref
 * @param updateUi UI 갱신을 트리거하는 콜백 함수
 */
export const useGameUI = (worldRef: React.MutableRefObject<GameWorld>, updateUi: () => void) => {
  /** 모든 모달 창을 닫습니다. */
  const closeAllModals = useCallback(() => {
    const { ui } = worldRef.current;
    ui.isShopOpen =
      ui.isInventoryOpen =
      ui.isSettingsOpen =
      ui.isCraftingOpen =
      ui.isElevatorOpen =
      ui.isStatusOpen =
      ui.isEncyclopediaOpen =
      ui.isLaboratoryOpen =
      ui.isRefineryOpen =
      ui.isGuideOpen =
        false;
    updateUi();
  }, [worldRef, updateUi]);

  /**
   * 특정 모달의 상태를 반전(토글)시킵니다.
   * @param target 토글할 UI 상태 키
   */
  const toggleModal = useCallback(
    (target: keyof GameWorld['ui']) => {
      const { ui } = worldRef.current;
      const current = ui[target];

      // (선택 사항) 새로운 창을 열 때 다른 창을 모두 닫는 로직을 추가할 수 있습니다.
      // closeAllModals();

      (ui as any)[target] = !current;
      updateUi();
    },
    [worldRef, updateUi],
  );

  /** 특정 모달을 닫습니다. */
  const handleClose = useCallback(
    (target: keyof GameWorld['ui']) => {
      (worldRef.current.ui as any)[target] = false;
      updateUi();
    },
    [worldRef, updateUi],
  );

  /** 특정 모달을 엽니다. */
  const handleOpen = useCallback(
    (target: keyof GameWorld['ui']) => {
      (worldRef.current.ui as any)[target] = true;
      updateUi();
    },
    [worldRef, updateUi],
  );

  /** 현재 열려 있는 모달이 하나라도 있는지 확인합니다. */
  const isAnyModalOpen = useCallback(() => {
    const { ui } = worldRef.current;
    return (
      ui.isShopOpen ||
      ui.isInventoryOpen ||
      ui.isSettingsOpen ||
      ui.isCraftingOpen ||
      ui.isElevatorOpen ||
      ui.isStatusOpen ||
      ui.isEncyclopediaOpen ||
      ui.isLaboratoryOpen ||
      ui.isRefineryOpen ||
      ui.isGuideOpen
    );
  }, [worldRef]);

  return {
    closeAllModals,
    toggleModal,
    handleClose,
    handleOpen,
    isAnyModalOpen,
  };
};
