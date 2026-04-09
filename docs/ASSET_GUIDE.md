# [자산 가이드] 에셋 추가 및 아틀라스 파이프라인

이 문서는 게임 에셋을 추가하고 아틀라스 시스템에 등록하기 위한 전체 파이프라인을 설명합니다.

---

## 1. 폴더 구조 및 명명 규칙

모든 원본 에셋(raw assets)은 `src/shared/assets/` 하위에 카테고리별로 관리됩니다.

| 폴더 | 용도 | 파일 명명 규칙 | 권장 해상도 | 포맷 |
| :--- | :--- | :--- | :--- | :--- |
| `minerals/` | 광물 아이템 아이콘 | `PascalCaseIcon.png` (예: `SapphireIcon.png`) | **128*128** | PNG (투명) |
| `tiles/` | 맵 타일 이미지 | `snake_case.png` (예: `sapphire.png`) | **128×128** | PNG |
| `drills/` | 드릴 장비 이미지 | `PascalCaseDrill.png` (예: `GoldDrill.png`) | 자유 (세로형 권장) | PNG (투명) |
| `rune/` | 룬 스킬 아이콘 | `PascalCaseRune.png` (예: `AttackRune.png`) | **1024×1024** | PNG (투명) |
| `entities/` | 몬스터/보스 | `PascalCase.png` (예: `PebbleGolem.png`) | 256×256 ~ 1024×1024 | PNG (투명) |
| `ui/icons/` | UI 아이콘 | `PascalCaseIcon.webp` | 자유 | **WebP** |
| `world/` | 월드 오브젝트 | `PascalCase.png` (예: `Player.png`) | 자유 | PNG (투명) |

---

## 2. 현재 등록된 에셋 전체 목록

### `atlasMap`의 키 (`AtlasIconName`) 목록

| 키 (AtlasIconName) | 원본 파일 | 카테고리 |
| :--- | :--- | :--- |
| `gold` | `MoneyIcon.webp` | UI |
| `status` | `StatusIcon.webp` | UI |
| `inventory` | `InventoryIcon.webp` | UI |
| `book` | `BookIcon.webp` | UI |
| `settings` | `SettingsIcon.webp` | UI |
| `dirt_icon` | `DirtIcon.png` | 광물 아이콘 |
| `stone_icon` | `StoneIcon.png` | 광물 아이콘 |
| `coal_icon` | `CoalIcon.png` | 광물 아이콘 |
| `iron_icon` | `IronIcon.png` | 광물 아이콘 |
| `gold_icon` | `GoldIcon.png` | 광물 아이콘 |
| `diamond_icon` | `DiamondIcon.png` | 광물 아이콘 |
| `emerald_icon` | `EmeraldIcon.png` | 광물 아이콘 |
| `ruby_icon` | `RubyIcon.png` | 광물 아이콘 |
| `sapphire_icon` | `SapphireIcon.png` | 광물 아이콘 ⚠️ 저해상도(128px) 교체 필요 |
| `dirt_tile` ~ `obsidian_tile` | `dirt.png` 등 | 맵 타일 |
| `wall_tile` | `wall.png` | 맵 타일 |
| `dungeon_bricks_tile` | `dungeon_bricks.png` | 맵 타일 |
| `rusty_drill` ~ `emerald_drill` | `RustyDrill.png` 등 | 드릴 |
| `attack_rune` ~ `crit_dmg_rune` | `AttackRune.png` 등 | 룬 |

> [!WARNING]
> **미등록 에셋**: `portal.png`, `lava.png`는 원본 파일이 없어 아틀라스에 포함되지 않습니다.
> 게임 코드에서 `portal_tile`, `lava_tile`은 임시로 다른 타일로 대체된 상태입니다.
>
> **오타 주의**: `EmeralDrill.png`는 파일명에 오타(`Emeral`)가 있습니다. 원본 파일명과 일치하므로 **그대로 유지**합니다.

---

## 3. 아틀라스 파이프라인 (전체 흐름)

