# ⚙️ 핵심 게임 로직 (Core Game Logic)

Drilling RPG의 모든 게임 엔진 로직은 워커 스레드(`game.worker.ts`) 내부에서 ECS 패턴에 따라 독립적으로 실행됩니다. 이 문서는 각 핵심 시스템의 알고리즘과 작동 방식을 정의합니다.

---

## 1. 물리 시스템 (Physics System)

### **A. 이동 로직 (`physicsSystem.ts`)**
- **FPS Independent**: `deltaTime`을 고려하여 프레임 레이트에 관계없이 일정한 속도로 이동합니다.
- **Velocity Verlet**: 정교한 물리 시뮬레이션을 위해 속도 기반 위치 업데이트를 수행합니다.
- **Collision Detection**: 
    - **Tile Collision**: 플레이어 주변 9칸 타일과의 AABB(Axis-Aligned Bounding Box) 충돌을 검사합니다.
    - **Entity Collision**: 몬스터와 플레이어 간의 충돌을 원형(Circle) 충돌체로 계산합니다.

### **B. 충돌 반응**
충돌 발생 시, 엔티티의 위치를 충돌면의 법선 방향으로 밀어내어(Resolve) 겹침 현상을 방지합니다.

---

## 2. 채굴 시스템 (Mining System)

### **A. 타일 파괴 메커니즘 (`miningSystem.ts`)**
- **입력 감지**: 플레이어가 바라보는 방향의 타일을 활성 타일로 지정합니다.
- **내구도 감소**: 드릴의 초당 공격 속도와 파워(`Damage`)에 따라 타일의 내구도(`Health`)를 실시간으로 차감합니다.
- **파괴 및 보상**: 타일의 내구도가 0이 되면 해당 타일을 공기(Air) 타일로 교체하고, 타일 종류에 따른 자원 아이템을 드롭합니다.

### **B. 특수 타일 공정**
- **단단한 바위**: 특정 강화 수치 이상의 드릴로만 파괴 가능합니다.
- **보석 광맥**: 확률적으로 희귀한 보석을 드롭하며, 채굴 시 추가 이펙트를 발생시킵니다.

---

## 3. 전투 및 AI 시스템 (Combat & AI System)

### **A. 몬스터 AI (`monsterAiSystem.ts`)**
- **상태 기계(Finite State Machine)**: Idle, Chase, Attack, Flit 등의 상태를 가집니다.
- **추적 알고리즘**: 플레이어와의 거리가 일정 범위(Detection Range) 이내일 때 플레이어 좌표를 향해 가속도를 부여합니다.
- **무작위 배회**: 타겟이 없을 경우 주기적으로 무작위 방향으로 느리게 이동하여 생동감을 부여합니다.

### **B. 전투 로직 (`combatSystem.ts`)**
- **데미지 공식**: `Damage = (Base_Power * Multiplier) - Target_Defense`.
- **피격 무적 시간(I-Frame)**: 플레이어나 몬스터가 피격 시 짧은 시간 동안 무적 상태가 되어 연속적인 데미지 중첩을 방지합니다.
- **부유 텍스트(Floating Text)**: 데미지 수치를 실시간으로 생성하여 메인 스레드 렌더러로 보냅니다.

---

## 4. 시스템 실행 순서 (Update Loop)

매 프레임마다 다음 순서로 시스템이 실행됩니다.

1.  **Input System**: 사용자 입력 적용.
2.  **Physics System**: 위치 업데이트 및 충돌 해결.
3.  **Mining System**: 채굴 진행 상태 업데이트.
4.  **Refinery System**: 드론 제련 자동화 로직 처리.
5.  **Spawn System**: 몬스터 및 자원 스폰 관리.
6.  **Monster AI System**: 몬스터 의사 결정.
7.  **Combat System**: 공격 판정 및 데미지 계산.
8.  **Effect System**: 파티클 및 화면 흔들림 계산.
9.  **Render System**: 최종 상태를 버퍼에 기록.

---

## 5. ECS 데이터 전송 레이아웃 (Data Layout)

워커 스레드에서 메인 스레드로 전송되는 렌더링 버퍼(`Float32Array`)는 엔티티 수량에 비례하여 크기가 고정되며, 다음과 같은 SoA 기반 스트라이드 구조를 가집니다.

- **Header (Index 0~15)**: `Entity Count`, `Timestamp`, 월드 카메라 좌표, 플레이어 위치, 화면 흔들림(Shake) 강도 등 전역 상태 기록.
- **Body (Index 16~, Stride 8)**: 각 엔티티마다 8개의 슬롯을 점유합니다.
    - 슬롯: `[Entity ID, Pos X, Pos Y, Rotation, Sprite ID, State, Type, Animation]`
