/**
 * 하위 호환성을 위해 유지하는 아이콘 이름(ID)과
 * 실제 아틀라스 JSON 내의 프레임 파일명 간의 매핑 정보입니다.
 */
export const ATLAS_FILE_MAPPING = {
  // --- UI Icons ---
  gold: 'MoneyIcon.webp',
  status: 'StatusIcon.webp',
  inventory: 'InventoryIcon.webp',
  book: 'BookIcon.webp',
  settings: 'SettingsIcon.webp',

  // --- Mineral Icons ---
  dirt_icon: 'DirtIcon.png',
  stone_icon: 'StoneIcon.png',
  coal_icon: 'CoalIcon.png',
  iron_icon: 'IronIcon.png',
  gold_icon: 'GoldIcon.png',
  diamond_icon: 'DiamondIcon.png',
  emerald_icon: 'EmeraldIcon.png',
  ruby_icon: 'RubyIcon.png',
  sapphire_icon: 'SapphireIcon.png',

  // --- Tiles ---
  dirt_tile: 'dirt.png',
  stone_tile: 'stone.png',
  coal_tile: 'coal.png',
  iron_tile: 'iron.png',
  gold_tile: 'gold.png',
  diamond_tile: 'diamond.png',
  emerald_tile: 'emerald.png',
  ruby_tile: 'ruby.png',
  sapphire_tile: 'sapphire.png',
  uranium_tile: 'uranium.png',
  obsidian_tile: 'obsidian.png',
  wall_tile: 'wall.png',
  dungeon_bricks_tile: 'dungeon_bricks.png',

  // --- Drills ---
  rusty_drill: 'RustyDrill.png',
  stone_drill: 'StoneDrill.png',
  iron_drill: 'IronDrill.png',
  gold_drill: 'GoldDrill.png',
  diamond_drill: 'DiamondDrill.png',
  emerald_drill: 'EmeralDrill.png', // Note: original asset typo

  // --- Runes ---
  attack_rune: 'AttackRune.png',
  speed_rune: 'MiningSpeedRune.png',
  move_rune: 'MoveSpeedRune.png',
  luck_rune: 'LuckRune.png',
  crit_rate_rune: 'CritRateRune.png',
  crit_dmg_rune: 'CritDmgRune.png',
} as const;

export type AtlasIconName = keyof typeof ATLAS_FILE_MAPPING;
