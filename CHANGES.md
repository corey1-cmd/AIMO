# AIMO — v6n+ (Phase 2 디자인 리프레시 완료)

## 라운드 요약

이번 라운드에서 **Phase 2.B → 2.C → 2.D → 2.E** 까지 자동 진행하여 디자인 리프레시 전체를 완료했습니다.

PRD §5.1 Sepia Neutral 팔레트가 모든 페이지에 적용되었고, Analysis / Record 페이지는 4단계 흐름 (Summary → Insights → Exploration → Detailed Data) 으로 재구성되었습니다.

---

## A. Phase 2.B — Analysis 페이지 (4단계 흐름)

**`src/App.jsx` AnalysisPage 전면 재작성**

### Stage 1 — Summary
4개 KPI 카드 (1366px+ 첫 화면 가시성 확보):
- 총 기록 (필터 적용 시 표시)
- 평균 소요 (Xh Ym 포맷)
- 평균 속도 (역수 모델 y%, 100% = 예상과 동일)
- Efficiency Score (합성 점수, ?버튼 호버 시 산식 툴팁)

### Stage 2 — Insights
- 좌: PlannedVsActualChart (7일 예상 vs 실제, hover 툴팁)
- 우: InsightStatement (자동 생성 NLP 인사이트, 최대 3개)

### Stage 3 — Exploration
3축 FilterBar (모든 mutually exclusive):
- 유형 (전체 / 카테고리별)
- 기간 (오늘 / 7일 / 30일 / 90일 / 전체)
- 정렬 (최신순 / 오래된순 / 빠른순 / 느린순)

### Stage 4 — Detailed Data
- strict craft Table — 숫자 우측 정렬, 단일 줄 날짜 (YYYY.MM.DD)
- 속도 표시 토글: **배수** (1.33×) / **증감** (+33%)
- 상태별 sepia 색상 (good/warn/crit)

**`src/components/v2/PlannedVsActualChart.jsx` 신규**: 차트 프리미티브
- 실선/점선 두 라인 (예상/실제)
- 호버 시 십자 가이드 + 툴팁 (날짜/예상/실제 분 단위)

---

## B. Phase 2.C — Record 페이지 (lite 4단계)

**`src/App.jsx` RecordPage 전면 재작성**

### Stage 1 lite
2개 KPI 카드:
- 저장된 기록 (전체 누적)
- 이번 주 (지난 7일)

### Stage 3 — Exploration
3축 FilterBar:
- 유형 / 상태 (전체/저장됨/미저장) / 정렬

### Stage 4 — Detailed Data
- 9개 컬럼 (작업 / 유형 / 단계 / 예상 / 실제 / 속도 / 날짜 / 저장 / 액션)
- `SaveToggle` (저장 ↔ ✓ 저장됨 명확한 affordance)
- `DeleteIconButton` (휴지통 SVG, hover 시 statusCrit 강조)
- 행 클릭 시 → `/record/{id}` 상세

기존 `FilterPill`, `SortDropdown`, `RecordTable`, `fmtKor` 모두 제거됨.

---

## C. Phase 2.D — 토큰 마이그레이션

### styles.js — buildCSS 내부 토큰 매핑
원본 v1 T 필드 인자를 무시하고 함수 내부에서 v2 Sepia Neutral 값으로 재정의.
모든 CSS 클래스 정의는 그대로 유지하면서 색상만 일괄 교체:
- `T.accent` (deep forest) → sepia brown `#2F241E`
- `T.accent2` (electric mint) → muted warm brown `#8C6F5A`
- `T.bgRoot` → warm paper `#F4F1EC`
- 하드코딩된 ambient orb rgba 값들 (mint/forest) → sepia/accent 계열로 재구성
- ::selection / ::-webkit-scrollbar 도 sepia 톤으로

### 컴포넌트 일괄 마이그레이션 (15개 파일)
`/home/claude/_migrate_t2.py` 자동화 스크립트 사용:

| 변경 패턴 | 매핑 |
|---|---|
| `T.color.primary` | `T2.color.primary` |
| `T.color.electricMint` | `T2.color.accent` |
| `T.color.mintSoft` | `T2.color.surfaceSoft` |
| `T.color.textPrimary` | `T2.color.text` |
| `T.color.textOnDark` | 리터럴 `'#FFFFFF'` |
| `T.glass.dark` | 리터럴 `'rgba(28, 26, 24, 0.92)'` |
| `T.glass.blur` | 리터럴 `'20px'` |
| `T.font_.familyDisplay` | `T2.font.familyDisplay` |
| `T.font_.weight.semibold` | `T2.font.weightSemibold` |
| `T.radius.pill` | 리터럴 `9999` |
| `T.font_.size.display/body/caption/...` | 리터럴 `32/14/12/...` |
| ... | ... |

