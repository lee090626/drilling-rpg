import { Tile, TileType, Entity } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
import { BASE_DEPTH } from '@/shared/config/constants';
import { getDimensionConfig } from '@/shared/config/dimensionData';
import { MONSTERS } from '@/shared/config/monsterData';
import { BOSSES } from '@/shared/config/bossData';

/** 맵의 최대 높이 (타일 단위) */
export const MAP_HEIGHT = 1550;
/** 맵의 가로 너비 (중심 0 기준 좌우 150칸) */
export const MAP_WIDTH = 301; // 원점 포함하여 홀수로 맞춤 (-150 ~ +150)
export const HALF_WIDTH = 150;

/** 비트 마스크 및 시프트 상수 */
const TYPE_MASK = 0xFF; // 하위 8비트: 타입 ID
const HP_BITS = 8;
const HP_MASK = 0xFFFF; // 다음 16비트: 체력
const GEN_FLAG = 1 << 24; // 24번 비트: 생성 여부 (Generated)
const MOD_FLAG = 1 << 25; // 25번 비트: 수정 여부 (Modified)

/**
 * [초고최적화 버전] TileMap 클래스
 * - Map 대신 Int32Array를 사용하여 메모리 및 속도 대폭 개선
 * - 비트 연산을 통한 데이터 압축 저장
 */
export class TileMap {
  /** [Type 8bit | HP 16bit | Flags 8bit] 구조의 고속 데이터 배열 */
  private data: Int32Array;
  
  /** 월드 생성을 위한 랜덤 시드 */
  seed: number;
  /** 현재 월드의 차원(Dimension) 번호 */
  dimension: number;
  /** 수정된 타일 인덱스 추적 (직렬화 최적화용) */
  private modifiedIndices: Set<number> = new Set();

  constructor(seed: number = 12345, dimension: number = 0) {
    this.seed = seed;
    this.dimension = dimension;
    this.data = new Int32Array(MAP_WIDTH * MAP_HEIGHT);
  }

