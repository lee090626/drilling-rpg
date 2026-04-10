# Drilling RPG 🛠️💎

**Drilling RPG**는 웹 브라우저에서 즐길 수 있는 고성능 탑다운 채굴 액션 서바이벌 게임입니다. 끝없는 심연을 탐험하며 자원을 채집하고, 장비를 강화하며, 강력한 보스들에 맞서 생존하세요.

이 프로젝트는 최신 웹 기술과 게임 개발 기법을 결합하여, 브라우저 환경에서도 끊김 없는 144Hz 렌더링과 복잡한 물리 계산을 구현한 **기술 집약적 오픈 소스 게임 엔진**의 쇼케이스이기도 합니다.

---

## ⚡ 주요 특징 (Key Features)

- **무한한 심연 탐험**: 절차적 생성(Procedural Generation)을 통해 매번 새로운 지형과 자원을 탐험합니다.
- **고성능 하이브리드 엔진**: FSD 아키텍처와 ECS 패턴을 결합하여 수천 개의 엔티티를 동시에 처리합니다.
- **웹 워커(Web Worker) 기반 멀티스레딩**: 게임 로직과 물리 계산을 워커 스레드로 분리하여 UI 지연(Jank)을 완벽히 제거했습니다.
- **심화된 성장 시스템**: 드릴, 드론, 유물 강화 및 스킬 룬 조합을 통한 독창적인 빌드 구축이 가능합니다.
- **부드러운 시각 경험**: PixiJS v8과 트리플 버퍼링(Triple Buffering)을 활용한 초고주사율 렌더링을 지원합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### **Core**
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Tailwind CSS 4

### **Game Engine**
- **Rendering**: [PixiJS v8](https://pixijs.com/) (with OffscreenCanvas)
- **Architecture**: FSD (Feature-Sliced Design) + ECS (Entity Component System)
- **Concurrency**: Web Workers (Multi-threading)
- **Optimization**: SoA (Structure of Arrays), Triple Buffering, Zero-copy Transferables

---

## 🏗️ 아키텍처 요약 (Architecture Overview)

이 프로젝트는 **하이브리드 아키텍처**를 채택하여 관리 효율성과 성능이라는 두 마리 토끼를 잡았습니다.

1.  **UI 레이어 (Main Thread)**: React와 Next.js를 사용하여 HUD, 메뉴, 인벤토리 등 복잡한 UI를 구성합니다.
2.  **게임 루프 (Worker Thread)**: 실제 게임의 로직과 물리, 렌더링 엔진은 Web Worker 내부에서 독립적으로 실행됩니다.
3.  **동기화 브리지**: 트리플 버퍼링 기술을 통해 메인 스레드와 워커 스레드 간의 데이터를 지연 없이 주고받으며 보간(Interpolation)을 처리합니다.

상세한 내용은 [Architecture Documentation](docs/ARCHITECTURE.md)를 참조하세요.

---

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬에서 실행하기 위한 단계입니다. 에셋 관련 추가 작업이 필요하다면 `docs/ASSET_GUIDE.md`를 참고하세요.

```bash
# 1. 의존성 설치
npm install

# 2. 에셋 최적화 및 좌표 동기화 (최초 실행 시 필수)
npm run optimize:atlas

# 3. 개발 서버 실행
npm run dev
```

서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 게임을 즐기실 수 있습니다.

---

## 📚 문서 (Documentation)

프로젝트의 심층적인 구조와 개발 가이드는 `docs/` 디렉토리에서 확인할 수 있습니다.

- [📖 용어 사전](docs/GLOSSARY.md)
- [🏛️ 시스템 아키텍처](docs/ARCHITECTURE.md)
- [⚙️ 핵심 게임 로직](docs/CORE_LOGIC.md)
- [🎨 렌더링 파이프라인](docs/RENDERING_PIPELINE.md)
- [🤖 AI 개발 가이드](docs/AI_DEVELOPMENT_GUIDE.md)

---

## 📄 라이선스 (License)

이 프로젝트는 MIT 라이선스를 따릅니다.
