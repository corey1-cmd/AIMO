# AIMO — Atelier Cyan Redesign v6f (auth dropdown + learning manager + session UI)

## 이번 라운드 변경 사항 (v6e → v6f)

### A. 로그아웃 + 학습 데이터 관리 메뉴
- `AuthButton` 완전 재작성 — 아바타 클릭 → 드롭다운 노출
- 드롭다운 항목:
  - 사용자 이메일 (헤더, 비클릭)
  - **학습 데이터 관리** (`/learning` 으로 이동)
  - **로그아웃** (빨간색, 클릭 시 즉시 signOut)
- 외부 클릭 / ESC 키로 닫힘
- caret 회전 애니메이션 (드롭다운 open/close 시)

### B. Focus Active Session 새 디자인 (`FocusSession.jsx` 신규)
이전: 옛날 `FocusPage`로 떨어져 사이드바 없는 구버전 UI 표시.
변경: `FocusSessionPage` 래퍼를 만들어 좌측 통합 다크 박스 + 우측 통합 라이트 박스 안에 새 세션 UI 렌더.

새 세션 UI (이미지 1과 동일):
- 헤더: ← 메인 / Focus / 세션 종료
- 전체 진행률 바 (X / N · NN%)
- 메인 카드: STEP M/N · 행동유형 / 큰 제목 / 원본 task 표시 / 칩 3개 (청크 / CL단계 / 카테고리) / 큰 타이머 MM:SS / 경과 시간 / 예상 시간 / 완료 버튼
- 전체 스텝 리스트 (완료/진행중/대기 상태 점, 완료된 항목은 strike)

**사이드바 실시간 반영** — `useDashboardStats(records)` 훅으로 MainPage·FocusDashboardPage와 동일하게 동작. records 추가/삭제 즉시 반영.

### C. 통합 박스 광원 (정적, 움직임 없음)
- `BoxLightDark` / `BoxLightLight` / `BoxContent` 헬퍼 함수 신설
- 좌측 다크 박스: 우상단 mint 광원(220px) + 상단 sheen 라인 (이전과 동일, 헬퍼화만)
- **우측 라이트 박스에도 광원 추가** — 우상단 mint 광원(280px) + 좌하단 forest 광원(320px) + 상단 sheen 라인
- 모든 광원은 **정적**, `cyanPulse` 등 애니메이션 사용하지 않음
- `BoxContent` (z-index: 1)로 콘텐츠가 광원 위에 깔리도록
- MainPage / FocusDashboardPage / FocusSessionPage / LearningPage 모두 적용

### D. 학습 데이터 관리 페이지 (`/learning` 신규)
신규 라우트. 통합 박스 레이아웃, Focus 대시보드와 동일한 디자인 룰.

**기능:**
- 학습에 기여한 record 목록 표시 (최신순)
- 각 항목: 제목 / 날짜 / 단계 수 / 예상→실제 시간 / 카테고리 아이콘 3개 / 삭제 버튼
- 상단 통계 박스 3개: 학습된 기록 수 / 누적 카테고리 / 총 학습 시간
- 빈 상태 안내 메시지

**삭제 흐름:**
- 삭제 버튼 클릭 → 가운데 모달 팝업
- 팝업 내용:
  - "삭제하시겠습니까?"
  - "삭제된 정보는 기록에서 다시 넣을 수 있습니다.
     학습 모델에서만 제거되며, 원본 기록은 보존됩니다."
  - 대상 기록 제목 표시
  - 취소 / 삭제 버튼 (삭제 버튼은 빨간색, autoFocus)
- 외부 클릭 / ESC 로도 취소 가능

**데이터 흐름:**
- `learning.js` 확장:
  - 새 스키마: `{ stats: {category: {...}}, contributions: [{recordId, recordTitle, recordDate, items}] }`
  - 구버전 데이터 자동 migrate
  - `accumLD(ld, items, {recordId, recordTitle, recordDate})` — record 메타 함께 저장
  - `removeContribLD(ld, recordId)` — 기여 제거 후 stats 전체 재계산
  - `listContributions(ld)` — UI 렌더용 정렬된 목록
- `SummaryPage`의 `confirmLearn` 수정 — record id를 `useRef`로 미리 생성해 `accumLD`와 `saveResult` 모두에서 같은 id 사용
- `runAnalysis` 호출 시 `learnData?.stats || learnData` 로 전달 (구·신 스키마 양쪽 호환)

## 변경 파일 (총 20개, 신규 2개)

```
index.html
src/App.jsx                              ← FocusSessionPage, LearningPage, ConfirmModal, BoxLight 헬퍼
src/styles.js                            ← 격자 제거, ambient orb
src/constants.js                         ← Atelier Cyan 토큰
src/learning.js                          ← contributions 추적, removeContribLD, listContributions
src/auth/AuthButton.jsx                  ← 드롭다운 메뉴 (학습 데이터 관리 / 로그아웃)
src/components/FocusSession.jsx          ← NEW: 새 세션 UI (이미지 1)
src/components/FocusDashboard.jsx        ← NEW: 데이터 연동 대시보드 (v6e)
src/components/RightPanel.jsx            ← input/analyzing/result 3단계 인-페이지
src/components/TodayOverview.jsx         ← embedded
src/components/Top3.jsx                  ← embedded
src/components/RecentCompleted.jsx       ← embedded
src/components/QuickEntry.jsx            ← embedded
src/components/AIMOInfoCard.jsx          ← embedded
src/components/WorkflowHeader.jsx        ← ← 메인 / Work Flow
src/components/TaskInputCard.jsx         ← 톤 다운
src/components/AddTaskButton.jsx         ← 작은 점선 pill
src/components/AnalyzeCTA.jsx            ← 컴팩트 다크
src/components/FocusInline.jsx           ← 글래스 토큰
src/components/ParserErrorCard.jsx      ← 글래스 토큰
```

## 검증
- `npx vite build` 통과 (979 KB main + 197 KB supabase)
- `learning.js` 구버전 데이터 migrate 자동 처리
- `runAnalysis` 호출부 모두 신·구 스키마 호환

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
npm install
npm run dev
```

## 동작 시나리오 (학습 데이터 관리)

```
세션 완료 → SummaryPage → "학습에 반영" 클릭
  → record id 가 학습 데이터에 함께 저장됨
  → record가 records 배열에도 저장됨

사용자가 아바타 클릭 → "학습 데이터 관리" 클릭
  → /learning 페이지에 누적된 학습 기록 목록 표시
  → 특정 항목 "삭제" 클릭
  → 모달: "삭제하시겠습니까? 삭제된 정보는 기록에서 다시 넣을 수 있습니다."
  → 삭제 클릭 시 학습 데이터에서만 제거 (원본 record 보존)
  → 다음 분석부터 그 기록의 학습 영향 사라짐
```

## 유지된 항목
- "집중 상태 요약" — 변경 없음
- 라이브러리 페이지 (`/library`) — 변경 없음
- 기존 라우팅 / auth gate / 데이터 흐름 그대로
- `package.json` 의존성 변경 없음
