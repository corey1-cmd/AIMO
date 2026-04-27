# AIMO — Atelier Cyan Redesign v6d (1920×1080 통합 박스)

이미지 1·2 매칭 + 1920×1080 FHD 기준 + 통합 박스 레이아웃 적용. 원본 폴더 위에 그대로 덮어쓰면 됩니다.

## 이번 라운드 변경 사항 (v6c → v6d)

### 1. 1920×1080 FHD 기준
- `MainPage` / `FocusDashboardPage` 모두 max-width 1480 → **1920**
- 좌우 padding 56px → 60px, 상하 40/96 → **32/32** (1080 세로 활용)
- `min-height: calc(100vh - 72px - 64px)` 로 양쪽 박스가 viewport 가득

### 2. 좌:우 = 1:3 비율
- `gridTemplateColumns: '1fr 3fr'` (이전 `380px 1fr`)
- 1920px 기준 좌측 약 455px, 우측 약 1365px (gap 28px 기준)
- 1280px 이하에선 1fr 2.4fr 로 축소

### 3. 통합 박스 레이아웃
- **좌측 통합 다크 박스** (`sidebarBox()`)
  - OVERVIEW / TOP 3 / RECENT / 빠른 진입 3-icon / V3 카드를 하나의 컨테이너에 적층
  - 각 섹션 사이는 hairline divider (linear-gradient 페이드)
  - 우상단 ambient orb 광원 + 상단 sheen 라인
- **우측 통합 라이트 박스** (`rightBox()`)
  - Make 페이지: WorkflowHeader + 입력 카드들 + Add/CTA 모두 한 박스 안
  - Focus 페이지: 8개 차트가 한 박스 안 (sub-card는 약화시킨 톤)

### 4. 배경 — 격자 제거, 빛+그림자만
- body::before의 청사진 그리드 완전 제거
- ambient orb 4개로 빛 표현 (좌상·우하·우상·좌하)
- 통합 박스에 큰 외부 그림자 (다크: 0 24px 60px rgba(0,32,18,0.18) / 라이트: 0.08)
- 내부 sub-card는 매우 약한 그림자만

### 5. 좌상단 로고 — `&` placeholder
- AIMO 텍스트 → 44×44px primary green 박스 + 흰색 `&` 심볼
- 클릭 시 `/`(메인)으로 이동
- 호버 시 미세한 lift + 그림자 강화
- 추후 진짜 로고로 교체 가능 (button 태그 + textContent만 바꾸면 됨)

### 6. 사이드바 컴포넌트 — embedded 모드
- TodayOverview / Top3 / RecentCompleted / QuickEntry / AIMOInfoCard 모두 외곽 글래스 wrapper 제거
- 통합 박스 내부에서 padding만 적용
- 시각적 그루핑은 외부 컨테이너의 hairline divider가 담당

### 7. 내부 sub-card 톤 다운
- FocusDashboard의 CardLight → 라이트 글래스 → soft white 0.55, 약한 보더
- TaskInputCard → 같은 톤으로 통일 (큰 박스 안에 있어 nested 무게감 제거)

## 변경 파일 (총 18개)

```
index.html
src/App.jsx                              ← 통합 박스 레이아웃, 1920×1080, 1:3, & 로고
src/styles.js                            ← 격자 제거, ambient orb 4개로 강화
src/constants.js                         ← Atelier Cyan 토큰
src/auth/AuthButton.jsx                  ← 아바타 + 드롭다운 caret
src/components/TodayOverview.jsx         ← embedded (외곽 카드 제거)
src/components/Top3.jsx                  ← embedded
src/components/RecentCompleted.jsx       ← embedded
src/components/QuickEntry.jsx            ← embedded
src/components/AIMOInfoCard.jsx          ← embedded
src/components/WorkflowHeader.jsx        ← ← 메인 / Work Flow / wave
src/components/TaskInputCard.jsx         ← 톤 다운 (큰 박스 내부 sub-card)
src/components/AddTaskButton.jsx         ← 작은 점선 pill
src/components/AnalyzeCTA.jsx            ← 컴팩트 다크 + 슈팅스타
src/components/FocusDashboard.jsx        ← NEW (8개 차트), 톤 다운된 sub-card
src/components/FocusInline.jsx           ← 글래스 토큰 정렬
src/components/ParserErrorCard.jsx       ← 글래스 토큰 정렬
src/components/RightPanel.jsx            ← onBack 전달, 같은 줄 레이아웃
```

## 검증

- `npx vite build` 통과
- 헤드리스 Chrome 1920×1080에서 두 페이지 실제 렌더링 확인 (preview PNG 첨부)
- 의존성 변경 없음 (`package.json` 동일)
- auth gate · routing · 데이터 흐름 원본 그대로

## 적용 방법

```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
# .env.local에 Supabase URL/anon key 설정
npm install   # 처음 설치 시
npm run dev
```

## 유지된 항목 (변경 안 함)
- "집중 상태 요약" — "작업 상태 요약"으로 변경하지 않음 (사용자 지정)
- 모든 기능·routing·auth·데이터 흐름 그대로
- `package.json` / `package-lock.json` 동일

## 추후 작업 노트
- `&` placeholder 자리에 진짜 로고 교체 — `src/App.jsx`의 NavBar 컴포넌트 안 `<button>...&amp;</button>` 부분
- 좌측 다크 박스가 콘텐츠보다 길면 빈 영역 발생할 수 있음 (1080보다 화면 길 때) — `min-height` 조정 또는 콘텐츠 추가로 해결
