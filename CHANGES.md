# AIMO — Atelier Cyan Redesign v6m (사이드바 교체 + 자동 검증 + 디자인 PRD)

## 이번 라운드 변경 사항 (v6l → v6m)

### A. 좌측 사이드바: Recent → 캘린더 패널

**`src/components/CalendarPanel.jsx` 신규**:
- 헤더: "CALENDAR" + 새로고침 ↻ 아이콘
- 미연결 상태: "캘린더 연동을 설정하세요" → /settings 이동 버튼
- ID 미설정: "Google 계정 연결 필요" → 동일 버튼
- 연결됨, 이벤트 없음: "예정된 일정이 없어요"
- 연결됨, 이벤트 있음: 오늘/내일/이후 그룹화, 최대 5개
  - 시각 (HH:MM 또는 종일) + 제목, mint 강조
- 1분 자동 새로고침
- 다른 탭에서 연결 상태 변경 감지 (3초 폴링)

### B. 좌측 사이드바: Top 3 → 목표 메모 박스

**`src/components/GoalMemoCard.jsx` 신규**:
- 자유 메모 입력 (최대 70자)
- localStorage 'aimo-goal-memo' 저장
- 빈 상태: 점선 박스 "목표를 적어보세요" → 클릭하면 인라인 편집
- 작성됨, 짧은 메모: 박스에 직접 표시
- 작성됨, 긴 메모: 3줄 ellipsis + "전체 보기 →" → 클릭하면 팝업
- 팝업: 전체 보기 / 편집 / 삭제 옵션
- 인라인 편집기: textarea + 글자수 카운트 + 저장/취소 (Enter/Esc 단축키)
- 글자수 60+ 도달 시 카운트 주황색 경고

### C. Google 외부 연동 자동 검증 + 자동 진행

**Maps API 키**: 1단계 흐름
- 입력 → "저장 & 검증" 클릭
- 1) 형식 검증 (`AIza...` 패턴)
- 2) Geocoding API 실제 호출 → 인증 확인
- 3) 모두 통과하면 자동 저장 + 성공 메시지
- 실패 시 인라인 에러 메시지 (alert 사용 안 함)

**Calendar 클라이언트 ID**: 1단계 흐름
- 입력 → "저장 & 연결" 클릭
- 1) 형식 검증 (`xxxxx.apps.googleusercontent.com` 패턴)
- 2) ID 자동 저장
- 3) OAuth 팝업 자동 실행
- 4) 토큰 획득 → 성공 메시지
- 모든 단계 자동 진행, 실패 시 인라인 에러

**StatusMessage 컴포넌트**: 인라인 성공/실패 표시
- 성공: 녹색 배경 + ✓ 아이콘
- 실패: 주황 배경 + ⚠ 아이콘 + 상세 메시지
- alert 사용 줄임 (UX 개선)

### D. 디자인 변경 — PRD + Build Plan 작성 (이번 라운드는 문서만)

기능 변경이 모두 완료된 후, 디자인 변경 작업을 위한 정식 문서 2종을 작성:

- **`PRD.md`** (Product Requirements Document, 약 350줄)
  - 8가지 평가 기준 (O1~O8)
  - 9가지 감사 결함 해결 요건
  - 4단계 흐름 (Summary → Insights → Exploration → Detailed Data)
  - Efficiency Score 합성 공식
  - 페이지별 요구사항
  - 색상 팔레트 변경 (electric mint 제거, 짙은 forest + muted sage 도입)
  - WCAG AA 접근성 요건
  - 검수 기준 10가지

- **`Build-Process-Plan.md`** (Implementation plan, 약 280줄)
  - 5개 phase 분할 (총 6라운드)
  - 2.A: 토큰 + 프리미티브
  - 2.B: Analysis 페이지 (2라운드)
  - 2.C: Record 페이지
  - 2.D: Focus/Main/Settings 토큰 마이그레이션
  - 2.E: 검수 + v1 토큰 제거
  - 각 phase 별 파일·검수 기준·롤백 전략

**디자인 코드 변경은 PRD 검토/승인 후 다음 라운드부터 진행** (이전 지시 사항 준수).

## 변경 파일 (총 24개, 신규 4개)

```
README.md
PRD.md                                   ← NEW: Phase 2 디자인 요구사항
Build-Process-Plan.md                    ← NEW: Phase 2 빌드 계획
index.html
src/App.jsx                              ← 사이드바 컴포넌트 교체, SettingsPage 자동 검증
src/constants.js
src/styles.js
src/learning.js
src/engine.js
src/geo.js
src/maps.js
src/calendar.js
src/auth/AuthButton.jsx
src/components/ActiveSessionsCard.jsx
src/components/AIMOInfoCard.jsx
src/components/AddTaskButton.jsx
src/components/AnalyzeCTA.jsx
src/components/CalendarPanel.jsx          ← NEW: 캘린더 사이드바 패널
src/components/FocusDashboard.jsx
src/components/FocusInline.jsx
src/components/GoalMemoCard.jsx           ← NEW: 목표 메모 박스
src/components/ParserErrorCard.jsx
src/components/RightPanel.jsx
src/components/TaskInputCard.jsx
src/components/TodayOverview.jsx
src/components/WorkflowHeader.jsx
```

⚠️ **수동 삭제 필요**:
- `src/components/QuickEntry.jsx` (v6i 부터 미사용)
- `src/components/Top3.jsx` (v6m 부터 미사용 — GoalMemoCard 로 대체)
- `src/components/RecentCompleted.jsx` (v6m 부터 미사용 — CalendarPanel 로 대체)

```bash
rm -f src/components/QuickEntry.jsx
rm -f src/components/Top3.jsx
rm -f src/components/RecentCompleted.jsx
```

## 검증
- `npx vite build` 통과
- 의존성 변경 없음

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
rm -f src/components/QuickEntry.jsx src/components/Top3.jsx src/components/RecentCompleted.jsx
npm install
npm run dev
```

## 다음 작업 — 사용자 검토 필요

`PRD.md` 와 `Build-Process-Plan.md` 검토 후 사인오프하시면 **Phase 2.A (토큰 + 프리미티브)** 부터 디자인 코드 작업 시작합니다.

### 검토 시 결정 필요

- [ ] PRD §5 토큰 (deeper green, muted sage 채택) — 색상 팔레트 변경 합의
- [ ] PRD §4 4단계 흐름 (Summary → Insights → Exploration → Detailed Data)
- [ ] PRD §4.1.1 Efficiency Score 가중치 (40/30/20/10)
- [ ] Build Plan 5 phase × 6 라운드 일정 합의
- [ ] 우선순위: Analysis 가 priority 1 — 동의?

## 유지된 항목
- 모든 v6h–v6l 변경
- 다중 세션 / 일시 정지 / 그래프 인터랙션
- Maps / Calendar 인프라
- 설정 페이지 골격 (UI 만 자동 검증으로 개선)
