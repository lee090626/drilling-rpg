import React from 'react';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { EquipmentPart } from '@/shared/types/game';

interface EquipmentCardProps {
  equipmentId: string;
  isEquipped: boolean;
  onEquip?: (id: string, part: EquipmentPart) => void;
}

/**
 * 인벤토리 장비 탭에서 개별 장비(드릴, 투구, 갑옷, 신발)를 표시하는 카드 컴포넌트입니다.
 */
function EquipmentCard({ equipmentId, isEquipped, onEquip }: EquipmentCardProps) {
  const equipment = EQUIPMENTS[equipmentId];
  if (!equipment) return null;

  const partLabels: Record<string, string> = {
    drill: 'Weapon (Drill)',
    helmet: 'Head (Helmet)',
    armor: 'Body (Armor)',
    boots: 'Legs (Boots)',
  };

  return (
    <div
      className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex flex-col group relative overflow-hidden ${
        isEquipped
          ? 'bg-[#252526] border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
          : 'bg-[#252526] border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-4 md:gap-6 mb-6 text-left">
        <div className="w-20 h-20 md:w-28 md:h-28 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 shadow-inner overflow-hidden">
          <span className="text-4xl md:text-6xl drop-shadow-lg">{equipment.icon}</span>
        </div>
        <div>
          <div
            className={`text-[10px] font-bold mb-1 tracking-widest uppercase ${isEquipped ? 'text-cyan-400' : 'text-zinc-500'}`}
          >
            {isEquipped ? 'Currently Equipped' : 'Inventory'} • {partLabels[equipment.part]}
          </div>
          <h4 className="text-xl md:text-2xl font-black text-white tracking-tighter">
            {equipment.name}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {equipment.part === 'drill' && (
          <StatBox label="POWER" value={equipment.stats.power || 0} color="text-rose-400" />
        )}
        {equipment.part === 'helmet' && (
          <StatBox label="DEFENSE" value={equipment.stats.defense || 0} color="text-blue-400" />
        )}
        {equipment.part === 'armor' && (
          <StatBox label="MAX HP" value={equipment.stats.maxHp || 0} color="text-emerald-400" />
        )}
        {equipment.part === 'boots' && (
          <>
            <StatBox label="SPEED" value={equipment.stats.moveSpeed || 0} color="text-amber-400" />
            <div className="grid grid-cols-2 gap-1 col-span-1">
              <StatBox label="DEF" value={equipment.stats.defense || 0} color="text-blue-400" isSmall />
              <StatBox label="HP" value={equipment.stats.maxHp || 0} color="text-emerald-400" isSmall />
            </div>
          </>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        {!isEquipped ? (
          <button
            onClick={() => onEquip?.(equipmentId, equipment.part)}
            className="w-full py-3 md:py-4 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-sm md:text-base tracking-widest rounded-xl shadow-xl active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            EQUIP ITEM
          </button>
        ) : (
          <div className="w-full py-3 md:py-4 border border-cyan-400/30 text-cyan-400/60 text-center font-black text-xs md:text-sm tracking-widest rounded-xl">
            EQUIPPED
          </div>
        )}
      </div>
    </div>
  );
}

const StatBox = ({ label, value, color, isSmall = false }: { label: string; value: string | number; color: string; isSmall?: boolean }) => (
  <div className={`bg-zinc-950/50 p-2 md:p-3 rounded-xl border border-zinc-900 shadow-inner flex flex-col items-center justify-center ${isSmall ? 'py-1' : ''}`}>
    <div className={`text-zinc-500 font-bold mb-0.5 tracking-tighter truncate w-full text-center ${isSmall ? 'text-[8px]' : 'text-[10px]'}`}>
      {label}
    </div>
    <div className={`font-black tabular-nums transition-colors ${color} ${isSmall ? 'text-xs' : 'text-base md:text-lg'}`}>
      {typeof value === 'number' && value > 0 ? `+${value}` : value}
    </div>
  </div>
);

export default React.memo(EquipmentCard);
