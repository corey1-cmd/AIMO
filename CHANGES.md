# AIMO — Atelier Cyan Redesign v6i (multi-session + Focus rebuild)

## 이번 라운드 변경 사항 (v6h → v6i)

### A. NavBar에서 Main, Focus 제거
이유: Main 은 어차피 Main이고, Focus 는 실행 중에만 보고, 메인 페이지 우측 박스에서 직접 시작 → 좌측 사이드바의 진행 중 카드로 이동/관리.

남은 NavBar 항목: Record / Analysis / Library / Share

### B. 다중 세션 지원
- `activePlan` (단일) → `activePlans` (배열) + `activeSessionId` 로 리팩토링
- 세션마다 `id`, `label` 자동 부여
- 구버전 단일 plan 데이터 자동 migrate (객체면 배열로 변환)
- 사이드바에서 진행 중 세션을 클릭하여 전환 가능

### C. 좌측 사이드바 — 진행 중인 세션 카드 (`ActiveSessionsCard.jsx` 신규)
이전: 사이드바에 QuickEntry (구조 만들기 / 포커스 모드 / 기록 보기 아이콘 3개)
변경: **진행 중인 세션 목록**으로 교체

각 카드 표시:
- mint 펄스 점 + 세션 라벨
- 현재 단계 (`↳ 단계명`)
- 진행률 바 + 완료/총 단계 수 + 남은 시간
- 클릭 시 해당 세션의 포커스 모드로 진입
- active 세션은 mint 강조

빈 상태: "진행 중인 세션 없음 / 분석 후 포커스 모드 시작"

### D. Focus 화면 = 진행 중 세션 전용
- `currentPlan` 없으면 `/` 로 자동 redirect
- 진행 중 세션이 있으면 그 중 첫 번째를 자동 선택
- `FocusDashboard` 가 단일 세션 데이터만 다룸 (records 의존성 완전 제거)

