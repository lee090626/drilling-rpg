/**
 * [ECS] Entity SoA (Structure of Arrays) 데이터 구조
 * - 객체 배열 대신 타입별 배열을 사용하여 CPU 캐시 효율을 극대화하고 GC 부하를 제거합니다.
 */
export interface EntitySoA {
  capacity: number;
  count: number;
  
  // 고유 식별 및 유효성 검사 (Handle: Generation << 16 | Index)
  generation: Uint16Array;
  
  // 기본 정보
  type: Uint8Array;        // 0: none, 1: monster, 2: boss, 3: npc, 4: object, 5: projectile
  state: Uint8Array;       // 0: idle, 1: chase, 2: attack
  
  // 물리 데이터 (World 좌표)
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  
  // 전투 및 스탯
  hp: Float32Array;
  maxHp: Float32Array;
  attack: Float32Array;
  speed: Float32Array;
  lastAttackTime: Float32Array;
  /** 개별 공격 쿨타임 (ms). 모스터 정의에서 초기화. */
  attackCooldown: Float32Array;
  
  // 시각 데이터 및 히트박스
  monsterDefIndex: Uint16Array;
  spriteIndex: Uint16Array;
  width: Float32Array;
  height: Float32Array;

  // Sync optimization
  dirtyFlags: Uint8Array;   // 0: clean, 1: dirty
}

/** 
 * 엔티티를 안전하게 참조하기 위한 핸들 타입 
 * - 상위 16비트: Generation
 * - 하위 16비트: Index
 */
export type EntityHandle = number;

export class EntityManager {
  public soa: EntitySoA;
  private idMap: Map<string, EntityHandle> = new Map();

  constructor(capacity: number = 5000) {
    this.soa = {
      capacity,
      count: 0,
      generation: new Uint16Array(capacity),
      type: new Uint8Array(capacity),
      state: new Uint8Array(capacity),
      x: new Float32Array(capacity),
      y: new Float32Array(capacity),
      vx: new Float32Array(capacity),
      vy: new Float32Array(capacity),
      hp: new Float32Array(capacity),
      maxHp: new Float32Array(capacity),
      attack: new Float32Array(capacity),
      speed: new Float32Array(capacity),
      lastAttackTime: new Float32Array(capacity),
      attackCooldown: new Float32Array(capacity).fill(1000), // 기본값 1000ms
      monsterDefIndex: new Uint16Array(capacity),
      spriteIndex: new Uint16Array(capacity),
      width: new Float32Array(capacity),
      height: new Float32Array(capacity),
      dirtyFlags: new Uint8Array(capacity),
    };
  }

  /** 새로운 엔티티 생성 ($O(1)$) */
  public create(type: number, x: number, y: number, id?: string, defIndex: number = 0): EntityHandle {
    if (this.soa.count >= this.soa.capacity) {
      console.warn('[EntityManager] Capacity reached!');
      return -1;
    }

    const index = this.soa.count++;
    const handle = (this.soa.generation[index] << 16) | index;

    // ID 매핑 등록
    if (id) {
        this.idMap.set(id, handle);
    }
    
    // 기본값 초기화
    this.soa.type[index] = type;
    this.soa.monsterDefIndex[index] = defIndex;
    this.soa.x[index] = x;
    this.soa.y[index] = y;
    this.soa.vx[index] = 0;
    this.soa.vy[index] = 0;
    this.soa.state[index] = 0; // Idle
    this.soa.dirtyFlags[index] = 1; // Mark as dirty on creation
    
    return handle;
  }

