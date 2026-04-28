# AIMO — Atelier Cyan Redesign v6e (data-driven)

이전 버전(v6d)에서 하드코딩되어 있던 Focus 대시보드를 **실제 records 데이터로 동작**하도록 전면 리팩토링하고, **메인 페이지 내부 분석 흐름** 버그를 수정한 버전입니다.

## 이번 라운드 변경 사항 (v6d → v6e)

### A. Focus 대시보드 — 완전 데이터 연동
이전: 모든 차트가 하드코딩된 mock 데이터로 표시.
변경: `records` props 받아 `useFocusStats()` 훅 안에서 8개 카드 모두 실시간 계산.

가이드 기반 계산식 모두 구현:

1. **작업 속도 추이** — `Efficiency = (Expected / Actual) × 100`
   - records 일별 그룹핑 → 최근 7일 트렌드 라인
   - 호버 툴팁에 예상/실제/속도% 표시
2. **집중 상태 요약** — `Completion Rate = Completed / Total Expected × 100`
   - 도넛 차트 + 완료한 일/남은 할일/전체(예상)
3. **활동 분포** — `Specific Category / Total Actual × 100`
   - records의 `breakdown[].cat` / `actMin` 자동 집계 → 카테고리별 가로 바
4. **평균 작업 수행 시간** — `Σ(Actual per day) / Total Days`
   - 일별 막대 + 평균 가이드 라인
5. **고정 시간 카운트다운** — `Target - Current` (HH:MM:SS)
   - 1초 간격 setInterval로 실시간 업데이트
   - 사용자 요구로 **+ 고정 시간 추가 버튼 제거**, 외부 캘린더 데이터 미연결 상태에서는 빈 안내
6. **평균 세션 시간** — `Total / Sessions` 자동 계산
7. **평균 대비 속도** — `Recent 7d Avg / Past 7d Avg × 100`
   - 데이터 부족 시 `—` + "비교 데이터 부족" 표시

전 카드에 **빈 상태 안내** 추가. 첫 사용 시 빈 화면이 아니라 적절한 가이드 메시지.

### B. 메인 페이지 분석 흐름 — 페이지 이동 제거 (버그 수정)
이전: "분석 실행하기" 클릭 → `nav('/distill')` → DistillPage 별도 페이지로 이동 → 입력 다시 받음.
변경: `RightPanel`에 내부 phase 추가 (`input` / `analyzing` / `result`):

- `input` → 기존과 동일
- `analyzing` → 펄싱 spinner + 3-step 진행 표시 (1.5초)
- `result` → 분석 결과 미리보기 (총 단계, 예상 시간, 작업 유형, 행동유형 칩, 실행 순서 리스트, "포커스 모드 시작" CTA)

"포커스 모드 시작" 클릭 시 → `onStartPlan(plan)` → `/focus/session` 으로 이동.
"← 다시 입력" 클릭 시 → 같은 자리에서 입력 단계로 복귀.

App.jsx에 `onStartFromMain(plan)` 함수 추가 — DistillPage 우회.

### C. 기본 데이터 제거 — 빈 상태로 시작
이전: `loadRecords(MOCK_RECORDS)` — 5개 mock 자동 로드.
변경: `loadRecords([])` — 사용자가 직접 첫 기록을 만들도록.

`MOCK_RECORDS` import 주석 처리 (data.js 파일 자체는 유지 — 향후 데모/테스트용).

빈 상태 영향:
- 사이드바: TOP 3 / RECENT 모두 "아직 기록이 없어요" 안내
- OVERVIEW: 0 / 92% / 0m
- Focus 대시보드: 모든 카드 빈 안내 메시지

### D. + 고정 시간 추가 버튼 제거
사용자 요구. `DeadlinesCard`에서 카운트다운 항목이 없을 때 안내 메시지만 표시.

## 변경 파일 (총 18개)

```
index.html
src/App.jsx                              ← MOCK_RECORDS 제거, onStartFromMain, DistillPage 우회
src/styles.js                            ← 격자 제거, ambient orb
src/constants.js                         ← Atelier Cyan 토큰
src/auth/AuthButton.jsx                  ← 아바타 + caret
src/components/RightPanel.jsx            ← input/analyzing/result 3단계 자체 처리
src/components/FocusDashboard.jsx        ← useFocusStats 훅, 모든 카드 데이터 연동, 빈 상태
src/components/TodayOverview.jsx         ← embedded
src/components/Top3.jsx                  ← embedded, 빈 상태 안내
src/components/RecentCompleted.jsx       ← embedded, 빈 상태 안내
src/components/QuickEntry.jsx            ← embedded
src/components/AIMOInfoCard.jsx          ← embedded
src/components/WorkflowHeader.jsx        ← ← 메인 / Work Flow / wave
src/components/TaskInputCard.jsx         ← 톤 다운
src/components/AddTaskButton.jsx         ← 작은 점선 pill
src/components/AnalyzeCTA.jsx            ← 컴팩트 다크
src/components/FocusInline.jsx           ← 글래스 토큰
src/components/ParserErrorCard.jsx       ← 글래스 토큰
```

## 검증
- `npx vite build` 통과
- 1920×1080 헤드리스 Chrome으로 5개 시나리오 캡처 완료:
  1. Main (빈 record + "논문 작성하기" 입력)
  2. Analyzing (분석 진행 중 — **페이지 이동 없이 같은 박스 안에서**)
  3. Result (실제 엔진 결과 7단계 표시 + "포커스 모드 시작" CTA)
  4. Focus (빈 상태 — 모든 카드 적절한 안내)
  5. Focus (mock 7일 데이터 주입 — 모든 차트 실시간 계산 확인)

## 동작 시나리오

```
사용자가 "논문 작성하기" 입력
  → 분석 실행하기 클릭
  → (같은 박스 안에서) 분석 엔진 처리 중... 1.5초
  → (같은 박스 안에서) 분석 결과 7단계 32분 표시
  → 포커스 모드 시작 클릭
  → /focus/session 으로 이동 (실제 작업)
  → 완료 시 record 저장됨
  → /focus 클릭 시 dashboard에 차트 자동 반영
```

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
npm install
npm run dev
```

## 데이터 스키마
가이드의 JSON 스키마는 분석 결과를 storage에 저장하기 위한 내부 표현. 본 구현은 기존 `Record` 스키마 그대로 사용 (totalEstMin/totalActualMin/breakdown[]) — 추후 백엔드 연동 시 가이드 스키마로 변환 가능.
