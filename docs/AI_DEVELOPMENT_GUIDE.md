# 🤖 AI 개발 및 협업 가이드 (AI Development Guide)

이 문서는 AI 어시스턴트(Antigravity)가 이 프로젝트를 개발하고 유지보수할 때 준수해야 할 핵심 지침을 정의합니다.

---

## 1. 📂 아키텍처 준수 (FSD & ECS)

프로젝트는 **FSD (Feature-Sliced Design)** 구조와 **ECS (Entity Component System)** 패턴을 엄격히 따릅니다.

- **FSD 계층**: `app`, `widgets`, `features`, `entities`, `shared` 레이어 간의 참조 규칙을 절대적으로 준수합니다.
- **ECS 로직**: 게임 로직 수정 시 `src/features/game/ecs` 내부의 `systems`와 `components` 구조를 파괴하지 않도록 주의합니다.
- **Shared 레이어**: 모든 레이어에서 공통으로 쓰이는 데이터 구성(Config)이나 UI(Shared UI)는 `src/shared`에 위치해야 합니다.

## 2. ✍️ 주석 가이드 (Documentation & Comments)

AI는 코드 작성 시 다음과 같은 주석 규칙을 따릅니다.

- **JSDoc 사용**: 모든 공개 함수, 인터페이스, 컴포넌트에는 JSDoc 형식의 주석을 작성합니다.
  ```typescript
  /**
   * 아이템을 장착하고 통계를 갱신합니다.
   * @param itemId {string} 장착할 아이템의 ID
   * @param slotIndex {number} 장착할 슬롯 번호
   */
  ```
- **논리적 구획 주석**: 긴 함수나 복잡한 로직 블록은 한글 주석을 사용하여 가독성을 높입니다.
- **Self-Documenting Code**: 변수명과 함수명은 그 자체로 의도가 드러나도록 작성하고, 주석은 '무엇(What)'보다 '왜(Why)'에 집중합니다.

## 3. 🌿 커밋 컨벤션 (Commit Guide)

커밋은 항상 **Conventional Commits** 형식을 따르며, 한글을 사용하여 사용자에게 친절하게 설명합니다.

- **형식**: `<type>(<scope>): <한글 설명>`
- **타입 예시**:
  - `feat`: 새로운 기능 (예: 아틀라스 이전 완료)
  - `fix`: 버그 수정 (예: 인벤토리 중포 선언 수정)
  - `refactor`: 코드 구조 개선 (예: 아틀라스 좌표 동적 로딩화)
  - `docs`: 문서 수정 (예: 자산 가이드 업데이트)
  - `perf`: 성능 최적화

## 4. 🎨 UI 및 스타일링 규칙

- **Tailwind CSS 4**: 인라인 스타일을 지양하고 Tailwind 유틸리티 클래스를 사용합니다.
- **Rich Aesthetics**: 사용자에게 프리미엄 느낌을 줄 수 있는 그라데이션, 애니메이션(`animate-in`), 유리 효과(`backdrop-blur`)를 적극 활용합니다.
- **Atlas System**: 모든 UI 아이콘은 `AtlasIcon` 컴포넌트를 통해 중앙 집중식 아틀라스 에셋을 활용해야 합니다. 개별 이미지 임포트는 지양합니다.

## 5. 🚀 자동화 및 도구 활용

- **Script 활용**: 아틀라스 좌표 갱신 등 반복 작업은 `npm run update:atlas-map`과 같은 내장 스크립트를 우선적으로 사용합니다.
- **Lint Check**: 모든 작업 완료 후 `npm run lint` 등을 통해 코드 품질을 검증합니다.

## 6. 🐙 GitHub Workflow (전략)

AI는 작업의 투명성과 이력 관리를 위해 다음과 같은 GitHub 워크플로우를 권장합니다.

- **이슈 생성**: 큰 작업이나 버그 수정 시작 전, `.github/ISSUE_TEMPLATE`에 정의된 양식에 맞춰 이슈를 생성합니다. (현재 `gh` CLI 미설치 시에는 텍스트로 제안)
- **브랜치 전략**: 
  - `feat/기능명`, `fix/버그명` 과 같이 명확한 브랜치명을 사용합니다.
- **Pull Request 작성**: 
  - 작업 완료 후 `.github/PULL_REQUEST_TEMPLATE.md` 양식을 준수하여 PR을 작성합니다.
  - 관련 이슈 번호를 명시하여 (`Closes #1`) 자동 링크가 되도록 합니다.
  - 시각적 변경이 있는 경우 스크린샷이나 녹화본 경로를 포함합니다.

## 7. 📝 코딩 및 네이밍 규칙 (Coding & Naming Conventions)

개인 프로젝트의 일관성을 유지하기 위해 AI는 다음 규칙을 절대적으로 준수합니다.

- **디렉토리**: 소문자 및 `kebab-case` (예: `test-benchmark`, `game-engine`)
- **일반 로직 파일 (.ts)**: `camelCase` (예: `physicsSystem.ts`, `mineralData.ts`)
- **React 컴포넌트 파일 (.tsx)**: `PascalCase` (예: `InventoryWindow.tsx`, `GameEngine.tsx`)
- **Next.js 라우팅 특수 파일**: 소문자 (예: `page.tsx`, `layout.tsx`)
- **함수 및 변수**: `camelCase` (`handleUpgrade`, `totalGold`)
- **타입 및 인터페이스**: `PascalCase` (`interface PlayerStats`), 객체 구조 정의 시 `interface` 우선 사용
- **상수**: `SCREAMING_SNAKE_CASE` (`MAX_ENTITIES`)
- **타입 가이드라인**: `any` 타입 사용을 지양하고, 불확실할 경우 `unknown`을 사용한 후 타입 가드를 거칩니다. TypeScript `enum` 대신 `const enum` 또는 `union types`를 권장합니다.
- **스타일 가이드**: 조기 리턴(Early Return) 패턴을 적극 사용합니다.

---

> [!TIP]
> **AI 메모**: 새로운 기능을 제안할 때는 항상 기존 아키텍처와의 정합성을 먼저 검토하고, `implementation_plan.md`를 통해 사용자에게 먼저 승인을 받습니다. 이슈와 PR 템플릿은 AI가 작성할 수 있는 '공식적인 커뮤니케이션 창구'임을 잊지 마세요.