  /** 
   * 엔티티 삭제 ($O(1)$ - Swap-and-Pop)
   * - 삭제할 위치에 마지막 원소를 덮어씌워 배열의 연속성을 유지합니다.
   * - 세대(Generation)를 증가시켜 기존 핸들을 무효화합니다.
   */
  public destroy(index: number) {
    if (index < 0 || index >= this.soa.count) return;

    // ID 매핑 제거 (전수 조사는 느리므로 필요 시 역방향 맵 도입 고려)
    // 여기서는 일단 간소화하여 index 기반 관리에 집중

    // 세대 증가 (기존 핸들 무효화)
    this.soa.generation[index]++;
    
    const lastIndex = --this.soa.count;
    if (index !== lastIndex) {
      // 마지막 원소의 데이터를 삭제된 위치로 이동 (Swap)
      this.soa.generation[index] = this.soa.generation[lastIndex];
      this.soa.type[index] = this.soa.type[lastIndex];
      this.soa.state[index] = this.soa.state[lastIndex];
      this.soa.x[index] = this.soa.x[lastIndex];
      this.soa.y[index] = this.soa.y[lastIndex];
      this.soa.vx[index] = this.soa.vx[lastIndex];
      this.soa.vy[index] = this.soa.vy[lastIndex];
      this.soa.hp[index] = this.soa.hp[lastIndex];
      this.soa.maxHp[index] = this.soa.maxHp[lastIndex];
      this.soa.attack[index] = this.soa.attack[lastIndex];
      this.soa.speed[index] = this.soa.speed[lastIndex];
      this.soa.lastAttackTime[index] = this.soa.lastAttackTime[lastIndex];
      this.soa.attackCooldown[index] = this.soa.attackCooldown[lastIndex];
      this.soa.monsterDefIndex[index] = this.soa.monsterDefIndex[lastIndex];
      this.soa.spriteIndex[index] = this.soa.spriteIndex[lastIndex];
      this.soa.width[index] = this.soa.width[lastIndex];
      this.soa.height[index] = this.soa.height[lastIndex];
      this.soa.dirtyFlags[index] = 1; // Mark as dirty when swapped
    }
  }

  /** Dirty flag 관리 */
  public markDirty(index: number) {
    if (index >= 0 && index < this.soa.count) {
      this.soa.dirtyFlags[index] = 1;
    }
  }

  public clearDirty(index: number) {
    if (index >= 0 && index < this.soa.count) {
      this.soa.dirtyFlags[index] = 0;
    }
  }

  public isDirty(index: number): boolean {
    return index >= 0 && index < this.soa.count && this.soa.dirtyFlags[index] === 1;
  }

  /** 특정 ID를 가진 엔티티가 활성화되어 있는지 확인 */
  public hasId(id: string): boolean {
    const handle = this.idMap.get(id);
    return handle !== undefined && this.isValid(handle);
  }

  /** 핸들이 유효한지 검사 */
  public isValid(handle: EntityHandle): boolean {
    const index = handle & 0xFFFF;
    const gen = handle >> 16;
    return index < this.soa.count && this.soa.generation[index] === gen;
  }

  /** 핸들로부터 현재 인덱스 획득 */
  public getIndex(handle: EntityHandle): number {
    return handle & 0xFFFF;
  }

  /** 모든 엔티티 데이터 초기화 (차원 이동 시) */
  public clear() {
    this.soa.count = 0;
    this.soa.generation.fill(0);
    this.soa.type.fill(0);
    this.soa.state.fill(0);
    this.soa.x.fill(0);
    this.soa.y.fill(0);
    this.soa.vx.fill(0);
    this.soa.vy.fill(0);
    this.soa.hp.fill(0);
    this.soa.maxHp.fill(0);
    this.soa.attack.fill(0);
    this.soa.speed.fill(0);
    this.soa.lastAttackTime.fill(0);
    this.soa.attackCooldown.fill(1000); // 기본값 1000ms 로 리셋
    this.soa.monsterDefIndex.fill(0);
    this.soa.spriteIndex.fill(0);
    this.soa.width.fill(0);
    this.soa.height.fill(0);
    this.soa.dirtyFlags.fill(0);
    this.idMap.clear();
  }
}
