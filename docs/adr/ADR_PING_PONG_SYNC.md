# ADR-001: 🏓 핑퐁 동기화 전략 (Ping-Pong Sync Strategy)

**날짜**: 2024-04-07
**상태**: 승인됨 (Approved)
**작성자**: Drilling RPG Dev

---

## 1. 개요 (Context)

Drilling RPG는 수천 개의 엔티티를 동시에 처리해야 하는 웹 기반 게임입니다. 고성능을 위해 게임 엔진과 물리 로직을 별도의 **Web Worker** 스레드에서 실행하기로 결정했습니다. 이때 메인 스레드(UI)와 워커 스레드 간에 데이터를 어떻게 주고받을지가 성능의 병목이 됩니다.

### **고려했던 대안들:**

1.  **SharedArrayBuffer (SAB)**: 두 스레드가 같은 메모리 공간을 공유합니다. 가장 빠르지만 보안 이슈(Spectre/Meltdown)로 인해 모든 브라우저에서 사용 가능하게 하려면 특수한 HTTP 헤더(`COOP`/`COEP`) 설정이 필요하며 관리가 까다롭습니다.
2.  **JSON postMessage**: 단순하지만 대량의 데이터를 매 프레임마다 직렬화/역직렬화하는 비용이 매우 큽니다. (성능상 불가)
3.  **Transferable Ping-Pong (트리플 버퍼링)**: `ArrayBuffer`의 소유권(Transferable)을 핑퐁처럼 주고받는 방식입니다.

---

## 2. 결정 사항 (Decision)

우리는 **트리플 버퍼링(Triple Buffering)** 기반의 **Transferable Ping-Pong 전략**을 선택했습니다.

### **구조**:

- **3개의 고정된 크기의 ArrayBuffer**를 생성합니다. (Buffer A, B, C)
- **배치**:
  - **Buffer A**: 워커 스레드에서 현재 엔진 프레임의 데이터를 기록 중.
  - **Buffer B**: 메인 스레드로 전송되어 보간(Lerp) 렌더링에 사용 중.
  - **Buffer C**: 다음 프레임을 위해 워커로 반환된 유효 버퍼.
- **순환**: 워커에서 기록이 끝나면 Buffer A를 메인으로 보내고, 메인에서 사용이 끝난 Buffer B를 다시 워커로 반환(RETURN_BUFFER)하여 순환 구조를 만듭니다.

---

## 3. 결정의 배경 (Rationale)

- **제로 카피 (Zero-copy)**: 데이터 복사 없이 메모리 주소(소유권)만 이동하므로 물리적인 성능 부하가 거의 없습니다.
- **호환성**: 특수한 보안 헤더 없이 모든 모던 브라우저에서 즉시 작동합니다.
- **비정기적 동기화 방지**: 3개의 버퍼를 사용함으로써 한 스레드가 데이터를 읽는 동안 다른 스레드가 데이터를 덮어쓰는 경합 현상(Race Condition)을 완벽히 방지할 수 있습니다.
- **지터 관리 (Jitter Control)**: 워커와 메인의 프레임 속도가 다르더라도(예: 워커 60Hz, 메인 144Hz) 보간 루프를 통해 시각적으로 부드러운 화면을 제공할 수 있습니다.

---

## 4. 장단점 (Consequences)

### **장점**:

- **극강의 렌더링 부드러움**: 지연 시간(Input Lag)은 최소화하면서도 렌더링 지터(Jitter)가 거의 느껴지지 않습니다.
- **안정적인 시스템**: 메인 스레드가 무거운 작업을 하더라도(예: 모달 창 띄우기) 워커 스레드는 독립적으로 계속 돌아가 게임 중단이 없습니다.

### **단점**:

- **복잡도 증가**: 메인 스레드에서 버퍼를 다시 돌려주는(`RETURN_BUFFER`) 로직을 철저히 관리해야 합니다.
- **메모리 오버헤드**: 버퍼 3개를 유지하므로 단일 버퍼 대비 약 3배의 메모리를 점유합니다. (단, 현재 게임 규모에서 수 MB 수준으로 무시할 수 있는 수준입니다.)

---

## 5. 참고 자료

- [MDN: Transferable objects](https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects)
- [Valve: Source Engine Interpolation Strategy](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking)
