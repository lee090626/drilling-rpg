import { Tile, TileType, Entity } from '../../shared/types/game';
import { getMineralStats } from '../../shared/lib/tileUtils';
import { BASE_DEPTH } from '../../shared/config/constants';
import { getDimensionConfig, MonsterSpawnRule } from '../../shared/config/dimensionData';
import { MONSTERS } from '../../shared/config/monsterData';
import { BOSSES } from '../../shared/config/bossData';

/** 맵의 최대 높이 (타일 단위) */
export const MAP_HEIGHT = 1550;
/** 맵의 가로 너비 (중심 0 기준 좌우 150칸) */
export const MAP_WIDTH = 300;
export const HALF_WIDTH = 150;

/**
 * 게임 월드의 타일 데이터를 생성, 관리 및 수정하는 클래스입니다.
 * 시드 기반 절차적 생성을 사용하여 무한한 지하 세계를 구현합니다.
 */
export class TileMap {
  /** 플레이어에 의해 수정된 타일 정보를 저장하는 맵 (`x,y` 키 사용) */
  modifiedTiles: Map<string, Tile>;
  /** 월드 생성을 위한 랜덤 시드 */
  seed: number;
  /** 현재 월드의 차원(Dimension) 번호 */
  dimension: number;

  constructor(seed: number = 12345, dimension: number = 0) {
    this.seed = seed;
    this.dimension = dimension;
    this.modifiedTiles = new Map();
  }

  /**
   * 좌표와 시드를 조합하여 결정론적인 해시 값을 생성합니다.
   * 동일한 좌표에서는 항상 같은 결과가 나옵니다.
   * 
   * @param x - 타일의 X 좌표
   * @param y - 타일의 Y 좌표
   * @returns 0에서 1 사이의 난수
   */
  private hash(x: number, y: number): number {
    const h = (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453) % 1;
    return h < 0 ? h + 1 : h;
  }

  /**
   * 보간된 2D 노이즈 값을 생성합니다. (군집화용)
   */
  private noise2D(x: number, y: number): number {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = x1 + 1;
    const y2 = y1 + 1;

    const h11 = this.hash(x1, y1);
    const h21 = this.hash(x2, y1);
    const h12 = this.hash(x1, y2);
    const h22 = this.hash(x2, y2);

    const tx = x - x1;
    const ty = y - y1;

    // Smoothstep interpolation
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);

