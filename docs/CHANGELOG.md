# 🗓️ 변경 이력 (Changelog)

Drilling RPG 프로젝트의 주요 업데이트 및 마일스톤 기록입니다.

---

## [0.1.0] - 2024-04-07 (최신)

### 🚀 기능 추가 (Added)

- **Web Worker 기반 게임 루프**: 고성능 물리 및 렌더링 동기화 엔진 기본 구현.
- **FSD 아키텍처 도입**: 프로젝트의 폴더 구조를 `src/(app, entities, features, shared, widgets)`로 개편.
- **ECS (Entity Component System)** 패턴 기반 몬스터 AI 및 전투 시스템.
- **PixiJS v8 전환**: OffscreenCanvas 지원 및 최신 렌더 모듈 활용.
- **자동 강화 및 드론 제련**: Idle RPG의 핵심 루프인 아이템 제련 및 업그레이드 기능 추가.
- **저장 시스템**: LocalStorage 연동 및 워커-메인 스레드 간 세이브 데이터 동기화 관리.

### ⚡ 성능 최적화 (Optimized)

- **트리플 버퍼링(Triple Buffering)**: 144Hz 주사율에서도 지연 없는 부드러운 렌더링 구현.
- **텍스처 아틀라스(Texture Atlas)**: 스프라이트 시트 제너레이터를 통한 렌더 콜(Draw Call) 감소.
- **제로 카피(Zero-copy)**: `Transferable` 객체를 사용한 메인-워커 데이터 전송 최적화.
- **SoA (Structure of Arrays)**: 가비지 컬렉션 최소화 및 메모리 효율을 위한 데이터 구조 고도화.

---

## [0.0.5] - 2024-04-05

### 🚀 기능 추가 (Added)

- **기본 채굴 시스템**: 타일 파괴 및 자원 드롭 메커니즘.
- **Zustand 상점**: 기초적인 업그레이드 상점 기능 UI 데모.

---

## 🛠️ 향후 로드맵 (Upcoming)

- [ ] **멀티 유닛 전투**: 복수 드론 및 펫(Pet) 시스템의 대규모 전투 최적화.
- [ ] **온라인 랭킹**: Cloudflare Workers KV를 활용한 전역 랭킹 시스템 연동.
- [ ] **스킬 트레이너**: 사용자가 직접 스킬 조합을 시뮬레이션할 수 있는 연구소(Laboratory) 시스템 확장.
