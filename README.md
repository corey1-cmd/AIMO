# AIMO — 작업 현황 및 향후 작업 계획

> **목적**: 진행 중인 변경 사항과 결정 대기 항목을 한 곳에서 관리하여 작업 누락 방지.
> **최종 업데이트**: v6j (Atelier Cyan Redesign) 종료 시점
> **다음 작업 시작 전 필수 확인 문서**

---

## 1. 현재까지 완료된 작업 (v6a → v6j)

### 디자인 시스템 (v6a–v6d)
- Atelier Cyan 디자인 토큰 (`primary: #00522D`, `electricMint: #4FE0A8`)
- 좌측 다크 통합 박스 + 우측 라이트 박스 (1:3 비율)
- 1920×1080 FHD 기준 레이아웃, 격자 패턴 제거
- 정적 광원 효과 (애니메이션 없음)

### 분석 흐름 인-페이지 처리 (v6e)
- 메인 페이지에서 분석 → 분석 중 → 결과가 같은 박스 안에서 처리
- DistillPage 우회

### 학습 데이터 관리 (v6f)
- AuthButton 드롭다운 (학습 데이터 관리 / 로그아웃)
- `/learning` 페이지 + ConfirmModal
- `learning.js` contributions 추적

### Focus 통합 (v6g)
- `/focus` 와 `/focus/session` 통합
- 라이브 타이머 / 다음 할 일 카드
- 기록 삭제 기능

### 역수 속도 공식 (v6h)
- `getSpeedY(x) = round(10000/x, 2)`
- `getSpeedStatus(x)` → `{y, diff, type, message}`

### 다중 세션 + Focus 재구성 (v6i)
- `activePlans` 배열 + `activeSessionId`
- 좌측 사이드바 `ActiveSessionsCard` (QuickEntry 대체)
- NavBar에서 Main / Focus 제거
- `SessionTimelineCard`, `FixedDeadlineCard`
- 일시 정지 / 재개 기능

### Focus 라벨 + 풀폭 페이지 (v6j)
- 라이브 타이머에 세션 라벨 박스
- Record 페이지 풀폭 단일 박스 (테이블 형태)
- Analysis 페이지 풀폭 단일 박스 (행동 범주별 속도 / 세부 활동 비율 / 추이)

---

## 2. 진행 예정 작업 (다음 라운드)

### 🟢 작업 1. 시간 추정 외부 추론 구현 — **기획·설계 완료, 구현 대기**

**채택안: E안 — 내부 사전 + 휴리스틱 + 학습 보정 하이브리드**

다음 조건 모두 만족하는 최적안으로 결정:
- 비용 0
- 추정 시간 ≤ 20초 (실제 < 50ms)
- 사용자 불편 없음 (권한·키 입력 불필요)
- 한·영 정확도 양쪽 만족
- 보안 이슈 없음 (외부 호출 0회)
- 내부 구현

#### 핵심 알고리즘 — 4단계 Resolver (Fallback)

```
입력: "프로젝트 기획서 figure 만들기" (cat: create)
   ↓
① 사용자 학습 데이터 (n≥3 샘플)        신뢰도 0.95
   ↓ 학습 부족
② 정확 사전 매칭 (normalized title)    신뢰도 0.85
   ↓ 매칭 실패
③ 키워드 휴리스틱 (동사·명사 추출)     신뢰도 0.65
   ↓ 매칭 실패
④ 카테고리 폴백 (CATEGORY_DEFAULTS)    신뢰도 0.40
```

#### 모듈 구성 (작성 예정)

```
src/time-estimation/
├── dictionary.ko.js     # 한국어 사전 (정확 100 + 키워드 200)
├── dictionary.en.js     # 영어 사전 (정확 100 + 키워드 200)
├── normalizer.js        # 입력 정규화
├── tokenizer.js         # 한국어 어절·조사 처리 + 영어 단어 분리
├── resolver.js          # 4단계 fallback 로직
├── confidence.js        # 신뢰도 점수
└── index.js             # 외부 노출: resolveTime(title, cat, ld)
```

