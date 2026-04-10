# 🤖 Agents.md (Active Session Log)

> **[AI 에이전트 필수 지침]**
> 본 문서는 현재 워크스페이스의 **실시간 상태**와 **핵심 작업 규칙**을 정의합니다.
> 새로운 세션을 시작하거나 작업을 이어받을 때, **반드시 이 문서를 최우선으로 숙지하고 준수**하세요.

---

## 🎯 1. 현재 목표 및 상태 (Active Session)
> **Rule:** 작업 완료 시 `개발 진행 현황(Status)`의 해당 항목을 지워 항상 최신 상태를 유지할 것.

* **현재 작업 (Current Task):** * **다음 단계 (Next Step):** * **개발 진행 현황 (Status):** 

## ⚠️ 2. 절대 금기 사항 (Strict Don'ts)
1.  **직접적인 DOM 접근 금지:** 게임 엔진은 Web Worker 환경에서 실행됩니다. UI 레이어를 제외한 곳에서 `window`나 `document` 객체를 절대 참조하지 마세요.
2.  **임시 이미지(Placeholder) 외부 링크 금지:** 이미지가 필요할 경우 `generate_image` 도구를 사용하며, `placehold.it` 등의 외부 URL은 절대 사용하지 마세요.
3.  **FSD (Feature-Sliced Design) 아키텍처 위반 금지:** 레이어 간 단방향 의존성 규칙(Upper → Lower)을 엄격히 준수하세요.
4.  **임의적인 코드 삭제 금지:** 사용하지 않는 로직이라도 즉시 삭제하지 말고, 주석 처리 후 인간 개발자에게 반드시 확인을 요청하세요.

## 🏛️ 3. 핵심 아키텍처 (Architecture)
* **UI 레이어:** Next.js 15 + Tailwind CSS 4 (전역 상태 공유: Zustand)
* **로직 레이어:** Web Workers 활용 (ECS 패턴: System-Component 분리 설계)
* **데이터 동기화:** `Transferable Objects`를 활용한 Zero-copy 통신 구현

## 🐙 4. GitHub 협업 규칙 (Version Control)
* **브랜치 전략:** `{type}/{issue-number}-{description}` 형식을 엄격하게 따릅니다.
    * *예시:* `feat/12-shop-upgrade-logic`, `fix/45-worker-memory-leak`
* **커밋 메시지:** Conventional Commits 규약을 따르며, 상세 설명은 **한글**로 명확하게 작성합니다.
* **PR 가이드:** 작업 완료 후 PR 템플릿에 맞춰 작성하고, 관련된 Issue 번호를 반드시 링크하세요.

## 🔄 5. 작업 프로세스 (Development Workflow)
> **중요:** 모든 작업은 아래의 순서를 엄격히 준수하여 진행합니다.

1.  **이슈 할당 및 확인:** 작업 전 반드시 관련 이슈(Issue) 내용을 숙지하고, 없을 경우 사용자에게 이슈 생성을 요청하거나 텍스트로 작업 범위를 확정합니다.
2.  **브랜치 생성:** `feat/` 또는 `fix/` 등 목적에 맞는 브랜치로 전환 후 작업을 시작합니다.
3.  **코드 구현 및 테스트:** FSD 아키텍처와 금기 사항을 준수하며 코드를 작성하고, 로컬 환경(`npm run dev`)에서 검증합니다.
4.  **Agents.md 업데이트:** 작업 진행 중 및 완료 시 `Status`와 `세션 기록`을 갱신합니다.
5.  **PR 및 머지:** 작업 완료 후 PR을 생성하여 사용자에게 검토를 요청하고, 승인 후 메인 브랜치에 통합합니다.

## 📚 6. 주요 문서 참조 (References)
*작업 중 모호한 부분이 발생하면 아래 문서를 우선적으로 확인하세요.*

* **[🤖 AI 개발 가이드](docs/AI_DEVELOPMENT_GUIDE.md):** 커밋 컨벤션, 네이밍 규칙, 배포 전략 등 **코드 작성 가이드라인**
* **[🏛️ 시스템 아키텍처](docs/ARCHITECTURE.md):** ECS 구조, 스레드 간 통신, FSD 레이어 설계 등 **전체 시스템 구조**
* **[🌿 Git 전략 및 규칙](docs/GIT_STRATEGY.md):** 브랜치 전략, 커밋 메시지 컨벤션 등 **협업 규칙**
* **[⚙️ 핵심 게임 로직](docs/CORE_LOGIC.md):** 물리 계산, 타일 시스템, 엔티티 상호작용 등 **게임 엔진 세부 로직**
* **[🎨 렌더링 파이프라인](docs/RENDERING_PIPELINE.md):** PixiJS v8 활용, 아틀라스 및 쉐이더 등 **그래픽/성능 최적화**
* **[🖼️ 에셋 가이드](docs/ASSET_GUIDE.md):** 아틀라스 이미지 최적화 및 좌표 동기화 등 **자산 관리 가이드**

---
## 📝 세션 기록 (Changelog)
* **2026-04-10:** 프로젝트 루트에 `Agents.md` 도입 및 실용성 중심 내용 정제. 작업 종료 시 Status 업데이트 프로세스 의무화. (*by Antigravity*)