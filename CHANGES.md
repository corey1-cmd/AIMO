# AIMO — Atelier Cyan Redesign v6j (Focus 라벨 + Record/Analysis 풀폭)

## 이번 라운드 변경 사항 (v6i → v6j)

### A. Focus 라이브 타이머 카드 — 세션 라벨 노출 (1번 안 적용)
LiveTimerCard 안에 부모 세션 이름을 항상 보여주는 라벨 박스 추가.

배치 순서 (위에서 아래로):
1. "현재 세션" 타이틀 + LIVE 뱃지
2. **세션 라벨 박스** (mint 배경, primary 점 + 세션 이름) ← NEW
3. STEP M / N · 행동유형
4. 단계 제목
5. 타이머
6. 일시정지 / 재개 버튼
7. 진행률 + 속도

이로써 "마무리" 같은 일반 단계명만 봐도 "어떤 세션의 마무리인지" 즉시 알 수 있게 됨. 좌측 사이드바 ActiveSessionsCard 와 정보 일관성 유지.

### B. Record 페이지 풀폭 단일 박스 재설계
이전: 좌측 다크 사이드바 + 우측 라이트 박스 (1:3) 그리드
변경: **사이드바 제거, 우측 박스가 페이지 전체 차지**

새 디자인 (이미지 2 매칭):
- 좌측 사이드바 완전 제거
- 단일 큰 박스가 좌우 60px 패딩으로 페이지 채움
- 우상단 데코레이션: 미세한 wave + mint 점들
- 헤더: "Tasks Record" + "작업 기록을 통해 나의 집중력과 속도 변화를 확인해보세요."
- 카테고리 필터 pill: 전체 / 이동 / 대화 / 자료 정리 / 창작 / 디자인
  - 활성 필터: 다크 배경 + 흰 글씨
  - 비활성: 투명 배경 + 회색 보더
- 우측 정렬 드롭다운: 최신순 / 오래된순 / 빠른순 / 느린순
- **테이블 형태** (이전 카드 그리드에서 변경):
  - 컬럼: 작업 이름 / 할 일 수 / 소요 시간 (예상·실제) / 속도 (실제/예상) / 날짜 / 상태 / 더보기
  - 작업 이름 옆에 카테고리 pill 표시
  - 속도: 진행률 바 + 역수 모델 y값 (빠르면 진녹색, 느리면 주황색)
  - 상태: "✓ 저장됨" / "저장" 토글 pill
  - 더보기 (⋯) 버튼: 호버 시 빨간색 → 클릭 시 삭제 확인 모달
- 행 호버 시 mint 톤 배경

### C. Analysis 페이지 풀폭 단일 박스 재설계
이전: 좌측 사이드바 + 우측 박스 (Record와 동일 구조)
변경: **사이드바 제거, 우측 박스가 페이지 전체 차지**

새 디자인 (이미지 1 매칭):
- 좌측 사이드바 완전 제거
- 헤더: "Analysis" + "데이터를 분석하여 더 빠르고 효율적으로 일할 수 있도록 도와드립니다."
- 우상단 wave 데코레이션
- **상단 2열 그리드:**
  - 좌상단: **행동 범주별 속도** (가로 바 차트, 역수 모델 y값, 100% = 정상 / 낮을수록 느림)
  - 우상단: **세부 활동 비율** (도넛 차트 + 2열 범례, 가운데 "총 활동 100%")
- **하단 2열 그리드 (1fr 280px):**
  - 좌하단: **예상 vs 실제 시간 추이** (스무드 라인 차트, 일간/주간/월간 토글)
  - 우하단: **전체 기간 요약 카드** (총 시간 / 예상 대비 % / 빠르게 진행 중 메시지)
- 모든 차트가 역수 모델 속도 공식 적용 (y = 10000/x)

### D. 공통 — DecorativeWave 컴포넌트
- Record/Analysis 페이지 우상단에 들어가는 작은 데코레이션
- mint 그라데이션 wave 2줄 + mint 점 3개
- opacity 0.45 로 절제된 느낌
- pointerEvents: none, position: absolute 로 콘텐츠와 안 겹침

## 변경 파일 (총 19개, 신규 0개)

```
index.html
src/App.jsx                              ← RecordPage/AnalysisPage 풀폭 재설계, FilterPill, SortDropdown, RecordTable, AnalysisCard, CategorySpeedCard, ActivityPieCard, TrendChartCard, PeriodSummaryCard, DecorativeWave 추가
src/styles.js                            ← 격자 제거, ambient orb
src/constants.js                         ← Atelier Cyan 토큰 + 역수 속도 공식
src/learning.js                          ← contributions 추적
src/auth/AuthButton.jsx                  ← 드롭다운 메뉴
src/components/ActiveSessionsCard.jsx    ← 사이드바 진행 중 세션 목록
src/components/FocusDashboard.jsx        ← 세션 라벨 박스 (1번 안)
src/components/RightPanel.jsx            ← input/analyzing/result 인-페이지
src/components/TodayOverview.jsx
src/components/Top3.jsx
src/components/RecentCompleted.jsx
src/components/AIMOInfoCard.jsx
src/components/WorkflowHeader.jsx
src/components/TaskInputCard.jsx
src/components/AddTaskButton.jsx
src/components/AnalyzeCTA.jsx
src/components/FocusInline.jsx
src/components/ParserErrorCard.jsx
```

⚠️ **수동 삭제 필요**: `src/components/QuickEntry.jsx` 는 더 이상 사용되지 않습니다.
```bash
rm src/components/QuickEntry.jsx
```

## 검증
- `npx vite build` 통과 (993 KB main + 197 KB supabase)
- 이전 AnalysisPage 함수 정의 중복 제거 (1차 새 정의만 남김)
- 의존성 변경 없음

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
rm src/components/QuickEntry.jsx   # 더 이상 사용 안 함
npm install
npm run dev
```

## 유지된 항목
- 메인 페이지 (좌측 사이드바 + 우측 입력 박스 1:3 구조 그대로)
- Focus 페이지 (좌측 사이드바 + 우측 대시보드)
- Learning 페이지 (좌측 사이드바 + 우측 박스)
- 모든 역수 속도 공식 / 다중 세션 / 일시정지 / 그래프 인터랙션 / 기록 삭제 그대로

## 참고: 페이지별 레이아웃 정리

| 페이지 | 좌 사이드바 | 우 박스 | 메모 |
|---|---|---|---|
| `/` (Main) | ✓ | 입력/분석/결과 | 1:3 |
| `/focus` | ✓ | 세션 대시보드 | 1:3, 진행 중 세션 필요 |
| `/record` | ✗ | 풀폭 테이블 | NEW v6j |
| `/analysis` | ✗ | 풀폭 차트 | NEW v6j |
| `/library` | ✗ | 그리드 (구버전) | 변경 없음 |
| `/learning` | ✓ | 학습 데이터 목록 | 1:3 |
