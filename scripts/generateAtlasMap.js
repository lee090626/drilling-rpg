const fs = require('fs');
const path = require('path');

// 매핑 정보를 직접 가져옵니다 (TS 파일을 읽기 위해 간단한 파싱이나 직접 정의 사용)
// 여기서는 실수를 줄이기 위해 아까 만든 src/shared/config/atlasFiles.ts의 내용을 기반으로 정의합니다.
const ATLAS_FILE_MAPPING = {
  gold: 'MoneyIcon.webp',
  status: 'StatusIcon.webp',
  inventory: 'InventoryIcon.webp',
  book: 'BookIcon.webp',
  settings: 'SettingsIcon.webp',
  dirt_icon: 'DirtIcon.png',
  stone_icon: 'StoneIcon.png',
  coal_icon: 'CoalIcon.png',
  iron_icon: 'IronIcon.png',
  gold_icon: 'GoldIcon.png',
  diamond_icon: 'DiamondIcon.png',
  emerald_icon: 'EmeraldIcon.png',
  ruby_icon: 'RubyIcon.png',
  sapphire_icon: 'SapphireIcon.png',
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
  rusty_drill: 'RustyDrill.png',
  stone_drill: 'StoneDrill.png',
  iron_drill: 'IronDrill.png',
  gold_drill: 'GoldDrill.png',
  diamond_drill: 'DiamondDrill.png',
  emerald_drill: 'EmeralDrill.png',
  attack_rune: 'AttackRune.png',
  speed_rune: 'MiningSpeedRune.png',
  move_rune: 'MoveSpeedRune.png',
  luck_rune: 'LuckRune.png',
  crit_rate_rune: 'CritRateRune.png',
  crit_dmg_rune: 'CritDmgRune.png',
};

const ASSETS_DIR = path.join(__dirname, '../public/assets');
const OUTPUT_FILE = path.join(__dirname, '../src/shared/config/atlasMap.ts');

function generate() {
  console.log('Generating Atlas Map...');
  
  const atlasMap = {};
  const atlasFiles = fs.readdirSync(ASSETS_DIR).filter(f => f.startsWith('game-atlas-') && f.endsWith('.json'));
  
  for (const [id, fileName] of Object.entries(ATLAS_FILE_MAPPING)) {
    let found = false;
    
    for (const atlasJsonFile of atlasFiles) {
      const atlasIndex = parseInt(atlasJsonFile.match(/game-atlas-(\d+)\.json/)[1]);
      const content = JSON.parse(fs.readFileSync(path.join(ASSETS_DIR, atlasJsonFile), 'utf-8'));
      
      if (content.frames[fileName]) {
        const frame = content.frames[fileName].frame;
        const metaSize = content.meta.size;
        
        atlasMap[id] = {
          atlasIndex,
          x: frame.x,
          y: frame.y,
          width: frame.w,
          height: frame.h,
          atlasWidth: metaSize.w,
          atlasHeight: metaSize.h
        };
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.warn(`Warning: Could not find frame for "${id}" (file: ${fileName}) in any atlas JSON.`);
    }
  }

  const fileContent = `// [자동 생성됨] 이 파일은 scripts/generateAtlasMap.js 스크립트에 의해 생성되었습니다.
// 직접 수정하지 마세요. 대신 src/shared/config/atlasFiles.ts를 수정하고 스크립트를 실행하세요.

export interface AtlasMetadata {
  atlasIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  atlasWidth: number;
  atlasHeight: number;
}

import { ATLAS_FILE_MAPPING, AtlasIconName } from './atlasFiles';

export type { AtlasIconName };

export const atlasMap: Record<AtlasIconName, AtlasMetadata> = ${JSON.stringify(atlasMap, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`Success! Atlas map written to ${OUTPUT_FILE}`);
}

generate();