#### 사전 샘플값 (현실 보정)

| 입력 | 추정값 | 비고 |
|---|---|---|
| 점심 식사 | 30분 | (이전 5분 → 현실적 값) |
| 발표자료 만들기 | 90분 | |
| figure 만들기 | 25분 | (이전 9분 → 현실적 값) |
| 회의록 정리 | 12분 | |
| 이메일 답장 | 8분 | |
| 운동 | 45분 | |
| 샤워 | 10분 | |
| lunch | 30분 | |
| create presentation slides | 90분 | |

#### 처리해야 할 버그 케이스 (필수)

- [ ] 사전 매칭 시 토큰 길이 ≥ 2 강제
- [ ] 한국어 어미·조사 처리 (`stripJosa`)
- [ ] 매칭 실패 시 원형으로 재시도
- [ ] 키워드 다중 매칭 시 중간값/가중평균
- [ ] 학습 누적 시 IQR 이상치 필터
- [ ] 모든 결과 `clamp(1, 480)` 강제
- [ ] 빈 사전이면 ④번 폴백만
- [ ] 카테고리 없으면 `other` (20분) 폴백
- [ ] 동일 단계 중복 등장 시 캐시
- [ ] 한·영 혼용 ("ML 코딩") 처리
- [ ] 학습 데이터 corrupt (NaN, undefined) 검사
- [ ] 정규식 catastrophic backtracking 방지

#### 통합 지점

```javascript
// 변경 전 (engine-legacy.js)
const estimatedMin = computeMinsHardcoded(action, complexity);

// 변경 후
import { resolveTime } from './time-estimation';
const { mins, confidence, source } = resolveTime(
  action.title,
  action.category,
  learningData
);
```

`runAnalysis()` 출력에 `confidence`, `source` 포함.

#### UI 노출

신뢰도별 시각 표시:
- ≥ 0.85 → 일반 표시
- 0.65 ~ 0.85 → "추정" 라벨 (작은 회색)
- < 0.65 → 점선 보더 + "예상 정확도 낮음 — 직접 수정 가능" 툴팁

#### 검증 세트 (10개, 한 5 + 영 5)

| # | 입력 | 기대값 | 허용 오차 |
|---|---|---|---|
| 1 | 점심 식사 | 30 | ±10 |
| 2 | 발표자료 만들기 | 90 | ±30 |
| 3 | 이메일 답장 | 8 | ±5 |
| 4 | 논문 figure 3개 만들기 | 75 또는 35 | ±20 |
| 5 | 회의록 정리 | 12 | ±5 |
| 6 | lunch | 30 | ±10 |
| 7 | create presentation slides | 90 | ±30 |
| 8 | review pull request | 25 | ±10 |
| 9 | 운동 | 45 | ±15 |
| 10 | 스타벅스 가서 커피 사오기 | 30 | ±15 |

**합격 기준**: 평균 오차 ≤ 30%, 모든 항목이 허용 오차 내.

---

### 🔴 작업 2. Analysis 페이지 로딩 버그 수정

**증상**: 기록 저장 → 확인 후 페이지 로딩 안 됨. Analysis Page 안 뜸.

**원인 후보**:
- `r.breakdown` 이 `undefined` 인 records 처리 누락
- `b.cat` 이 `undefined` 인 breakdown 항목
- 빈 데이터에서 SVG path NaN 발생
- `getSpeedStatusFromMins` 가 0 입력에서 null 반환 시 처리 누락
- v6j 의 새 컴포넌트들 (`CategorySpeedCard`, `ActivityPieCard`, `TrendChartCard`, `PeriodSummaryCard`) 의 런타임 에러

**수정 방향**:
- 모든 새 컴포넌트에서 records / breakdown 가드 강화
- ErrorBoundary 추가 검토
- breakdown 항목별 cat 누락 시 'other' 폴백
- SVG path 생성 시 NaN 검사

