import { TileMap } from '../tile/TileMap';
import { Player } from '../player/model';
import { Entity, Quest, GameAssets, Particle, FloatingText } from '../../shared/types/game';

export interface GameWorld {
  tileMap: TileMap;
  player: Player;
  entities: Entity[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  keys: { [key: string]: boolean };
  baseLayout: number[][] | null;
  availableQuests: Quest[];
  assets: GameAssets;
  intent: {
    moveX: number;
    moveY: number;
    action: 'none' | 'interact';
    miningTarget: { x: number, y: number } | null;
  };
  timestamp: {
    lastMove: number;
    lastUiUpdate: number;
    lastGlobalRegen: number;
    lastLoop: number;
  };
  ui: {
    showInteractionPrompt: boolean;
    activeInteractionType: 'shop' | 'dialog' | 'quest' | 'crafting' | null;
    isShopOpen: boolean;
    isInventoryOpen: boolean;
    isSettingsOpen: boolean;
    isCraftingOpen: boolean;
    isElevatorOpen: boolean;
    isStatusOpen: boolean;
    isEncyclopediaOpen: boolean;
  };
}

export const createInitialWorld = (seed: number): GameWorld => {
  const tileMap = new TileMap(seed, 0);
  return {
    tileMap,
    player: {
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
          dirt: 0, stone: 0, coal: 0, iron: 0, gold: 0, diamond: 0,
          emerald: 0, ruby: 0, sapphire: 0, uranium: 0, obsidian: 0,
        },
        goldCoins: 0,
        mapSeed: seed,
        activeQuests: [],
        completedQuestIds: [],
        discoveredMinerals: [],
        encounteredBossIds: [],
        dimension: 0,
      },
      pos: { x: 15, y: 8 },
      velocity: { x: 0, y: 0 },
      visualPos: { x: 15, y: 8 },
      isDrilling: false,
      lastHitTime: 0,
    },
    entities: [],
    particles: [],
    floatingTexts: [],
    keys: {},
    baseLayout: null,
    availableQuests: [],
    assets: {
      tileset: null,
      baseTileset: null,
      player: null,
      boss: null,
      entities: {},
      resources: {},
    },
    intent: {
      moveX: 0,
      moveY: 0,
      action: 'none',
      miningTarget: null,
    },
    timestamp: {
      lastMove: 0,
      lastUiUpdate: 0,
      lastGlobalRegen: Date.now(),
      lastLoop: 0,
    },
    ui: {
      showInteractionPrompt: false,
      activeInteractionType: null,
      isShopOpen: false,
      isInventoryOpen: false,
      isSettingsOpen: false,
      isCraftingOpen: false,
      isElevatorOpen: false,
      isStatusOpen: false,
      isEncyclopediaOpen: false,
    }
  };
};
