import { Tile, TileType, Entity, TILE_TYPE_TO_ID, ID_TO_TILE_TYPE } from '@/shared/types/game';
import { getMineralStats } from '@/shared/lib/tileUtils';
import { BASE_DEPTH } from '@/shared/config/constants';
import { getCircleConfig, getLayerFromDepth } from '@/shared/config/circleData';
import { MONSTER_LIST } from '@/shared/config/monsterData';

/** Max map height (tiles) */
export const MAP_HEIGHT = 3000;
/** Horizontal chunk width */
export const CHUNK_WIDTH = 64;

/** Bit masks and shift constants */
const TYPE_MASK = 0xFF; // Lower 8 bits: Tile Type ID
const HP_BITS = 8;
const HP_MASK = 0xFFFF; // Next 16 bits: Health
const GEN_FLAG = 1 << 24; // Bit 24: Generated flag
const MOD_FLAG = 1 << 25; // Bit 25: Modified flag
const SPOT_FLAG = 1 << 26; // Bit 26: 광물 스팟(true) vs 배경 타일(false) 구분

/**
 * [무한 가로맵 버전] TileMap 클래스
 * - 청크(Chunk) 기반 시스템으로 가로 방향 무한 확장 지원
 * - Map<number, Int32Array>를 사용하여 필요한 구역만 메모리 할당
 */
export class TileMap {
  /** [Type 8bit | HP 16bit | Flags 8bit] 구조의 고속 데이터 청크 맵 */
  private chunks: Map<number, Int32Array> = new Map();
  
  /** 월드 생성을 위한 랜덤 시드 */
  seed: number;
  /** 현재 월드의 차원(Dimension) 번호 */
  dimension: number;
  /** 수정된 타일 좌표 추적 (직렬화 최적화용) */
  private modifiedCoords: Set<string> = new Set();

  constructor(seed: number = 12345, dimension: number = 0) {
    this.seed = seed;
    this.dimension = dimension;
  }

  /** 가로 좌표를 청크 인덱스 및 로컬 X로 변환 */
  private getChunkInfo(x: number) {
    const chunkX = Math.floor(x / CHUNK_WIDTH);
    const localX = x - (chunkX * CHUNK_WIDTH);
    return { chunkX, localX };
  }

  /** 특정 청크의 데이터를 가져오거나 생성 */
  private getChunk(chunkX: number): Int32Array {
    let chunk = this.chunks.get(chunkX);
    if (!chunk) {
      chunk = new Int32Array(CHUNK_WIDTH * MAP_HEIGHT);
      this.chunks.set(chunkX, chunk);
    }
    return chunk;
  }

  private hash(x: number, y: number): number {
    const h = (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453) % 1;
    return h < 0 ? h + 1 : h;
  }

  /** 타일 초기 생성 (가로 제한 없음) */
  private calculateOriginalTile(x: number, y: number): Tile & { isSpot: boolean } {
    // 깊이 제한은 유지 (지상/지하 구분)
    if (y < 0 || y >= MAP_HEIGHT) return { type: 'wall', health: 1000000, maxHealth: 1000000, isSpot: false };
    
    // 지상 구역 (Depth < BASE_DEPTH)
    if (y < BASE_DEPTH) {
      // 베이스 캠프 구역 (x >= 0 && x < row.length 인 경우만 레이아웃 적용)
      // 그 외 구역은 유저 성에 따라 'empty' 레이아웃 적용
      return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };
    }

    const config = getCircleConfig(y - BASE_DEPTH);
    const layer = getLayerFromDepth(y - BASE_DEPTH, config);

    if (this.getInitialMonster(x, y)) return { type: 'empty', health: 0, maxHealth: 0, isSpot: false };

    /** 배경 타일: circleData의 bgType 사용 (기본값 'stone') */
    let type: TileType = (config.bgType ?? 'stone') as TileType;
    let isSpot = false;

    const SECTOR_SIZE = 5;
    const PADDING = 1;
    const sectorX = Math.floor(x / SECTOR_SIZE);
    const sectorY = Math.floor(y / SECTOR_SIZE);
    