    const a = h11 + sx * (h21 - h11);
    const b = h12 + sx * (h22 - h12);
    return a + sy * (b - a);
  }

  /**
   * 지정된 좌표의 타일을 규칙에 따라 생성합니다.
   * 
   * @param x - 생성할 타일의 X 좌표
   * @param y - 생성할 타일의 Y 좌표
   * @returns 생성된 Tile 객체
   */
  generateTile(x: number, y: number): Tile {
    // 가로 범위 제한 (경계선은 파괴 불가능한 벽)
    if (Math.abs(x) > HALF_WIDTH) {
      return { type: 'wall', health: 1000000, maxHealth: 1000000 };
    }

    // 지상 섹션 (공기/표면)은 항상 비어있음
    if (y < BASE_DEPTH) {
      return { type: 'empty', health: 0, maxHealth: 0 };
    }

    const config = getDimensionConfig(this.dimension);
    let type: TileType = 'dirt';
    
    // 차원별 광물 분포 규칙 적용 (노이즈 기반 군집화)
    for (const rule of config.minerals) {
      if (!rule.minDepth || y > rule.minDepth) {
        // 설정된 스케일 사용 (기본값 6)
        const scale = rule.scale || 6;

        const noiseVal = this.noise2D(x / scale, y / (scale * 0.7));
        let currentThreshold = rule.threshold * 1.2; // 노이즈 기반 밀도 보합 계수 조정

        // 심도 기반 보정 (가장 많이 나오는 깊이 전후로 확률 감쇄)
        if (rule.peakDepth && rule.range) {
          const dist = Math.abs(y - rule.peakDepth);
          const depthFactor = Math.max(0, 1 - dist / rule.range);
          currentThreshold *= depthFactor;
        }

        // 노이즈 값이 임계값을 넘으면 해당 광물 할당
        if (noiseVal < currentThreshold) {
          type = rule.type;
          break;
        }
      }
    }

    // 보스 구역 및 특수 구조물 배치 로직
    const targetHeight = config.bossHeight;
    const bossCenterY = targetHeight - 1;
    const bossCenterX = 15;

    // 보스 코어 영역 (3x3 또는 지정된 범위)
    if (Math.abs(x - bossCenterX) <= 2 && Math.abs(y - bossCenterY) <= 2) {
      type = 'boss_core';
    } 
    // 몬스터 네스트 등 특수 타일 배치
    else if (
      config.hasMonsterNest &&
      y === bossCenterY &&
      (x === bossCenterX - 3 || x === bossCenterX + 3)
    ) {
      type = 'monster_nest';
    }

    const stats = getMineralStats(type);
    // 보스 코어는 특별히 높은 체력을 가짐
    const health = type === 'boss_core' ? 20000 : stats.health;
    
    return { type, health, maxHealth: health };
  }

  /**
   * 특정 좌표에서 초기 몬스터 배치를 결정합니다.
   */
  getInitialMonster(x: number, y: number): Entity | null {
    if (y < BASE_DEPTH + 10) return null; // 지상 근처에는 몬스터 없음

    const config = getDimensionConfig(this.dimension);
    
    // 1. 보스 체크
    const bossHeight = config.bossHeight;
    const bossCenterX = 15;
    if (y === bossHeight - 1 && x === bossCenterX) {
      const bossDef = BOSSES[0]; // 현재는 첫 번째 보스만 사용
      return {
        id: `boss_${this.dimension}_${bossDef.id}`,
        type: 'boss',
        name: bossDef.name,
        x, y,
        interactionType: 'none',
        stats: {
          hp: bossDef.stats.hp,
          maxHp: bossDef.stats.hp,
          attack: bossDef.stats.attack,
          speed: 0.01,
          defense: 100,
        },
        state: 'idle',
      };
    }

    // 2. 일반 몬스터 체크 (데이터 기반)
    const available = config.monsters.filter(m => y >= m.minDepth && (!m.maxDepth || y <= m.maxDepth));
    if (available.length === 0) return null;

    // 타일 생성과는 다른 해시를 사용하거나 더 낮은 확률 적용
    const mobHash = this.hash(x + 100, y + 100);
    
    // 해당 좌표에서 몬스터가 생성될지 결정 (가장 높은 확률 기준 혹은 첫 번째 매칭)
    // 여기서는 단순화하여 사용 가능한 몬스터 중 첫 번째로 확률에 맞는 것 선택
    for (const rule of available) {
      if (mobHash < rule.chance) {
        const mob = MONSTERS.find(m => m.id === rule.monsterId);
        if (!mob) continue;

        return {
          id: `mob_${x}_${y}_${mob.id}`,
          type: 'monster',
          name: mob.name,
          x: x, // 그리드 정렬
          y: y,
          interactionType: 'none',
          imagePath: mob.icon,
          stats: {
            hp: mob.stats.hp,
            maxHp: mob.stats.hp,
            attack: mob.stats.attack,
            speed: mob.stats.speed,
            defense: mob.stats.defense,
          },
          state: 'idle',
        };
      }
    }

    return null;
  }

  /**
   * 특정 좌표의 타일 정보를 가져옵니다. 수정된 데이터가 있으면 우선적으로 반환합니다.
   * 
   * @param x - 타일의 X 좌표
   * @param y - 타일의 Y 좌표
   * @returns 해당 위치의 Tile 객체 또는 범위를 벗어난 경우 null
   */
  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= MAP_HEIGHT) return null;
    
    const key = `${x},${y}`;
    if (this.modifiedTiles.has(key)) {
      return this.modifiedTiles.get(key)!;
    }
    
    return this.generateTile(x, y);
  }

  /**
   * 타일에 데미지를 가하고, 파괴 여부를 저장합니다.
   * 
   * @param x - 타일의 X 좌표
   * @param y - 타일의 Y 좌표
   * @param amount - 가할 데미지 양
   * @returns 타일이 파괴되었으면 true, 아니면 false
   */
  damageTile(x: number, y: number, amount: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile || tile.type === 'empty' || tile.type === 'wall') return false;

    tile.health -= amount;
    
    const key = `${x},${y}`;
    if (tile.health <= 0) {
      tile.type = 'empty';
      tile.health = 0;
    }
    // 수정된 상태를 맵에 저장하여 영속성 유지
    this.modifiedTiles.set(key, tile);
    
    return tile.health <= 0;
  }

  /**
   * 저장용 데이터를 생성합니다. 원본과 다른(수정된) 타일만 추출합니다.
   * 
   * @returns `{좌표키: [타일ID, 현재체력]}` 형태의 객체
   */
  serialize(): Record<string, [number, number]> {
    const modified: Record<string, [number, number]> = {};
    
    this.modifiedTiles.forEach((tile, key) => {
      const [x, y] = key.split(',').map(Number);
      const original = this.generateTile(x, y);
      
      // 원본 생생값과 다른 경우에만 저장 공간 절약을 위해 포함
      if (tile.type !== original.type || tile.health !== original.health) {
        const typeIdx = TILE_TYPE_TO_ID[tile.type] ?? 0;
        modified[key] = [typeIdx, tile.health];
      }
    });
    
    return modified;
  }

  /**
   * 저장된 데이터를 기반으로 타일 맵 상태를 복원합니다.
   * 
   * @param data - 불러온 타일 데이터 객체
   * @param seed - 월드 시드 (선택 사항)
   * @param dimension - 차원 번호 (선택 사항)
   */
  deserialize(data: any, seed?: number, dimension?: number): void {
    if (seed !== undefined) this.seed = seed;
    if (dimension !== undefined) this.dimension = dimension;
    
    this.modifiedTiles.clear();
    if (!data) return;

    for (const [key, tileData] of Object.entries(data as Record<string, [number, number]>)) {
      let x, y;
      if (key.includes(',')) {
        [x, y] = key.split(',').map(Number);
      } else {
        // 기존 인덱스 기반 데이터 호환성을 위한 처리
        const index = Number(key);
        x = index % 31;
        y = Math.floor(index / 31);
      }

      const [typeIdx, health] = tileData;
      const type = ID_TO_TILE_TYPE[typeIdx] || 'dirt';
      const stats = getMineralStats(type);

      this.modifiedTiles.set(`${x},${y}`, {
        type,
        health: health,
        maxHealth: stats.health,
      });
    }
  }
}

/** 타일 타입을 숫자 ID로 매핑 (저장 효율성 위함) */
const TILE_TYPE_TO_ID: Record<TileType, number> = {
  empty: -1,
  dirt: 0,
  stone: 3,
  coal: 5,
  iron: 6,
  gold: 7,
  diamond: 8,
  emerald: 20,
  ruby: 21,
  sapphire: 22,
  uranium: 23,
  obsidian: 24,
  lava: 25,
  dungeon_bricks: 9,
  boss_core: 32,
  monster_nest: 31,
  monster: 34,
  wall: 4,
  portal: 10,
  boss_skin: 33,
  iron_ingot: 50,
  gold_ingot: 51,
  polished_diamond: 52,
};

/** 숫자 ID를 타일 타입으로 역매핑 */
const ID_TO_TILE_TYPE: Record<number, TileType> = Object.entries(TILE_TYPE_TO_ID).reduce((acc, [key, value]) => {
  acc[value as number] = key as TileType;
  return acc;
}, {} as Record<number, TileType>);