### E. 단계별 시간 그래프 (`SessionTimelineCard`)
- 각 step의 estimated 막대 (회색 배경) + actual overlay
- 현재 step 색상 분기:
  - 빠름 → 진녹색 (primary)
  - 느림 → 주황색 (#C97A4A)
  - 정상 → 일렉트릭 민트
- **고정 시간 step** → x축 아래 빨간 라인 + 🔒 마커
- 그래프 영역 클릭/호버 → 정보 박스 (idx, est, act, 속도, 고정 표시)
- 그래프 영역 벗어나면 박스 사라짐 (`onMouseLeave` → `setHover(null)`)
- **위 공간 부족 시 자동으로 아래에 표시** (`tipY < 0` 검사)
- **현재 단계 인디케이터 0.2s 트랜지션** (`transition: all 200ms ease`)
- 막대 fill 색상도 0.2s 트랜지션 (속도에 따라 부드럽게 색 변경)

### F. 활동 분포 → 고정 시간 활동 모니터 (`FixedDeadlineCard`)
이전: history 기반 카테고리 분포
변경: **현재 plan 의 고정 시간 step 까지 남은 시간 모니터링**

각 항목 표시:
- step 번호 / 단계명 / 예상 시간
- 남은 시간 (현재 단계 잔여 + 사이 단계들 estimated 합)
- 5분 이내면 주황색, 현재 단계면 빨간색 강조, 완료된 단계는 회색 처리
- 1초마다 실시간 업데이트

### G. 단계 완료 버튼을 다음 할 일 박스 아래로 이동
- `NextStepsCard` 안에 통합 — 다음 4개 단계 미리보기 바로 아래에 큰 primary 버튼

### H. 일시 정지 기능
- `LiveTimerCard` 타이머 박스 바로 아래에 "일시 정지 / 재개" 버튼
- `pauseState[planId]` 로 세션별 일시정지 상태 관리
- 일시정지 시:
  - 타이머 인터벌 중지 (`setNow` 안 함)
  - 타이머 숫자 회색 (`opacity: 0.55`)
  - 배경 주황 톤
  - "PAUSED" 뱃지 표시
- 재개 시:
  - `startTimes[curIdx]` 를 일시정지 동안 흐른 시간만큼 미래로 보정
  - 모든 타이머가 일시정지 시점부터 자연스럽게 이어짐
- 단계 완료 시 일시정지 자동 해제

### I. 다른 추가 기능
- `SessionTimelineCard` 가 step 변경 시 0.2초로 부드럽게 인디케이터 이동
- 헤더에 세션 라벨 + "● 진행 중인 세션" 라벨 + "세션 종료" 버튼
- 세션 평균 속도 / 진행률 카드 추가 (하단)
- 완료 단계 페이스 카드 (이전 평균 작업 수행 시간 자리)

## 변경 파일 (총 19개, 신규 1개)

```
index.html
src/App.jsx                              ← multi-session, FocusPage 통합, 일시정지
src/styles.js                            ← 격자 제거, ambient orb
src/constants.js                         ← Atelier Cyan 토큰 + 역수 속도 공식
src/learning.js                          ← contributions 추적
src/auth/AuthButton.jsx                  ← 드롭다운 메뉴
src/components/ActiveSessionsCard.jsx    ← NEW: 사이드바 진행 중 세션 목록
src/components/FocusDashboard.jsx        ← REBUILD: 단일 세션 + 그래프 + 고정시간 모니터
src/components/RightPanel.jsx            ← input/analyzing/result 인-페이지
src/components/TodayOverview.jsx         ← embedded
src/components/Top3.jsx                  ← embedded
src/components/RecentCompleted.jsx       ← embedded
src/components/AIMOInfoCard.jsx          ← embedded
src/components/WorkflowHeader.jsx        ← ← 메인 / Work Flow
src/components/TaskInputCard.jsx         ← 톤 다운
src/components/AddTaskButton.jsx         ← 작은 점선 pill
src/components/AnalyzeCTA.jsx            ← 컴팩트 다크
src/components/FocusInline.jsx           ← 글래스 토큰
src/components/ParserErrorCard.jsx      ← 글래스 토큰
```

⚠️ **수동 삭제 필요**: `src/components/QuickEntry.jsx` 는 더 이상 사용되지 않습니다. 원본 폴더에서 직접 삭제해주세요.

```bash
rm src/components/QuickEntry.jsx
```

## 검증
- `npx vite build` 통과 (978 KB main + 197 KB supabase)
- 의존성 변경 없음
- 구버전 단일 plan storage 자동 migrate 처리

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
rm src/components/QuickEntry.jsx   # 더 이상 사용 안 함
npm install
npm run dev
```

## 동작 시나리오

```
시나리오 1: 다중 세션 동시 진행
  - 메인에서 "보고서 작성" 분석 → 결과 → 포커스 시작 → /focus 진입
  - 좌측 사이드바 "진행 중" 에 세션 1 표시
  - 메인 다시 클릭 → 다른 일 "이메일 답장" 분석 → 결과 → 포커스 시작
  - 좌측 사이드바에 세션 1, 2 둘 다 표시
  - 세션 1 카드 클릭 → 세션 1 의 Focus 화면으로 전환
  - 세션 2 카드 클릭 → 세션 2 의 Focus 화면으로 전환

시나리오 2: 일시 정지
  - Focus 진행 중 → 타이머 아래 "일시 정지" 클릭
  - 타이머 회색 + "PAUSED" 뱃지
  - 잠시 후 "재개" 클릭 → 일시정지 동안 흐른 시간 보정 후 이어짐

시나리오 3: 그래프 인터랙션
  - 그래프 막대 위에 마우스 → 정보 박스 표시
  - 막대가 화면 위쪽이면 정보 박스가 막대 아래로 표시 (잘림 방지)
  - 그래프 영역 벗어나면 박스 사라짐
  - 단계 완료 → 0.2초로 부드럽게 다음 막대로 인디케이터 이동
  - 현재 단계 색상이 속도(역수 모델)에 따라 빠름/느림/정상 으로 트랜지션
```

## 유지된 항목
- 통합 박스 광원 (정적, 움직임 없음)
- 1920×1080 / 1:3 비율
- 학습 데이터 관리 페이지 (/learning)
- 기록 삭제 기능 (/record)
- 역수 속도 공식 (v6h)
