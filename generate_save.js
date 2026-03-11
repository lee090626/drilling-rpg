const SECRET_KEY = 'DRILL_RPG_SALT_2024';

const obfuscate = (dataStr) => {
    let checksum = 0;
    for (let i = 0; i < dataStr.length; i++) {
        checksum = (checksum + dataStr.charCodeAt(i)) % 999999;
    }
    const dataWithCheck = `${checksum}:${dataStr}`;

    let result = '';
    for (let i = 0; i < dataWithCheck.length; i++) {
        const charCode = dataWithCheck.charCodeAt(i);
        const keyCode = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
        result += String.fromCharCode(charCode ^ keyCode);
    }

    return Buffer.from(unescape(encodeURIComponent(result)), 'binary').toString('base64');
};

const mapSeed = 12345;
const saveData = {
    stats: {
        depth: 0,
        equippedDrillId: 'obsidian_drill',
        ownedDrillIds: [
            'rusty_drill', 'stone_drill', 'iron_drill', 
            'gold_drill', 'diamond_drill', 'coal_drill', 
            'emerald_drill', 'ruby_drill', 'sapphire_drill', 
            'uranium_drill', 'obsidian_drill', 'sonic_drill'
        ],
        maxDepthReached: 1000,
        artifacts: [],
        hp: 99999,
        maxHp: 99999,
        attackPower: 99,
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
        },
        goldCoins: 9999999,
        mapSeed: mapSeed,
        activeQuests: [],
        completedQuestIds: [],
    },
    position: { x: 15, y: 8 },
    tileMap: {},
    lastSaved: Date.now(),
    lastGlobalRegen: Date.now()
};

const jsonStr = JSON.stringify(saveData);
console.log(obfuscate(jsonStr));