```
src/shared/assets/**/*.png,*.webp
          │
          ▼
  npm run optimize:atlas        ← scripts/generate-atlas.mjs
  (WebP 아틀라스 패킹)
          │
          ▼
  public/assets/game-atlas-{N}.webp  +  game-atlas-{N}.json
          │
          ▼
  npm run update:atlas-map      ← scripts/generateAtlasMap.js
  (좌표 동기화)
          │
          ▼
  src/shared/config/atlasMap.ts  (자동 생성, 직접 수정 금지)
          │
          ▼
  <AtlasIcon name="키이름" />   ← UI에서 사용
```

---

## 4. 새 에셋 추가 절차

### A. 광물 타일만 추가 (AtlasIcon UI 불필요)

1. 타일 이미지를 `src/shared/assets/tiles/` 에 저장
2. 아틀라스 재패킹:
   ```bash
   npm run optimize:atlas
   ```
3. 필요시 `mineralData.ts`의 해당 광물에 `tileImage` 키 연결

---

### B. 광물 아이콘/드릴/룬 등 UI(`AtlasIcon`)에서 사용

> [!IMPORTANT]
> **두 파일을 모두 동기화해야 합니다!**
> `atlasFiles.ts`와 `scripts/generateAtlasMap.js`의 `ATLAS_FILE_MAPPING`은 현재 **중복** 관리됩니다.
> 하나만 수정하면 반영이 안됩니다.

**Step 1**: 이미지를 알맞은 경로에 저장
```
예) src/shared/assets/minerals/UraniumIcon.png  (1024×1024)
```

**Step 2**: `src/shared/config/atlasFiles.ts` 에 매핑 추가
```typescript
export const ATLAS_FILE_MAPPING = {
  // ... 기존 항목들 ...
  uranium_icon: 'UraniumIcon.png',  // ← 추가
} as const;
```

**Step 3**: `scripts/generateAtlasMap.js` 의 `ATLAS_FILE_MAPPING`에도 동일하게 추가
```javascript
const ATLAS_FILE_MAPPING = {
  // ... 기존 항목들 ...
  uranium_icon: 'UraniumIcon.png',  // ← 동일하게 추가
};
```

**Step 4**: 아틀라스 재생성 및 좌표 동기화
```bash
npm run optimize:atlas
npm run update:atlas-map
```

**Step 5**: UI에서 사용
```tsx
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

<AtlasIcon name="uranium_icon" size={48} />
```

**Step 6**: `mineralData.ts`에서 `image` 필드 연결
```typescript
{
  key: 'uranium',
  image: 'uranium_icon',   // AtlasIconName
  tileImage: 'uranium_tile',
  ...
}
```

---

## 5. `AtlasIcon` 컴포넌트 사용법

```tsx
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

// 기본 사용
<AtlasIcon name="gold_icon" />

// 크기 지정 (px 단위)
<AtlasIcon name="diamond_icon" size={64} />

// className 추가
<AtlasIcon name="ruby_icon" size={32} className="my-icon" />
```

- `name`: `AtlasIconName` 타입 — `atlasFiles.ts`에 등록된 키만 사용 가능
- `size`: 렌더링 크기(px), 기본값 `32`
- 내부적으로 CSS `background-position/size`를 이용해 아틀라스에서 스프라이트를 잘라냅니다

---

## 6. 주의 사항 및 알려진 이슈

| 항목 | 내용 |
| :--- | :--- |
| **스크립트 중복** | `atlasFiles.ts`와 `generateAtlasMap.js`의 매핑이 이중 관리됨. 항상 두 곳 모두 수정 |
| **아이콘 해상도** | 광물 아이콘은 1024×1024 필수. `SapphireIcon.png`은 현재 128×128(교체 필요) |
| **아틀라스 최대 크기** | 2048×2048. 현재 6개의 아틀라스(game-atlas-0~5)에 50개 스프라이트 분산 |
| **portal/lava 타일** | 에셋 미존재. 코드에서 `wall_tile`/`dungeon_bricks_tile`로 임시 대체 중 |
| **EmeralDrill 오타** | 파일명이 `EmeralDrill.png`(d 누락). 원본 파일명이므로 그대로 유지 |
| **atlasMap.ts 직접 수정 금지** | 자동 생성 파일. `update:atlas-map` 스크립트로만 갱신 |