**우선순위**: 🔴 **높음** — 사용자가 페이지 자체를 못 봄

---

### 🟡 작업 3. Google Calendar 연동

**목적**: 사용자의 고정 일정을 알아야 "언제까지 X 활동 해결" 같은 데드라인 조건 만족 가능.

**연동 방식**:
- Google Calendar API (OAuth 2.0)
- 권한: `calendar.events.readonly`
- 향후 N일치 이벤트 fetch → `plan.deadlines[]` 에 주입

**활용처**:
- Focus 페이지 **고정 시간 활동 카드** — plan 내부 isFixed 외에 외부 캘린더 이벤트도 함께 표시
- 단계 배치 시 캘린더 이벤트 시각을 **데드라인 제약**으로 사용 → 그 시각까지 끝나도록 단계 시간 압축 또는 경고

**연동 깊이 — 결정 필요**:
- **A안 (시작점)**: 읽기 전용. 캘린더 이벤트를 가져와서 Focus 의 고정 시간 카드에만 표시
- **B안**: 읽기 + 단계 배치 시 데드라인 제약으로 활용
- **C안**: 읽기 + 쓰기. 분석 결과를 캘린더 이벤트로 등록

**의존 사항**:
- Google Cloud Console 프로젝트 + OAuth 클라이언트 ID 필요
- 사용자 권한 동의 흐름
- 설정 페이지 연결/해제 UI (작업 5 의존)

**우선순위**: 🟡 중간

---

### 🟡 작업 4. Google Maps / GPS 연동

**목적**: "어디 가기, 어디 들르기" 같은 이동 포함 작업의 시간을 거리 기반 정확 계산.

**연동 방식**:
- 사용자 현재 위치: 브라우저 Geolocation API
- 장소 검색: Google Places API
- 거리/이동 시간: Google Distance Matrix API

**활용처**:
- 단계 제목에서 장소 키워드 추출 ("도서관", "역", "스타벅스" 등) → 사용자 현재 위치에서 거리 계산
- **이동 시간**을 단계 estimated 에 자동 추가
- 여러 장소 들를 시 순서 최적화 (TSP 근사)

**연동 깊이 — 결정 필요**:
- **A안 (가장 단순)**: GPS 만 사용 (현재 위치 → 키워드 매칭으로 거리 계산)
- **B안**: GPS + Places API (장소 자동 인식)
- **C안**: GPS + Places + Distance Matrix (정확한 이동 시간)

**의존 사항**:
- Google Maps API 키
- 브라우저 위치 권한 동의
- 설정 페이지 연결/해제 UI (작업 5 의존)
- 비용: Google Maps API 월 $200 무료 크레딧 후 종량제

**우선순위**: 🟡 중간

---

### 🟡 작업 5. 설정 페이지 (`/settings`)

**목적**: 외부 연동 키 입력 및 토글 UI 통합 관리.

**구성 요소**:

**A. 계정 섹션**
- 로그인 정보 표시
- 로그아웃

**B. 외부 연동 섹션**
- Google Calendar 연결/해제 (작업 3 의존)
- Google Maps API 키 입력 (작업 4 의존)

**C. 데이터 관리 섹션**
- 학습 데이터 관리 (`/learning` 으로 이동) — 이미 구현됨
- 모든 기록 내보내기 (JSON)
- 모든 데이터 초기화

**D. 시간 추정 섹션** (작업 1 의존)
- 사전 항목 추가/편집 (선택)
- 카테고리별 평균 시간 조정
- 신뢰도 표시 토글

**보안 고려**:
- API 키는 localStorage 저장 시 암호화 검토
- 또는 sessionStorage 만 (탭 닫으면 사라짐)
- 외부 연동 비활성화 시 해당 데이터 즉시 제거

**우선순위**: 🟡 중간 (작업 3, 4 진행 시 의미 있음)

