import React from 'react';
import { DRONES } from '@/shared/config/droneData';

interface DroneCardProps {
  droneId: string;
  isEquipped: boolean;
  onEquip?: (id: string, type: 'drill' | 'drone') => void;
}

/**
 * 인벤토리 장비 탭에서 개별 드론을 표시하는 카드 컴포넌트입니다.
 */
function DroneCard({ droneId, isEquipped, onEquip }: DroneCardProps) {
  const drone = DRONES[droneId];
  if (!drone) return null;

  return (
    <div
      className={`p-4 md:p-8 rounded-2xl md:rounded-4xl border-2 transition-all flex flex-col group relative overflow-hidden ${
        isEquipped
          ? 'bg-[#252526] border-[#eab308] shadow-2xl'
          : 'bg-[#252526] border-zinc-800 opacity-60 hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-6 mb-8 text-left">
        <div className="w-20 h-20 bg-zinc-950 rounded-2xl flex items-center justify-center text-5xl border border-zinc-900 shadow-inner overflow-hidden">
          {drone.icon}
        </div>
        <div>
          <div
            className={`text-xs font-bold mb-2 tracking-widest ${isEquipped ? 'text-[#eab308]' : 'text-zinc-600'}`}
          >
            {isEquipped ? 'Equipped' : 'Storage'} • DRONE
          </div>
          <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            {drone.name}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-950 p-4 rounded-xl text-center border border-zinc-900 shadow-inner">
          <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest uppercase">Mineral Assist</div>
          <div className="text-sm md:text-xl font-black text-white">{drone.basePower}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-xl text-center border border-zinc-900 shadow-inner">
          <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest uppercase">SPEED</div>
          <div className="text-sm md:text-xl font-black text-white">{drone.cooldownMs}ms</div>
        </div>
        {drone.specialEffect && (
          <div className="bg-zinc-950 p-4 rounded-xl text-center border border-zinc-900 shadow-inner">
            <div className="text-[10px] md:text-xs text-zinc-500 font-bold mb-1 tracking-widest uppercase">EFFECT</div>
            <div className="text-sm md:text-xl font-black text-emerald-400 capitalize">{drone.specialEffect}</div>
          </div>
        )}
      </div>

      <div className="mt-auto">
        {!isEquipped && (
          <button
            onClick={() => onEquip?.(droneId, 'drone')}
            className="w-full py-6 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-lg tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            Equip
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(DroneCard);
