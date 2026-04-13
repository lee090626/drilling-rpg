/**
 * [ECS] 고성능 공간 분할 그리드 (Spatial Hash Grid)
 * - $O(N^2)$ 근접 판정 및 충돌 체크를 $O(N)$으로 최적화합니다.
 */
export class SpatialHash {
  private cellSize: number;
  private grid: Map<number, number[]> = new Map();
  // 쿼리 시 중복 제거를 위한 재사용 배열 및 비트맵
  private queryResults: number[] = [];
  private visited: Uint8Array;

  constructor(cellSize: number = 120) {
    this.cellSize = cellSize;
    // 엔티티 ID가 5000개라고 가정할 때 넉넉하게 할당
    this.visited = new Uint8Array(10000);
  }

  /** 그리드 가상 초기화 (배열 객체는 유지하고 길이만 0으로) */
  public clear() {
    for (const cell of this.grid.values()) {
      cell.length = 0;
    }
  }

  /** 엔티티를 그리드에 등록 (AABB 대응) */
  public insert(id: number, x: number, y: number, width: number = 60, height: number = 60) {
    const xStart = Math.floor(x / this.cellSize);
    const yStart = Math.floor(y / this.cellSize);
    const xEnd = Math.floor((x + width) / this.cellSize);
    const yEnd = Math.floor((y + height) / this.cellSize);

    for (let iy = yStart; iy <= yEnd; iy++) {
      for (let ix = xStart; ix <= xEnd; ix++) {
        const key = this.getKey(ix, iy);
        let cell = this.grid.get(key);
        if (!cell) {
          cell = [];
          this.grid.set(key, cell);
        }
        cell.push(id);
      }
    }
  }

  /** 특정 좌표 주변의 엔티티 목록 검색 (할당 제로 구현) */
  public query(x: number, y: number, radius: number): number[] {
    const results = this.queryResults;
    results.length = 0;

    const ixStart = Math.floor((x - radius) / this.cellSize);
    const iyStart = Math.floor((y - radius) / this.cellSize);
    const ixEnd = Math.floor((x + radius) / this.cellSize);
    const iyEnd = Math.floor((y + radius) / this.cellSize);

    let count = 0;
    for (let iy = iyStart; iy <= iyEnd; iy++) {
      for (let ix = ixStart; ix <= ixEnd; ix++) {
        const cell = this.grid.get(this.getKey(ix, iy));
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const id = cell[i];
            if (this.visited[id] === 0) {
              this.visited[id] = 1;
              results.push(id);
              count++;
            }
          }
        }
      }
    }

    // 다음 호출을 위해 visited 비트맵 리셋
    for (let i = 0; i < count; i++) {
      this.visited[results[i]] = 0;
    }

    return results;
  }

  /** 그리드 좌표를 고유 키(정수)로 변환 */
  private getKey(ix: number, iy: number): number {
    return ix * 100000 + iy;
  }
}
