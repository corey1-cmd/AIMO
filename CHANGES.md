# AIMO — Atelier Cyan Redesign v6h (역수 모델 속도 공식)

## 이번 라운드 변경 사항 (v6g → v6h)

### 속도 계산 공식 — 역수 모델 채택 (사용자 명세)

**입력값:** x = (실제 시간 / 예상 시간) × 100

**공식:**
- y = round(10000 / x, 2) — 소수점 둘째 자리까지
- y > 100 → 빠르게 진행 중
- y < 100 → 느리게 진행 중
- y = 100 → 정상

**검증 (명세 예시 일치):**
- x = 92  → y = 108.70 → "8.7% 빠르게 진행되고 있어요!"
- x = 98  → y = 102.04 → "2.04% 빠르게 진행되고 있어요!"
- x = 400 → y = 25.00  → "75% 느리게 진행되고 있어요!"
- x = 100 → y = 100    → "정상 속도로 진행 중입니다."

### 변경 내역

**`src/constants.js`** — 신규 유틸 추가
- `getSpeedY(x)` : x → y 변환 (둘째 자리 반올림)
- `getSpeedStatus(x)` : { y, diff, type, message } 반환
- `getSpeedStatusFromMins(estMin, actualMin)` : 시간 직접 입력용 어댑터

**`src/components/FocusDashboard.jsx`**
- `LiveTimerCard` (현재 세션 타이머):
  - 진행률 바 위 우측에 y값 표시 (둘째 자리, 색상 분기)
  - 진행률 바 아래에 **상태 메시지 박스** 신설
  - 빠름: 진녹색 / 느림: 주황색 / 정상: 회색
  - 메시지 예: "8.7% 빠르게 진행되고 있어요!"
- `useFocusStats` (히스토리 작업 속도 추이):
  - 일별 efficiency 계산을 둘째 자리까지 (`Math.round(... * 100) / 100`)
  - trend item에 `status` 객체도 함께 저장 (필요 시 활용 가능)
- `SpeedTrendCard` 호버 툴팁:
  - "속도" 행 표시를 둘째 자리까지 (`108.70%` 형태)

## 변경 파일 (총 2개)

```
src/constants.js                         ← getSpeedY, getSpeedStatus, getSpeedStatusFromMins
src/components/FocusDashboard.jsx        ← LiveTimerCard 메시지, trend 정밀
```

(이전 v6g의 19개 파일이 모두 포함됨 — 누적 적용 가능하도록 ZIP에 같이 들어 있습니다)

## 검증
- `npx vite build` 통과
- 명세 예시 4개 (x=92, 98, 100, 400) 모두 일치 확인 (Node CLI 검증 완료)
- 의존성 변경 없음

## 적용
```bash
unzip AIMO-changes.zip
cp -r AIMO-changes/* <원본 AIMO 폴더>/
cd <원본 AIMO 폴더>
npm install
npm run dev
```

## 동작 시나리오

```
세션 진행 중 → LiveTimerCard 가 실시간 업데이트
  → 예상 100분, 실제 92분 경과 시:
     - 진행률 바 우측: "108.70%"
     - 메시지 박스: "8.7% 빠르게 진행되고 있어요!" (진녹색)
  → 예상 100분, 실제 130분 경과 시 (x=130):
     - y = 76.92, 진행률 바 우측: "76.92%"
     - 메시지 박스: "23.08% 느리게 진행되고 있어요!" (주황색)

작업 속도 추이 차트 호버:
  → 툴팁의 "속도" 행: "108.70%" (둘째 자리)
```

## 유지된 항목
- 모든 v6g 변경 그대로 유지 (Focus 통합, 라이브 타이머, 다음 할 일, 기록 삭제 등)
- 좌측 사이드바 / 통합 박스 광원 / 1920×1080 / 1:3 비율
