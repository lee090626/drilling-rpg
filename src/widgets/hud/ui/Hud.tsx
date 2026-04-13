import React, { useMemo } from 'react';
import { getCircleConfig, getLayerFromDepth } from '@/shared/config/circleData';
import { PlayerStats } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';

import { HpBar } from './components/HpBar';
import { GoldDisplay } from './components/GoldDisplay';
import { QuickNav } from './components/QuickNav';
import { EquipmentInfo } from './components/EquipmentInfo';
import { WorldInfo } from './components/WorldInfo';

interface HudProps {
  stats: PlayerStats;
  pos: { x: number; y: number };
  onOpenStatus?: () => void;
  onOpenInventory?: () => void;
  onOpenEncyclopedia?: () => void;
  onOpenElevator?: () => void;
  onOpenSettings?: () => void;
  onOpenGuide?: () => void;
  onOpenAltar?: () => void;
}

/**
 * 게임 메인 화면의 오버레이 UI(체력, 깊이, 퀵 메뉴 등)를 표시하는 컴포넌트입니다.
 * 하위 컴포넌트들로 구성된 레이아웃 매니저 역할을 합니다.
 */
const Hud: React.FC<HudProps> = React.memo(
  ({
    stats,
    pos,
    onOpenStatus,
    onOpenInventory,
    onOpenEncyclopedia,
    onOpenElevator,
    onOpenSettings,
    onOpenGuide,
    onOpenAltar,
  }) => {
    const config = getCircleConfig(stats.depth);
    const layerIdx = getLayerFromDepth(stats.depth, config);

    // 장착된 장비 객체들 도출 (안전한 접근)
    const equipped = useMemo(() => {
      const eq = (stats as any).equipment;
      return {
        drill: eq?.drillId ? (EQUIPMENTS as any)[eq.drillId] : null,
        helmet: eq?.helmetId ? (EQUIPMENTS as any)[eq.helmetId] : null,
        armor: eq?.armorId ? (EQUIPMENTS as any)[eq.armorId] : null,
        boots: eq?.bootsId ? (EQUIPMENTS as any)[eq.bootsId] : null,
      };
    }, [stats]);

    const layerName = useMemo(() => {
      switch (layerIdx) {
        case 1:
          return 'Upper';
        case 2:
          return 'Middle';
        case 3:
          return 'Lower';
        case 4:
          return 'Deepest';
        default:
          return '';
      }
    }, [layerIdx]);

    const navItems = useMemo(
      () => [
        {
          label: 'Status',
          key: 'C',
          iconKey: 'StatusIcon' as const,
          onClick: onOpenStatus,
          color: '#eab308',
        },
        {
          label: 'Inventory',
          key: 'I',
          iconKey: 'InventoryIcon' as const,
          onClick: onOpenInventory,
          color: '#f59e0b',
        },
        {
          label: 'Book',
          key: 'B',
          iconKey: 'BookIcon' as const,
          onClick: onOpenEncyclopedia,
          color: '#a855f7',
        },
        { label: 'Altar', key: 'A', icon: '🔥', onClick: onOpenAltar, color: '#f97316' },
        {
          label: 'Setting',
          key: 'S',
          iconKey: 'SettingsIcon' as const,
          onClick: onOpenSettings,
          color: '#94a3b8',
        },
        { label: 'Guide', key: 'H', icon: '❓', onClick: onOpenGuide, color: '#22d3ee' },
      ],
      [onOpenStatus, onOpenInventory, onOpenEncyclopedia, onOpenSettings, onOpenGuide, onOpenAltar],
    );

    return (
      <div className="absolute top-0 left-0 w-full h-full p-4 md:p-8 pointer-events-none select-none flex flex-col justify-between overflow-hidden">
        {/* 상단 섹션: 생존 상태 및 자산 */}
        <div className="flex justify-between items-start w-full">
          <HpBar hp={stats.hp} maxHp={stats.maxHp} />
          <GoldDisplay gold={stats.goldCoins} />
        </div>

        {/* 하단 섹션: 장비, 네비게이션, 월드 정보 */}
        <div className="flex justify-between items-end w-full relative">
          <div className="flex gap-4 items-end">
            <EquipmentInfo
              drill={equipped.drill}
              helmet={equipped.helmet}
              armor={equipped.armor}
              boots={equipped.boots}
              pos={pos}
            />
          </div>

          <QuickNav items={navItems} />
          <WorldInfo depth={stats.depth as any} layerName={layerName} onOpenElevator={onOpenElevator} />
        </div>
      </div>
    );
  },
);

export default Hud;
