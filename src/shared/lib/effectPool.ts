/**
 * [초고최적화] 객체 풀링(Object Pooling) 시스템
 * - 가비지 컬렉션(GC) 부하를 줄이기 위해 파티클 및 텍스트 객체를 재사용합니다.
 */

export interface Poolable {
  active: boolean;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[];
  private nextAvailableIndex: number = 0;

  constructor(factory: () => T, size: number) {
    this.pool = Array.from({ length: size }, factory);
  }

  /** 풀에서 사용 가능한 객체를 하나 가져옵니다. */
  get(): T | null {
    // 순환 탐색으로 빈 객체 찾기
    const start = this.nextAvailableIndex;
    do {
      const obj = this.pool[this.nextAvailableIndex];
      this.nextAvailableIndex = (this.nextAvailableIndex + 1) % this.pool.length;

      if (!obj.active) {
        obj.active = true;
        return obj;
      }
    } while (this.nextAvailableIndex !== start);

    return null; // 모든 객체가 사용 중임
  }

  /** 모든 객체를 순회하며 작업 수행 */
  forEachActive(callback: (obj: T) => void) {
    for (const obj of this.pool) {
      if (obj.active) {
        callback(obj);
      }
    }
  }

  /** 모든 객체 반환 */
  getPool() {
    return this.pool;
  }
}
