const DRILLING_SECRET_KEY = 'DRILLING_SECRET_KEY!';

const obfuscate = (jsonStr) => {
  let result = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ DRILLING_SECRET_KEY.charCodeAt(i % DRILLING_SECRET_KEY.length);
    result += String.fromCharCode(charCode);
  }
  
  // Node.js equivalent for Base64 encoding of potentially non-ASCII strings
  return Buffer.from(result, 'binary').toString('base64');
};

const mapSeed = 12345;
const saveData = {
  version: 1,
  timestamp: Date.now(),
  stats: {
    depth: 0,
    equippedDrillId: 'rusty_drill',
    ownedDrillIds: ['rusty_drill'],
    maxDepthReached: 0,
    artifacts: [],
    hp: 200,
    maxHp: 200,
    attackPower: 10,
    inventory: {
      dirt: 100000,
      stone: 100000,
      coal: 100000,
      iron: 100000,
      gold: 100000,
      diamond: 100000,
      emerald: 100000,
      ruby: 100000,
      sapphire: 100000,
      uranium: 100000,
      obsidian: 100000,
    },
    inventoryGems: [],
    goldCoins: 0,
    mapSeed: mapSeed,
    activeQuests: [],
    completedQuestIds: [],
    discoveredMinerals: [],
    encounteredBossIds: [],
    dimension: 0,
    equipmentStates: {},
  },
  position: { x: 15, y: 8 },
  tileMap: {}, // Empty tileMap means everything is based on seed
};

const jsonStr = JSON.stringify(saveData);
console.log(obfuscate(jsonStr));