  /** 인덱스 계산 유틸리티 */
  private getIndex(x: number, y: number): number {
    const localX = x + HALF_WIDTH;
    if (localX < 0 || localX >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return -1;
    return y * MAP_WIDTH + localX;
  }

  private hash(x: number, y: number): number {
    const h = (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453) % 1;
    return h < 0 ? h + 1 : h;
  }

  /** 타일 초기 생성 (원본 로직 유지하며 결과 패턴 리턴) */
  private calculateOriginalTile(x: number, y: number): Tile {
    if (Math.abs(x) > HALF_WIDTH) return { type: 'wall', health: 1000000, maxHealth: 1000000 };
    if (y < BASE_DEPTH) return { type: 'empty', health: 0, maxHealth: 0 };

    const config = getDimensionConfig(this.dimension);
    if (this.getInitialMonster(x, y)) return { type: 'empty', health: 0, maxHealth: 0 };

    let type: TileType = 'dirt';
    const bgRoll = this.hash(x, y);
    if (bgRoll < 0.40) type = 'stone';

    // 지터드 그리드 로직은 간소화하거나 필요시 복원 (현재는 직접 구현부만 대체)
    // 여기서는 기존 generateTile의 코어를 활용하여 데이터만 추출합니다.
    const SECTOR_SIZE = 5;
    const PADDING = 1;
    const sectorX = Math.floor((x + HALF_WIDTH) / SECTOR_SIZE);
    const sectorY = Math.floor(y / SECTOR_SIZE);
    
    // Mineral Spot 계산
    const SAFE_RANGE = SECTOR_SIZE - (2 * PADDING);
    const spawnChance = this.hash(sectorX, sectorY);
    if (spawnChance <= 0.85) {
      const rx = Math.floor(this.hash(sectorX + 123, sectorY + 456) * SAFE_RANGE) + PADDING;
      const ry = Math.floor(this.hash(sectorX + 789, sectorY + 101) * SAFE_RANGE) + PADDING;
      const spotX = sectorX * SECTOR_SIZE + rx - HALF_WIDTH;
      const spotY = sectorY * SECTOR_SIZE + ry;

      if (spotX === x && spotY === y) {
        const roll = this.hash(x + 500, y + 600);
        let cumulative = 0;
        const valuableMinerals = config.minerals.filter(m => m.type !== 'stone');
        for (const rule of valuableMinerals) {
          if (!rule.minDepth || y >= rule.minDepth) {
            let chance = rule.threshold;
            if (rule.peakDepth && rule.range) {
              const dist = Math.abs(y - rule.peakDepth);
              const depthFactor = Math.max(0, 1 - dist / rule.range);
              chance *= depthFactor;
            }
            cumulative += chance;
            if (roll < cumulative) {
              type = rule.type;
              break;
            }
          }
        }
      }
    }

    const bossHeight = config.bossHeight;
    const bossCenterY = bossHeight - 1;
    const bossCenterX = 15;
    if (Math.abs(x - bossCenterX) <= 2 && Math.abs(y - bossCenterY) <= 2) {
      type = 'empty';
    } else if (config.hasMonsterNest && y === bossCenterY && (x === bossCenterX - 3 || x === bossCenterX + 3)) {
      type = 'monster_nest';
    }

    const stats = getMineralStats(type);
    const health = type === 'boss_core' ? 20000 : stats.health;
    return { type, health, maxHealth: health };
  }

  getTile(x: number, y: number): Tile | null {
    const idx = this.getIndex(x, y);
    if (idx === -1) return null;

    let packed = this.data[idx];

    // 생성된 적이 없으면 즉석 생성 및 패킹 저장
    if (!(packed & GEN_FLAG)) {
      const original = this.calculateOriginalTile(x, y);
      const typeId = TILE_TYPE_TO_ID[original.type] ?? 0;
      // [Type ID] | [Health << 8] | [GEN_FLAG]
      packed = (typeId & TYPE_MASK) | ((original.health & HP_MASK) << HP_BITS) | GEN_FLAG;
      this.data[idx] = packed;
    }

    const typeId = packed & TYPE_MASK;
    const health = (packed >> HP_BITS) & HP_MASK;
    const type = ID_TO_TILE_TYPE[typeId] || 'dirt';
    const stats = getMineralStats(type);

    return {
      type,
      health,
      maxHealth: stats.health
    };
  }

  damageTile(x: number, y: number, amount: number): boolean {
    const idx = this.getIndex(x, y);
    if (idx === -1) return false;

    // 만약 한 번도 조회되지 않았다면 getTile을 통해 생성 유도
    if (!(this.data[idx] & GEN_FLAG)) {
      this.getTile(x, y);
    }

    let packed = this.data[idx];
    const typeId = packed & TYPE_MASK;
    if (typeId === TILE_TYPE_TO_ID['empty'] || typeId === TILE_TYPE_TO_ID['wall']) return false;

    let health = (packed >> HP_BITS) & HP_MASK;
    health = Math.max(0, health - amount);

    // 플래그 업데이트 (Modified)
    packed = (packed & ~(HP_MASK << HP_BITS)) | (health << HP_BITS);
    packed |= MOD_FLAG;

    if (health <= 0) {
      packed = (packed & ~TYPE_MASK) | (TILE_TYPE_TO_ID['empty'] & TYPE_MASK);
    }

    this.data[idx] = packed;
    this.modifiedIndices.add(idx);
    return health <= 0;
  }

  /** 초기 몬스터 배치는 최적화를 위해 따로 캐싱하거나 필요시 워커에서 처리 */
  getInitialMonster(x: number, y: number): Entity | null {
    if (y < BASE_DEPTH + 10) return null;
    const config = getDimensionConfig(this.dimension);
    if (y === config.bossHeight - 3 && x === 14) {
      const bossDef = BOSSES[0];
      return {
        id: `boss_${this.dimension}_${bossDef.id}`,
        type: 'boss', name: bossDef.name, x, y,
        width: 3, height: 3,
        interactionType: 'none',
        stats: { hp: bossDef.stats.hp, maxHp: bossDef.stats.hp, attack: bossDef.stats.attack, speed: 0.01, defense: 100 },
        state: 'idle',
      };
    }

    const available = config.monsters.filter(m => y >= m.minDepth && (!m.maxDepth || y <= m.maxDepth));
    if (available.length === 0) return null;

    const mobHash = this.hash(x + 100, y + 100);
    for (const rule of available) {
      if (mobHash < rule.chance) {
        const mob = MONSTERS.find(m => m.id === rule.monsterId);
        if (!mob) continue;
        return {
          id: `mob_${x}_${y}_${mob.id}`,
          type: 'monster', name: mob.name, x, y,
          interactionType: 'none',
          imagePath: mob.icon,
          stats: { hp: mob.stats.hp, maxHp: mob.stats.hp, attack: mob.stats.attack, speed: mob.stats.speed, defense: mob.stats.defense },
          state: 'idle',
        };
      }
    }
    return null;
  }

  /** 수정된 타일만 추출하여 저장 최적화 */
  serialize(): Record<string, [number, number]> {
    const result: Record<string, [number, number]> = {};
    for (const i of this.modifiedIndices) {
      const packed = this.data[i];
      if (packed & MOD_FLAG) {
        const x = (i % MAP_WIDTH) - HALF_WIDTH;
        const y = Math.floor(i / MAP_WIDTH);
        const typeId = packed & TYPE_MASK;
        const health = (packed >> HP_BITS) & HP_MASK;
        result[`${x},${y}`] = [typeId, health];
      }
    }
    return result;
  }

  /**
   * 타일 데이터를 완전히 초기화합니다. (차원 이동 시 사용)
   * @param newSeed 새로운 월드 시드
   * @param newDimension 새로운 차원 번호
   */
  reset(newSeed?: number, newDimension?: number): void {
    if (newSeed !== undefined) this.seed = newSeed;
    if (newDimension !== undefined) this.dimension = newDimension;
    this.data.fill(0);
    this.modifiedIndices.clear();
  }

  deserialize(data: any, seed?: number, dimension?: number): void {
    if (seed !== undefined) this.seed = seed;
    if (dimension !== undefined) this.dimension = dimension;
    
    this.data.fill(0);
    if (!data) return;

    for (const [key, tileData] of Object.entries(data as Record<string, [number, number]>)) {
      const [x, y] = key.split(',').map(Number);
      const idx = this.getIndex(x, y);
      if (idx !== -1) {
        const [typeId, health] = tileData;
        // GEN_FLAG와 MOD_FLAG 모두 설정
        const packed = (typeId & TYPE_MASK) | ((health & HP_MASK) << HP_BITS) | GEN_FLAG | MOD_FLAG;
        this.data[idx] = packed;
        this.modifiedIndices.add(idx);
      }
    }
  }
}

/** 타일 타입-ID 매핑 (저장 및 비트 패킹용) */
const TILE_TYPE_TO_ID: Record<string, number> = {
  empty: 0,
  dirt: 1,
  stone: 2,
  coal: 3,
  iron: 4,
  gold: 5,
  diamond: 6,
  emerald: 7,
  ruby: 8,
  sapphire: 9,
  uranium: 10,
  obsidian: 11,
  lava: 12,
  dungeon_bricks: 13,
  boss_core: 14,
  monster_nest: 15,
  monster: 16,
  wall: 17,
  portal: 18,
  boss_skin: 19,
};

/** 역매핑 리스트 */
const ID_TO_TILE_TYPE: Record<number, TileType> = Object.entries(TILE_TYPE_TO_ID).reduce((acc, [key, value]) => {
  acc[value] = key as TileType;
  return acc;
}, {} as Record<number, TileType>);
