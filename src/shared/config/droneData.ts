import { Drone } from '../types/game';

export const DRONES: Record<string, Drone> = {
  // --- 채굴형 드론 (Mining Drones) ---
  basic_drone: {
    id: 'basic_drone',
    name: 'Basic Drone',
    description: 'A rusty but reliable mining assistant. Automatically mines nearby weaker blocks.',
    icon: '🤖',
    category: 'mining',
    basePower: 25,
    cooldownMs: 2000,
    miningRadius: 2,
    price: {
      iron_ingot: 10,
      gold_ingot: 2
    }
  },
  magnet_drone: {
    id: 'magnet_drone',
    name: 'Magnet Drone',
    description: 'Equipped with a strong electromagnet. Greatly increases item collection radius.',
    icon: '🛸',
    category: 'mining',
    basePower: 80,
    cooldownMs: 1500,
    miningRadius: 3,
    specialEffect: 'magnet',
    price: {
      iron_ingot: 50,
      gold_ingot: 20
    }
  },
  laser_drone: {
    id: 'laser_drone',
    name: 'Laser Drone',
    description: 'A high-tech drone that shoots devastating mining lasers at nearby structures.',
    icon: '🛰️',
    category: 'mining',
    basePower: 450,
    cooldownMs: 800,
    miningRadius: 4,
    price: {
      gold_ingot: 50,
      polished_diamond: 10
    }
  },
  
  // --- 보조형 드론 (Support Drones) ---
  smelter_drone: {
    id: 'smelter_drone',
    name: 'Smelter Booster',
    description: 'Equipped with a portable blast furnace. Speeds up smelting by 25% and provides an extra slot!',
    icon: '🔥',
    category: 'support',
    basePower: 0,
    cooldownMs: 0,
    miningRadius: 0,
    smeltSpeedMult: 0.75, // 25% 단축
    smeltSlotBonus: 1,
    price: {
      iron_ingot: 30,
      gold_ingot: 10
    }
  },
  auto_refiner_drone: {
    id: 'auto_refiner_drone',
    name: 'Auto Refiner',
    description: 'Highly advanced drone that automates mineral processing. Speeds up smelting by 50%!',
    icon: '⚙️',
    category: 'support',
    basePower: 0,
    cooldownMs: 0,
    miningRadius: 0,
    smeltSpeedMult: 0.5, // 50% 단축
    specialEffect: 'auto_smelt',
    price: {
      gold_ingot: 40,
      polished_diamond: 15
    }
  }
};

export const getDroneData = (id: string | null): Drone | null => {
  if (!id) return null;
  return DRONES[id] || null;
};
