# AIMO — 작업 현황 및 향후 작업 계획

> **목적**: 진행 중인 변경 사항과 결정 대기 항목을 한 곳에서 관리하여 작업 누락 방지.
> **최종 업데이트**: v6n+ (Phase 2 디자인 리프레시 완료)

---

## 1. 현재까지 완료된 작업

### 디자인 시스템 기반 (v6a–v6d)
- 좌측 다크 통합 박스 + 우측 라이트 박스 (1:3 비율)
- 1920×1080 FHD 기준 레이아웃, 격자 패턴 제거

### 분석 흐름 인-페이지 처리 (v6e)
- 메인 페이지에서 분석 → 분석 중 → 결과가 같은 박스 안에서 처리

### 학습 데이터 관리 (v6f)
- AuthButton 드롭다운 (학습 데이터 / 설정 / 로그아웃)
- `/learning` 페이지

### Focus 통합 + 역수 속도 (v6g–v6h)
- `/focus` 와 `/focus/session` 통합
- `getSpeedY(x) = round(10000/x, 2)` 역수 모델

### 다중 세션 + Focus 재구성 (v6i–v6j)
- `activePlans` 배열 + `activeSessionId`
- `ActiveSessionsCard`, `SessionTimelineCard`, `FixedDeadlineCard`
- 일시 정지 / 재개

### Phase 1 — 외부 연동 + 사이드바 (v6k–v6m)
- Analysis 페이지 로딩 버그 수정
- `geo.js`, `maps.js`, `calendar.js` 외부 연동 인프라
- `/settings` 페이지 + 자동 검증 흐름
- 좌측 사이드바: Recent → CalendarPanel, Top 3 → GoalMemoCard

### Phase 2 — 디자인 리프레시 (v6n+) ✅ 완료
- **2.A**: T2 토큰 (Sepia Neutral 팔레트) + v2 프리미티브 5개 + lib 2개
- **2.B**: Analysis 페이지 4단계 흐름 (Summary → Insights → Exploration → Detailed Data)
- **2.C**: Record 페이지 4단계 흐름 (lite, no Stage 2)
- **2.D**: Focus / Main / Settings 토큰 마이그레이션 — App.jsx + 15개 컴포넌트 T → T2
- **2.E**: Acceptance audit — 잔존 T 토큰 0, DecorativeWave는 Settings에만 사용

---

## 2. 향후 작업 (남은 항목)

### 🟢 시간 추정 외부 추론 구현 — 기획 완료, 구현 대기

**채택안: E안 — 내부 사전 + 휴리스틱 + 학습 보정 하이브리드**

#### 4단계 Resolver
1. 사용자 학습 데이터 (n≥3) — 신뢰도 0.95
2. 정확 사전 매칭 — 신뢰도 0.85
3. 키워드 휴리스틱 — 신뢰도 0.65
4. 카테고리 폴백 — 신뢰도 0.40

#### 모듈 구성
```
src/time-estimation/
├── dictionary.ko.js      # 정확 100 + 키워드 200
├── dictionary.en.js
├── normalizer.js
├── tokenizer.js
├── resolver.js
├── confidence.js
└── index.js
```

#### UI 신뢰도 표시
- ≥ 0.85 → 일반
- 0.65–0.85 → "추정" 라벨
- < 0.65 → 점선 보더 + 툴팁

**진행 명령**: 사용자가 "시간 추정 구현 시작" 명령 시 진행 (모델 정확도 작업은 명령 받기 전 작업 금지).

### 🟡 Phase 3 — 외부 연동 UI 통합

인프라는 v6l 완료, UI 연결 대기:
- 분석 결과 → 캘린더 일괄 등록 (`exportPlanToCalendar`)
- Focus 고정 시간 카드에 캘린더 이벤트 주입 (`listUpcomingEvents`)
- 분석 직후 이동 단계 거리 기반 시간 보정 (`refineTravelTimes`)

---

## 3. 디자인 시스템 — 현재 상태

### 색상 팔레트 (Sepia Neutral, PRD §5.1)

| Role | Token | Value |
|---|---|---|
| Primary | `T2.color.primary` | `#2F241E` deep sepia brown |
| Accent | `T2.color.accent` | `#8C6F5A` muted warm brown |
| Surface | `T2.color.surface` | `#F4F1EC` warm paper |
| Surface raised | `T2.color.surfaceRaised` | `#FFFFFF` |
| Surface soft | `T2.color.surfaceSoft` | `#EAE5DF` |
| Text | `T2.color.text` | `#1C1A18` |
| Text Secondary | `T2.color.textSecondary` | `#5A524C` |
| Text Muted | `T2.color.textMuted` | `#9A918A` |
| Border | `T2.color.border` | `#E2DDD7` |
| Status Good | `T2.color.statusGood` | `#6E8B74` desaturated olive |
| Status Warn | `T2.color.statusWarn` | `#A67C52` soft amber brown |
| Status Crit | `T2.color.statusCrit` | `#8A4A4A` muted red-brown |

### 타이포그래피
- 32 / 18 / 14 / 12 / 13 (Display / Heading / Body / Caption / Mono)
- Plus Jakarta Sans + Noto Sans KR + JetBrains Mono

### 4-stage flow (Analysis / Record)
1. Summary — KPI 카드 + Efficiency Score
2. Insights — 차트 + 자동 NLP 인사이트 (Analysis만)
3. Exploration — 3축 FilterBar
4. Detailed Data — strict craft Table

### v2 프리미티브
- `KpiCard`, `EfficiencyScore`, `InsightStatement`, `FilterBar`, `Table`, `PlannedVsActualChart`
- lib: `efficiency.js`, `insights.js` (LLM 의존성 0)

---

## 4. 변경되지 않을 사항

- 메인 페이지 좌-사이드바 + 우-입력 1:3 비율
- Focus 페이지 사이드바 + 우 대시보드 구조
- 1920×1080 비율 baseline
- 역수 속도 공식 (v6h)
- 다중 세션 / 일시 정지 / 그래프 인터랙션 (v6i)
- 기록 삭제 / 학습 데이터 관리

---

## 5. 의존성 / 환경

- React + Vite (변경 없음)
- Supabase (선택 인증, 변경 없음)
- 외부 API: Google Places + Distance Matrix + Calendar (사용자 직접 키 입력)
- npm 패키지 추가 0

---

## 6. 진행 명령

- **시간 추정 구현**: 명시적 명령 시 시작
- **Phase 3 UI 통합**: 명시적 명령 시 시작
- **버그 수정**: 즉시 보고하고 수정