    // Mineral Spot 계산 (무한 가로에서도 동일한 그리드 해시 적용)
    const SAFE_RANGE = SECTOR_SIZE - (2 * PADDING);
    const spawnChance = this.hash(sectorX, sectorY);
    if (spawnChance <= 0.85) {
      const rx = Math.floor(this.hash(sectorX + 123, sectorY + 456) * SAFE_RANGE) + PADDING;
      const ry = Math.floor(this.hash(sectorX + 789, sectorY + 101) * SAFE_RANGE) + PADDING;
      const spotX = sectorX * SECTOR_SIZE + rx;
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
              isSpot = true;
              break;
            }
          }
        }
      }
    }

    // 보스 구역은 중앙 근처(x=15)에만 생성되도록 고정
    const absoluteBossY = config.boss ? (config.depthStart + BASE_DEPTH) + (config.boss.spawnLayer * 10) : MAP_HEIGHT;
    const bossCenterY = absoluteBossY - 1;
    const bossCenterX = 15;
    if (Math.abs(x - bossCenterX) <= 2 && Math.abs(y - bossCenterY) <= 2) {
      type = 'empty';
    } else if (config.boss && y === bossCenterY && (x === bossCenterX - 3 || x === bossCenterX + 3)) {
      type = 'monster_nest';
    }

    const stats = getMineralStats(type);
    const health = type === 'boss_core' ? 20000 : stats.health;
    return { type, health, maxHealth: health, isSpot };
  }

  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= MAP_HEIGHT) return null;

    const { chunkX, localX } = this.getChunkInfo(x);
    const chunk = this.getChunk(chunkX);
    const idx = y * CHUNK_WIDTH + localX;

    let packed = chunk[idx];

    // 생성된 적이 없으면 즉석 생성 및 패킹 저장
    if (!(packed & GEN_FLAG)) {
      const original = this.calculateOriginalTile(x, y);
      const typeId = TILE_TYPE_TO_ID[original.type] ?? 0;
      packed = (typeId & TYPE_MASK) | ((original.health & HP_MASK) << HP_BITS) | GEN_FLAG | (original.isSpot ? SPOT_FLAG : 0);
      chunk[idx] = packed;
    }

    const typeId = packed & TYPE_MASK;
    const health = (packed >> HP_BITS) & HP_MASK;
    const type = ID_TO_TILE_TYPE[typeId] || 'crimsonstone';
    const stats = getMineralStats(type);
    const isSpot = !!(packed & SPOT_FLAG);

    return {
      type,
      health,
      maxHealth: stats.health,
      isSpot,
    };
  }

  damageTile(x: number, y: number, amount: number): boolean {
    if (y < 0 || y >= MAP_HEIGHT) return false;

    const { chunkX, localX } = this.getChunkInfo(x);
    const chunk = this.getChunk(chunkX);
    const idx = y * CHUNK_WIDTH + localX;

    if (!(chunk[idx] & GEN_FLAG)) {
      this.getTile(x, y);
    }

    let packed = chunk[idx];
    const typeId = packed & TYPE_MASK;
    if (typeId === TILE_TYPE_TO_ID['empty'] || typeId === TILE_TYPE_TO_ID['wall']) return false;

    let health = (packed >> HP_BITS) & HP_MASK;
    health = Math.max(0, health - amount);

    packed = (packed & ~(HP_MASK << HP_BITS)) | (health << HP_BITS);
    packed |= MOD_FLAG;

    if (health <= 0) {
      packed = (packed & ~TYPE_MASK) | (TILE_TYPE_TO_ID['empty'] & TYPE_MASK);
    }

    chunk[idx] = packed;
    this.modifiedCoords.add(`${x},${y}`);
    return health <= 0;
  }

  getInitialMonster(x: number, y: number): Entity | null {
    if (y < BASE_DEPTH + 10) return null;
    const config = getCircleConfig(y - BASE_DEPTH);
    const layer = getLayerFromDepth(y - BASE_DEPTH, config);

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

  /**
   * [고속 직렬화 - 개편] 수정된 타일 정보를 좌표 쌍으로 저장
   * 포맷: [Version, 0(LegacyWidth), DataCount, Reserved, x1, y1, packed1, x2, y2, packed2, ...]
   */
  serializeToBuffer(): Uint32Array {
    let modCount = 0;
    const validCoords: {x: number, y: number, packed: number}[] = [];

    for (const coordStr of this.modifiedCoords) {
      const [x, y] = coordStr.split(',').map(Number);
      const { chunkX, localX } = this.getChunkInfo(x);
      const chunk = this.chunks.get(chunkX);
      if (chunk) {
        const idx = y * CHUNK_WIDTH + localX;
        const packed = chunk[idx];
        if (packed & MOD_FLAG) {
          validCoords.push({ x, y, packed });
          modCount++;
        }
      }
    }

    const HEADER_SIZE = 4;
    // x, y, packed 3개의 필드가 한 쌍
    const buffer = new Uint32Array(HEADER_SIZE + modCount * 3);

    buffer[0] = 2; // Version 2 (Infinite Map Support)
    buffer[1] = 0; // MAP_WIDTH is no longer fixed
    buffer[2] = modCount;
    buffer[3] = 0;

    let ptr = HEADER_SIZE;
    for (const item of validCoords) {
      buffer[ptr++] = item.x >= 0 ? item.x : (item.x >>> 0); // Handle negative x with bitwise unsigned if needed, or just store as is
      // Actually Uint32 will wrap negative values. Deserializer should handle it.
      buffer[ptr++] = item.y;
      buffer[ptr++] = item.packed;
    }

    return buffer;
  }

  reset(newSeed?: number, newDimension?: number): void {
    if (newSeed !== undefined) this.seed = newSeed;
    if (newDimension !== undefined) this.dimension = newDimension;
    this.chunks.clear();
    this.modifiedCoords.clear();
  }

  /** [Legacy/Infinite] Reconstruct from buffer */
  deserializeFromBuffer(buffer: ArrayBuffer, seed?: number, dimension?: number): void {
    if (seed !== undefined) this.seed = seed;
    if (dimension !== undefined) this.dimension = dimension;
    
    this.chunks.clear();
    this.modifiedCoords.clear();
    
    if (!buffer || buffer.byteLength === 0) return;

    const data32 = new Uint32Array(buffer);
    const HEADER_SIZE = 4;
    if (data32.length < HEADER_SIZE) return;

    const version = data32[0];
    const savedMapWidth = data32[1];
    const dataCount = data32[2];
    
    let ptr = HEADER_SIZE;
    if (version >= 2) {
      // Version 2: [x, y, packed] format
      for (let i = 0; i < dataCount; i++) {
        if (ptr + 2 >= data32.length) break;
        const x = data32[ptr++] | 0; // Convert to signed int32
        const y = data32[ptr++];
        const packed = data32[ptr++];
        
        const { chunkX, localX } = this.getChunkInfo(x);
        const chunk = this.getChunk(chunkX);
        const idx = y * CHUNK_WIDTH + localX;
        chunk[idx] = packed;
        this.modifiedCoords.add(`${x},${y}`);
      }
    } else {
      // Legacy Version 1: Index based reconstruction
      const savedHalfWidth = Math.floor(savedMapWidth / 2);
      for (let i = 0; i < dataCount; i++) {
        if (ptr + 1 >= data32.length) break;
        const savedIndex = data32[ptr++];
        const packed = data32[ptr++];
        
        const x = (savedIndex % savedMapWidth) - savedHalfWidth;
        const y = Math.floor(savedIndex / savedMapWidth);
        
        const { chunkX, localX } = this.getChunkInfo(x);
        const chunk = this.getChunk(chunkX);
        const idx = y * CHUNK_WIDTH + localX;
        chunk[idx] = packed;
        this.modifiedCoords.add(`${x},${y}`);
      }
    }
  }

  // Legacy Object support
  deserialize(data: any, seed?: number, dimension?: number): void {
    if (seed !== undefined) this.seed = seed;
    if (dimension !== undefined) this.dimension = dimension;
    this.chunks.clear();
    this.modifiedCoords.clear();
    
    if (!data) return;

    for (const [key, tileData] of Object.entries(data as Record<string, [number, number]>)) {
      const [x, y] = key.split(',').map(Number);
      const { chunkX, localX } = this.getChunkInfo(x);
      const chunk = this.getChunk(chunkX);
      const idx = y * CHUNK_WIDTH + localX;
      
      const [typeId, health] = tileData;
      const packed = (typeId & TYPE_MASK) | ((health & HP_MASK) << HP_BITS) | GEN_FLAG | MOD_FLAG;
      chunk[idx] = packed;
      this.modifiedCoords.add(`${x},${y}`);
    }
  }
}
