const fs = require('fs');

/**
 * drilling-game 세이브 데이터 난독화/복호화 함수 (GameEngine.tsx와 동일하게 구현)
 */
function obfuscateData(data) {
  const jsonStr = JSON.stringify(data);
  const key = 'DRILLING_SECRET_KEY!';
  let obfuscated = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    obfuscated += String.fromCharCode(charCode);
  }
  return Buffer.from(obfuscated).toString('base64');
}

// 998m 깊이에서의 위치
const BASE_DEPTH = 10;
const TARGET_DEPTH = 998;
const targetY = TARGET_DEPTH + BASE_DEPTH;

const testSaveData = {
  version: 1,
  timestamp: Date.now(),
  stats: {
    depth: TARGET_DEPTH,
    maxDepthReached: TARGET_DEPTH,
    equippedDrillId: 'obsidian_drill',
    ownedDrillIds: ['rusty_drill', 'iron_drill', 'golden_drill', 'diamond_drill', 'obsidian_drill'],
    artifacts: [],
    hp: 9999,
    maxHp: 9999,
    attackPower: 9999,
    goldCoins: 9999999,
    dimension: 0,
    mapSeed: 12345, // 고정 시드
    activeQuests: [],
    completedQuestIds: [],
    inventory: {
      dirt: 9999,
      stone: 9999,
      coal: 9999,
      iron: 9999,
      gold: 9999,
      diamond: 9999,
      emerald: 9999,
      ruby: 9999,
      sapphire: 9999,
      uranium: 9999,
      obsidian: 9999,
    }
  },
  position: {
    x: 15, // MAP_WIDTH (31) / 2
    y: targetY
  },
  tileMap: {} // Sparse tilemap, empty means default generation
};

const obfuscatedSave = obfuscateData(testSaveData);

console.log("==========================================");
console.log("테스트 계정 세이브 코드가 생성되었습니다.");
console.log("깊이: 998m (보스전 직전)");
console.log("이 코드를 복사하여 게임의 메뉴 -> Import Save 에 붙여넣으세요.");
console.log("==========================================\n");
console.log(obfuscatedSave);
console.log("\n==========================================");
