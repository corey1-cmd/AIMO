# AIMO — Atelier Cyan Redesign v6l (외부 연동 + 설정 페이지)

## 이번 라운드 변경 사항 (v6k → v6l)

### A. Google Maps 연동 — C안 (Places + Distance Matrix)

**`src/maps.js` 신규**:

| 함수 | 역할 |
|---|---|
| `searchPlace(query, near)` | Places Text Search → 좌표 (캐시 7일) |
| `getDistanceMatrix(origin, dest, mode)` | 정확한 이동 시간/거리 |
| `refineTravelTimes(steps, currentLatLng)` | 단계 리스트의 이동 시간 일괄 보정 |
| `getMapsApiKey()` / `setMapsApiKey()` | 키 관리 |
| `hasMapsApiKey()` | 설정 여부 확인 |

**동작**:
- 키 미설정 시 모든 Maps 함수 null 반환 (graceful degradation)
- 캐시: 같은 장소 검색은 7일간 재호출 안 함
- 폴백: Distance Matrix 실패 시 haversine + 자체 추정으로 자동 전환

### B. Google Calendar 연동 — C안 (읽기 + 쓰기)

**`src/calendar.js` 신규**:

| 함수 | 역할 |
|---|---|
| `signIn()` | OAuth 2.0 implicit flow (popup) |
| `signOut()` | 토큰 폐기 + 로컬 클리어 |
| `isSignedIn()` | 토큰 유효성 확인 (만료 검사 포함) |
| `listUpcomingEvents(days)` | 향후 N일 이벤트 fetch |
| `createEvent({title,start,end,description})` | 이벤트 등록 |
| `eventsToFixedItems(events, plan)` | 캘린더 → Focus 고정 시간 카드 변환 |
| `exportPlanToCalendar(plan, baseTime)` | 분석 결과 일괄 등록 |

**OAuth 흐름**:
- 사용자가 클라이언트 ID 입력 → `signIn()` 호출 → 팝업으로 Google 인증 → 토큰 + 만료 시각 저장
- state 파라미터로 CSRF 방어
- 토큰 만료 시 자동 무효화 (401 응답 시 토큰 클리어)
- `signOut()` 시 Google revoke 엔드포인트 호출 + 로컬 토큰 제거

**스코프**:
- `calendar.readonly` — 일정 읽기
- `calendar.events` — 이벤트 등록

### C. 설정 페이지 (`/settings`) — 신규 작성

**구성**:

**외부 연동 섹션**:
- 위치 정보 (GPS) — 권한 상태 표시 + 요청 버튼
- Google Maps API 키 입력 (password 필드, 저장/삭제)
- Google Calendar 클라이언트 ID 입력 + 로그인/해제
  - JavaScript 원본 등록 안내 (현재 origin 자동 표시)

**데이터 관리 섹션**:
- 학습 데이터 관리 페이지 링크
- 모든 기록 내보내기 (JSON 다운로드)
- 모든 데이터 초기화 (확인 모달 → records / savedIds / activePlans / 학습 데이터 / API 키 / 캘린더 토큰 모두 제거)

**디자인**:
- 풀폭 단일 박스 (Record/Analysis 와 동일 패턴)
- BoxLightLight 광원 + DecorativeWave
- 각 항목은 SettingsRow 카드 — 제목 / 상태 뱃지 / 설명 / 입력/버튼
- 상태 뱃지: 설정됨(primary) / 미설정(muted) / 거부됨(warn)

**보안**:
- API 키는 localStorage 만 사용 (외부 전송 0)
- password 필드로 화면 가림
- 키 발급 안내 + JavaScript 원본 등록 가이드 표시

### D. AuthButton 드롭다운에 "설정" 추가
- 학습 데이터 관리 / **설정** / 로그아웃 3개 메뉴
- 톱니바퀴 아이콘

### E. App.jsx 통합
- `clearAllData()` 함수 — 설정 페이지의 초기화 호출 핸들러
- 신규 imports: `getMapsApiKey, setMapsApiKey, hasMapsApiKey, getGcalClientId, setGcalClientId, hasGcalClientId, isSignedIn, signIn, signOut, exportPlanToCalendar, getLocationPermissionState`
- 신규 라우트 `/settings`

## 변경 파일 (총 24개, 신규 2개)

```
README.md
index.html
src/App.jsx                              ← SettingsPage, clearAllData, /settings 라우트
src/constants.js
src/styles.js
src/learning.js
src/engine.js
src/geo.js
src/maps.js                              ← NEW: Places + Distance Matrix
src/calendar.js                          ← NEW: OAuth + 읽기/쓰기
src/auth/AuthButton.jsx                  ← 설정 메뉴 추가
src/components/ActiveSessionsCard.jsx
... (이하 기존 컴포넌트들 동일)
```

⚠️ **수동 삭제 필요**: `src/components/QuickEntry.jsx` (v6i 부터 미사용)

## 검증
- `npx vite build` 통과
- 의존성 변경 없음 (모두 fetch 기반, npm 패키지 추가 안 함)

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
rm -f src/components/QuickEntry.jsx   # 더 이상 사용 안 함
npm install
npm run dev
```

## 사용자 설정 가이드

### Google Maps API 키 발급
1. https://console.cloud.google.com 접속
2. 프로젝트 생성 → API 및 서비스 → 사용 설정된 API 관리
3. **Places API**, **Distance Matrix API** 활성화
4. 사용자 인증 정보 → API 키 생성
5. AIMO `/settings` 에 키 입력

### Google Calendar OAuth 설정
1. 같은 Cloud Console 프로젝트에서 OAuth 동의 화면 구성
2. 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
3. **승인된 JavaScript 원본** 에 AIMO 호스트 URL 등록 (예: `https://your-aimo.com`)
4. **승인된 리디렉션 URI** 에 동일한 URL 등록
5. 클라이언트 ID 복사 → AIMO `/settings` 에 입력 → "Google 로그인" 클릭

## 향후 작업

이번 라운드는 외부 연동 **인프라 구축**까지 완료.
다음 라운드에서:
- 메인 페이지 분석 결과에 "캘린더로 보내기" 버튼 (`exportPlanToCalendar` 호출)
- Focus 페이지 고정 시간 카드에 캘린더 이벤트 자동 주입 (`listUpcomingEvents`)
- 분석 직후 이동 단계의 시간을 `refineTravelTimes` 로 자동 보정
- Time Estimation 사전 기반 추론 (작업 1 — README.md 의 결정 대기 항목)

## 유지된 항목
- 모든 v6h–v6k 변경
- 디자인 시스템 / 1:3 비율 / 통합 박스 광원
- 다중 세션 / 일시 정지 / 그래프 인터랙션
- Analysis 버그 수정 (v6k)