마이그레이션된 파일:
- AIMOInfoCard, ActiveSessionsCard, AddTaskButton, AnalyzeCTA
- CalendarPanel, FocusDashboard, FocusInline, GoalMemoCard
- ParserErrorCard, RightPanel, TaskInputCard, TodayOverview
- WorkflowHeader, AuthButton

### App.jsx 마이그레이션
50개의 `T.*` 참조 → `T2.*` 또는 리터럴로 교체.
NavBar, MainPage, FocusPage, SettingsPage, Library, Learning, RecordDetailPage 모두 sepia.

### Bug fix during migration
`backdropFilter: T.glass.blur('Nav')` 같은 함수 호출 패턴이 `'20px'Nav` 로 잘못 변환되어 빌드 실패. 정상 CSS 값 `'blur(20px)'` 로 수정.

---

## D. Phase 2.E — 검수 결과

| 검수 항목 | 결과 |
|---|---|
| App.jsx에서 `T.color/font_/radius/glass/shadow` 잔존 | **0** ✅ |
| components/*.jsx에서 `T.*` 잔존 | **0** ✅ |
| T2 import 누락 파일 | **0** ✅ |
| DecorativeWave 사용처 | Settings 1회만 (PRD §5.4 만족) ✅ |
| 빌드 통과 (`npx vite build`) | ✅ |
| Puppeteer 자동화 테스트 | Analysis/Record/Main 모두 0 errors ✅ |

남은 v1 토큰 참조:
- `constants.js`: `T` (v1) export — 의도된 backward compat
- `useTilt.js` 1개 폴백 색상 — CSS variable과 함께 사용되어 시각적 영향 없음

---

## 변경 파일 (총 32개, 신규 9개)

신규 (Phase 2.A + 2.B):
```
src/lib/efficiency.js
src/lib/insights.js
src/components/v2/KpiCard.jsx
src/components/v2/EfficiencyScore.jsx
src/components/v2/InsightStatement.jsx
src/components/v2/FilterBar.jsx
src/components/v2/Table.jsx
src/components/v2/PlannedVsActualChart.jsx  ← Phase 2.B 추가
PRD.md (§5.1 Sepia 팔레트)
Build-Process-Plan.md
```

마이그레이션 (Phase 2.D):
```
src/App.jsx                               ← 50건 T → T2
src/styles.js                             ← buildCSS 내부 v2 매핑
src/constants.js                          ← T2 추가 (v1 T 보존)
src/auth/AuthButton.jsx
src/components/AIMOInfoCard.jsx
src/components/ActiveSessionsCard.jsx
src/components/AddTaskButton.jsx
src/components/AnalyzeCTA.jsx
src/components/CalendarPanel.jsx
src/components/FocusDashboard.jsx
src/components/FocusInline.jsx
src/components/GoalMemoCard.jsx
src/components/ParserErrorCard.jsx
src/components/RightPanel.jsx
src/components/TaskInputCard.jsx
src/components/TodayOverview.jsx
src/components/WorkflowHeader.jsx
```

문서:
```
README.md                                ← Phase 2 완료 반영
```

⚠️ **수동 삭제 필요** (이전 라운드부터 누적):
```bash
rm -f src/components/QuickEntry.jsx
rm -f src/components/Top3.jsx
rm -f src/components/RecentCompleted.jsx
```

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
rm -f src/components/QuickEntry.jsx src/components/Top3.jsx src/components/RecentCompleted.jsx
npm install
npm run dev
```

## 시각 변화 요약

**Before (v6m)**:
- Deep forest + electric mint
- 차가운 오프화이트 배경 + mint orb 광원
- Analysis 페이지: 도넛 + 라디얼 + 추이 카드 형태
- Record 페이지: FilterPill + SortDropdown 분리

**After (v6n+)**:
- Sepia brown + muted warm brown
- 따뜻한 페이퍼 배경 + sepia/accent orb 광원
- Analysis 페이지: 4-stage 흐름 (KPI 4-up → 차트+인사이트 → 필터바 → 테이블)
- Record 페이지: KPI 2-up → 통합 필터바 → strict craft 테이블

## 다음 라운드 — 사용자 명령 대기

- **Phase 3** UI 통합 (캘린더 보내기 / Focus 캘린더 주입 / 이동 시간 보정)
- **시간 추정 외부 추론** 구현 (E안 — 4단계 Resolver)

각 작업은 README.md 의 §2 진행 명령 항목에 따라 명시적 명령 시 시작.
