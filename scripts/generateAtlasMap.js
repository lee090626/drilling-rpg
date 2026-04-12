const fs = require('fs');
const path = require('path');

// 매핑 정보를 직접 가져옵니다 (TS 파일을 읽기 위해 간단한 파싱이나 직접 정의 사용)
// 여기서는 실수를 줄이기 위해 아까 만든 src/shared/config/atlasFiles.ts의 내용을 기반으로 정의합니다.
/**
 * 파일명(예: PascalCase.png)에서 확장자를 제외한 이름을 반환합니다.
 * 더 이상 강제로 snake_case로 변환하지 않고 원본 케이스를 유지합니다.
 */
function getAssetId(fileName) {
  return path.parse(fileName).name;
}

/**
 * 자동 변환 규칙에서 벗어나는 특수 매핑 정보입니다.
 */
const SPECIAL_OVERRIDES = {
  // --- UI Icons ---
  'MoneyIcon.webp': 'GoldIcon',
  'StatusIcon.webp': 'StatusIcon',
  'InventoryIcon.webp': 'InventoryIcon',
  'BookIcon.webp': 'BookIcon',
  'SettingsIcon.webp': 'SettingsIcon',

  // --- Minerals/Tiles (하위 호환 및 명확성을 위한 명명) ---
  'dirt.png': 'DirtTile',
  'stone.png': 'StoneTile',
  'coal.png': 'CoalTile',
  'iron.png': 'IronTile',
  'gold.png': 'GoldTile',
  'diamond.png': 'DiamondTile',
  'emerald.png': 'EmeraldTile',
  'ruby.png': 'RubyTile',
  'sapphire.png': 'SapphireTile',
  'uranium.png': 'UraniumTile',
  'obsidian.png': 'ObsidianTile',
  'wall.png': 'WallTile',
  'dungeon_bricks.png': 'DungeonBricksTile',

  // --- Typo Correction ---
  'EmeralDrill.png': 'EmeraldDrill',
};

const ASSETS_DIR = path.join(__dirname, '../public/assets');
const ATLAS_MAP_FILE = path.join(__dirname, '../src/shared/config/atlasMap.ts');
const ATLAS_FILES_FILE = path.join(__dirname, '../src/shared/config/atlasFiles.ts');

function generate() {
  console.log('Generating Atlas Map Automatically...');
  
  const atlasMap = {};
  const fileMapping = {};
  const atlasFiles = fs.readdirSync(ASSETS_DIR).filter(f => f.startsWith('game-atlas-') && f.endsWith('.json'));
  
  // 1. 모든 아틀라스 JSON을 스캔하여 프레임 수집
  for (const atlasJsonFile of atlasFiles) {
    const atlasIndex = parseInt(atlasJsonFile.match(/game-atlas-(\d+)\.json/)[1]);
    const content = JSON.parse(fs.readFileSync(path.join(ASSETS_DIR, atlasJsonFile), 'utf-8'));
    const metaSize = content.meta.size;

    for (const fileName of Object.keys(content.frames)) {
      // ID 결정 (예외 매핑 우선, 없으면 오리지널 파일명 유지)
      const id = SPECIAL_OVERRIDES[fileName] || getAssetId(fileName);
      const frame = content.frames[fileName].frame;

      fileMapping[id] = fileName;
      atlasMap[id] = {
        atlasIndex,
        x: frame.x,
        y: frame.y,
        width: frame.w,
        height: frame.h,
        atlasWidth: metaSize.w,
        atlasHeight: metaSize.h
      };
    }
  }

  // 2. atlasFiles.ts 생성 (알파벳 순 정렬)
  const sortedIds = Object.keys(fileMapping).sort();
  const fileMappingStr = sortedIds.map(id => `  ${id}: '${fileMapping[id]}',`).join('\n');
  
  const atlasFilesContent = `// [자동 생성됨] 이 파일은 scripts/generateAtlasMap.js 스크립트에 의해 생성되었습니다.
// 에셋이 추가되면 이 파일이 자동으로 업데이트됩니다.

export const ATLAS_FILE_MAPPING = {
${fileMappingStr}
} as const;

export type AtlasIconName = keyof typeof ATLAS_FILE_MAPPING;
`;

  fs.writeFileSync(ATLAS_FILES_FILE, atlasFilesContent);
  console.log(`Success! Atlas files mapping written to ${ATLAS_FILES_FILE}`);

  // 3. atlasMap.ts 생성
  const atlasMapContent = `// [자동 생성됨] 이 파일은 scripts/generateAtlasMap.js 스크립트에 의해 생성되었습니다.
// 에셋이 추가되면 이 파일이 자동으로 업데이트됩니다.

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

  fs.writeFileSync(ATLAS_MAP_FILE, atlasMapContent);
  console.log(`Success! Atlas map written to ${ATLAS_MAP_FILE}`);
}

generate();
