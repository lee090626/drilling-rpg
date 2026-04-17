 import { Tile, TileType, Entity } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
import { BASE_DEPTH } from '@/shared/config/constants';
import { getCircleConfig, getLayerFromDepth } from '@/shared/config/circleData';
import { MONSTER_LIST } from '@/shared/config/monsterData';

export class MapGenerator {
  constructor(private seed: number, private mapHeight: number) {}

  public hash(x: number, y: number): number {
    const h = (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453) % 1;
    return h < 0 ? h + 1 : h;
  }

  public calculateOriginalTile(x: number, y: number): Tile & { isSpot: boolean } {
    if (y < 0 || y >= this.mapHeight)
      return { type: 'wall', health: 1000000, maxHealth: 1000000, isSpot: false };

    if (y < BASE_DEPTH) {
      return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };
    }

    const config = getCircleConfig(y - BASE_DEPTH);
    const layer = getLayerFromDepth(y - BASE_DEPTH, config);

    if (layer === 4) return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };

    if (this.getInitialMonster(x, y))
      return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };

    let type: TileType = (config.bgType ?? 'stone') as TileType;
    let isSpot = false;

    const SECTOR_SIZE = 5;
    const PADDING = 1;
    const sectorX = Math.floor(x / SECTOR_SIZE);
    const sectorY = Math.floor(y / SECTOR_SIZE);

    const SAFE_RANGE = SECTOR_SIZE - 2 * PADDING;

    const countHash = this.hash(sectorX * 31, sectorY * 37);
    const targetCount = Math.floor(countHash * 3) + 1; // 1, 2, or 3

    for (let i = 0; i < targetCount; i++) {
      const rx = Math.floor(this.hash(sectorX + 123 + i, sectorY + 456 + i) * SAFE_RANGE) + PADDING;
      const ry = Math.floor(this.hash(sectorX + 789 + i, sectorY + 101 + i) * SAFE_RANGE) + PADDING;
      const spotX = sectorX * SECTOR_SIZE + rx;
      const spotY = sectorY * SECTOR_SIZE + ry;

      if (spotX === x && spotY === y) {
        const roll = this.hash(x + 500, y + 600);

        const valuableMinerals = config.minerals;
        let totalWeight = 0;
        for (const rule of valuableMinerals) {
          totalWeight += rule.threshold;
        }

        let cumulative = 0;
        const weightedRoll = roll * totalWeight;

        for (const rule of valuableMinerals) {
          cumulative += rule.threshold;
          if (weightedRoll <= cumulative) {
            type = rule.type;
            isSpot = true;
            break;
          }
        }

        if (!isSpot && valuableMinerals.length > 0) {
          type = valuableMinerals[0].type;
          isSpot = true;
        }
        break;
      }
    }

    const stats = getMineralStats(type);
    const health = stats.health;
    return { type, health, maxHealth: health, isSpot };
  }

  public getInitialMonster(x: number, y: number): Entity | null {
    if (y < BASE_DEPTH + 10) return null;
    const config = getCircleConfig(y - BASE_DEPTH);
    const layer = getLayerFromDepth(y - BASE_DEPTH, config);

    const available = config.monsters.filter(
      (m) => layer >= m.minLayer && (!m.maxLayer || layer <= m.maxLayer),
    );
    if (available.length === 0) return null;

    const MONSTER_SECTOR_SIZE = 8;
    const sectorX = Math.floor(x / MONSTER_SECTOR_SIZE);
    const sectorY = Math.floor(y / MONSTER_SECTOR_SIZE);

    const countHash = this.hash(sectorX * 41, sectorY * 43);
    const targetCount = Math.floor(countHash * 3) + 1; // 1, 2, or 3

    for (let i = 0; i < targetCount; i++) {
      const rx = Math.floor(this.hash(sectorX + 111 + i, sectorY + 222 + i) * MONSTER_SECTOR_SIZE);
      const ry = Math.floor(this.hash(sectorX + 333 + i, sectorY + 444 + i) * MONSTER_SECTOR_SIZE);
      const spotX = sectorX * MONSTER_SECTOR_SIZE + rx;
      const spotY = sectorY * MONSTER_SECTOR_SIZE + ry;

      if (spotX === x && spotY === y) {
        let totalWeight = 0;
        for (const rule of available) totalWeight += rule.weight;
        
        const roll = this.hash(sectorX * 997 + i * 73, sectorY * 877 + i * 61) * totalWeight;
        let cumulative = 0;
        let selectedRule = available[0];

        for (const rule of available) {
          cumulative += rule.weight;
          if (roll <= cumulative) {
            selectedRule = rule;
            break;
          }
        }

        const mob = MONSTER_LIST.find((m) => m.id === selectedRule.monsterId);
        if (!mob) continue;

        return {
          id: `mob_${x}_${y}_${mob.id}`,
          type: 'monster',
          name: mob.name,
          x,
          y,
          interactionType: 'none',
          imagePath: mob.imagePath,
          stats: {
            hp: mob.stats.maxHp,
            maxHp: mob.stats.maxHp,
            attack: mob.stats.power,
            speed: mob.stats.speed,
            defense: mob.stats.defense,
            attackCooldown: mob.stats.attackCooldown,
          },
          state: 'idle',
        };
      }
    }
    return null;
  }
}