---

## 3. 작업 순서 권장안

```
[Phase 1 — 즉시 처리] 🔴
  └─ 작업 2: Analysis 페이지 버그 수정
     └─ 사용자가 현재 페이지 자체를 못 봄

[Phase 2 — 모델 정확도] 🟢
  └─ 작업 1: 시간 추정 외부 추론 구현 (E안)
     ├─ 디렉토리 구조 + 유틸 작성
     ├─ 사전 v1 (한 100+200, 영 100+200)
     ├─ resolver + 12개 버그 케이스
     ├─ engine.js 통합
     ├─ UI 신뢰도 표시
     └─ 검증 세트 10개 실행

[Phase 3 — 외부 연동 인프라] 🟡
  ├─ 작업 5: 설정 페이지 골격
  ├─ 작업 3: Google Calendar 연동 (A안 → B안)
  └─ 작업 4: Google Maps / GPS 연동 (A안 → B안 → C안)
```

각 Phase 완료 시점에 ZIP 패키징 + CHANGES.md 업데이트.

---

## 4. 결정 대기 항목 (사용자 피드백 필요)

| # | 항목 | 옵션 | 권장안 |
|---|---|---|---|
| Q1 | 사전 크기 (작업 1) | 한 100+200 / 더 큰 사전 | 한 100+200 |
| Q2 | UI 신뢰도 표시 (작업 1) | 노출 / 비노출 | 노출 |
| Q3 | 검증 세트 크기 (작업 1) | 10개 / 더 많이 | 10개 |
| Q4 | Analysis 버그 수정 시점 | 이번 라운드 / 별도 | Phase 1 (즉시) |
| Q5 | 캘린더·지도 연동 시점 | 모델 정확도와 함께 / 다음 라운드 | 다음 라운드 |
| Q6 | 캘린더 연동 깊이 (작업 3) | A / B / C안 | 미결정 |
| Q7 | 지도 연동 깊이 (작업 4) | A / B / C안 | 미결정 |
| Q8 | 설정 페이지 (작업 5) | 신규 페이지 / .env 안내만 | 신규 페이지 |

---

## 5. 변경되지 않을 사항 (안정 영역)

다음 항목은 향후 라운드에서 건드리지 않습니다.

- 메인 페이지 구조 (좌 사이드바 + 우 입력 박스 1:3)
- Focus 페이지 사이드바 + 우 대시보드 구조
- Atelier Cyan 디자인 토큰
- 1920×1080 비율
- 역수 속도 공식 (v6h)
- 다중 세션 / 일시 정지 / 그래프 인터랙션 (v6i)
- 기록 삭제 / 학습 데이터 관리 / 통합 박스 광원

---

## 6. 의존성 / 환경

- React + Vite (변경 없음)
- Supabase (선택 인증, 변경 없음)
- 새 의존성 추가 가능성:
  - 작업 1: **없음** (모두 자체 구현)
  - 작업 3: `googleapis` 또는 직접 fetch
  - 작업 4: `@googlemaps/js-api-loader` 또는 직접 fetch

---

## 7. 진행 명령

위 결정 대기 항목 (Q1–Q8) 답변 주시면 **Phase 1 → Phase 2 순서**로 진행.

간단 답변 형식 예시:
```
Q1 기본 / Q2 노출 / Q3 10개 / Q4 Phase1 /
Q5 다음 라운드 / Q6 A안 / Q7 A안 / Q8 신규 페이지
```

답변 받기 전까지 **코드 작성에 들어가지 않습니다** (이전 지시 사항 준수 — 모델 정확도 개선은 명령 받기 전 작업 금지).

---

## 8. 이전 README (참고)

이전 패치 노트 (`patch-v6a-hardgate`, 2026-04-24)는 더 이상 유효한 진행 상황을 반영하지 않아 본 문서로 대체했습니다. 필요 시 `CHANGES.md` 의 v6a 섹션 참조.
