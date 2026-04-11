import { Tile, TileType, Entity, TILE_TYPE_TO_ID, ID_TO_TILE_TYPE } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
import { BASE_DEPTH } from '@/shared/config/constants';
import { getCircleConfig, getLayerFromDepth } from '@/shared/config/circleData';
import { MONSTER_LIST } from '@/shared/config/monsterData';

/** Max map height (tiles) */
export const MAP_HEIGHT = 1550;
/** Map width (centered at 0, spans 150 tiles left/right) */
export const MAP_WIDTH = 301; // odd number including origin (-150 to +150)
export const HALF_WIDTH = 150;

/** Bit masks and shift constants */
const TYPE_MASK = 0xFF; // Lower 8 bits: Tile Type ID
const HP_BITS = 8;
const HP_MASK = 0xFFFF; // Next 16 bits: Health
const GEN_FLAG = 1 << 24; // Bit 24: Generated flag
const MOD_FLAG = 1 << 25; // Bit 25: Modified flag

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

    const config = getCircleConfig(y);
    const layer = getLayerFromDepth(y, config);

    if (this.getInitialMonster(x, y)) return { type: 'empty', health: 0, maxHealth: 0 };

    let type: TileType = 'veinstone'; // 기본 배경 타일
    const bgRoll = this.hash(x, y);
    if (bgRoll < 0.40) type = 'galestone';

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
        const valuableMinerals = config.minerals;
        for (const rule of valuableMinerals) {
          if (!rule.minLayer || layer >= rule.minLayer) {
            let chance = rule.threshold;
            if (rule.peakLayer && rule.range) {
              const dist = Math.abs(layer - rule.peakLayer);
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

    const bossHeight = config.boss ? config.depthStart + (config.boss.spawnLayer * 10) : MAP_HEIGHT;
    const bossCenterY = bossHeight - 1;
    const bossCenterX = 15;
    if (Math.abs(x - bossCenterX) <= 2 && Math.abs(y - bossCenterY) <= 2) {
      type = 'empty';
    } else if (config.boss && y === bossCenterY && (x === bossCenterX - 3 || x === bossCenterX + 3)) {
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
    const config = getCircleConfig(y);
    const layer = getLayerFromDepth(y, config);

    const available = config.monsters.filter(m => layer >= m.minLayer && (!m.maxLayer || layer <= m.maxLayer));
    if (available.length === 0) return null;

    const mobHash = this.hash(x + 100, y + 100);
    for (const rule of available) {
      if (mobHash < rule.chance) {
        const mob = MONSTER_LIST.find(m => m.id === rule.monsterId);
        if (!mob) continue;
        return {
          id: `mob_${x}_${y}_${mob.id}`,
          type: 'monster', name: mob.name, x, y,
          interactionType: 'none',
          imagePath: mob.imagePath,
          stats: { hp: mob.stats.maxHp, maxHp: mob.stats.maxHp, attack: mob.stats.power, speed: mob.stats.speed, defense: mob.stats.defense },
          state: 'idle',
        };
      }
    }
    return null;
  }

  /** [Legacy] Extract modified tiles for JSON storage */
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
   * [고속 직렬화] 수정된 타일 맵 데이터를 압축된 Uint32Array로 반환합니다. 
   * 포맷: [Version, MapWidth, DataCount, Reserved, index1, packed1, index2, packed2, ...]
   */
  serializeToBuffer(): Uint32Array {
    let modCount = 0;
    for (const i of this.modifiedIndices) {
      if (this.data[i] & MOD_FLAG) modCount++;
    }

    const HEADER_SIZE = 4;
    const buffer = new Uint32Array(HEADER_SIZE + modCount * 2);

    // 헤더 작성
    buffer[0] = 1; // Version
    buffer[1] = MAP_WIDTH;
    buffer[2] = modCount;
    buffer[3] = 0; // Reserved

    let ptr = HEADER_SIZE;
    for (const i of this.modifiedIndices) {
      const packed = this.data[i];
      if (packed & MOD_FLAG) {
        buffer[ptr++] = i;
        buffer[ptr++] = packed;
      }
    }

    return buffer;
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

  /** [Legacy] 객체 형태의 타일 데이터를 복원합니다. */
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
        const packed = (typeId & TYPE_MASK) | ((health & HP_MASK) << HP_BITS) | GEN_FLAG | MOD_FLAG;
        this.data[idx] = packed;
        this.modifiedIndices.add(idx);
      }
    }
  }

  /**
   * [Fast Restoration] Reconstruct tilemap from buffer.
   * Remaps indices if MAP_WIDTH has changed since saving.
   */
  deserializeFromBuffer(buffer: ArrayBuffer, seed?: number, dimension?: number): void {
    if (seed !== undefined) this.seed = seed;
    if (dimension !== undefined) this.dimension = dimension;
    
    this.data.fill(0);
    this.modifiedIndices.clear();
    
    if (!buffer || buffer.byteLength === 0) return;

    const data32 = new Uint32Array(buffer);
    const HEADER_SIZE = 4;
    
    if (data32.length < HEADER_SIZE) return;

    const version = data32[0];
    const savedMapWidth = data32[1];
    const dataCount = data32[2];
    
    const savedHalfWidth = Math.floor(savedMapWidth / 2);

    let ptr = HEADER_SIZE;
    for (let i = 0; i < dataCount; i++) {
      if (ptr >= data32.length) break;
      
      const savedIndex = data32[ptr++];
      const packed = data32[ptr++];

      let targetIndex = savedIndex;
      if (savedMapWidth !== MAP_WIDTH) {
        const x = (savedIndex % savedMapWidth) - savedHalfWidth;
        const y = Math.floor(savedIndex / savedMapWidth);
        targetIndex = this.getIndex(x, y);
      }

      if (targetIndex !== -1) {
        this.data[targetIndex] = packed;
        this.modifiedIndices.add(targetIndex);
      }
    }
  }
}
