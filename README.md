# détente

할 일을 쪼개고, 시간을 예측하고, 실행하는 생산성 앱.

AI 스케줄러 **detnete v3.1.0** (결정적 활동 스케줄러) + 시각적으로 업그레이드된 React UI.

---

## 2026-04 업그레이드 내역

| 항목 | 파일 | 내용 |
|---|---|---|
| **AI 엔진 v3 연동** | `src/ai/`, `src/engine.js` | 1373개 L4 활동 taxonomy, 한국어 자연어 파서, 의존성 추론, 에너지 모델 |
| **3D 틸트 + glow** | `src/useTilt.js` | 커서 팔로우 카드 인터랙션 (터치·접근성 자동 가드) |
| **영속화** | `src/storage.js` | 기록·라이브러리·진행 중 세션 localStorage 저장 |
| **Focus 모드** | `/focus` 라우트 | 하나의 할 일에만 집중하는 포커스 뷰 |
| **메인 대시보드** | `App.jsx` | 총 기록·평균 속도·이번 주 + Top3 + 최근 완료 |
| **StatusBadge** | `App.jsx` | 속도 순위 통일 배지 (fast / avg / slow) |
| **이어서 하기 배너** | 메인 상단 | 탭 닫아도 진행 중 세션 자동 복구 |
| **팔레트 전환** | `constants.js` | 베이지·sage → HackHack 블루(#2828cd)·페리윙클(#7878e1) |

---

## 프로젝트 구조

```
src/
├── main.jsx              React 진입점
├── App.jsx               UI 컴포넌트 전체
├── constants.js          디자인 토큰·카테고리·유틸
├── styles.js             CSS 생성 (토큰 기반)
├── data.js               Mock 초기 기록
├── useTilt.js            3D 틸트 훅
├── storage.js            localStorage 영속화
├── learning.js           학습 데이터
├── engine.js             ★ AI 어댑터 (v3 → UI 계약)
├── engine-legacy.js      구 키워드 엔진 (v3 파싱 실패 시 폴백)
└── ai/                   ★ detnete-scheduler v3.1.0
    ├── analyze-v3.js     Public API: analyze / replan
    ├── parser-v3.js      한국어 자연어 파서
    ├── dependency-engine.js  의존성 추론 (P1–P10)
    ├── dep-rules.js      의존성 규칙 DSL
    ├── scheduler.js      단일 패스 워커 (슬랙 게이트, 에너지)
    ├── time-contract.js  TimeContext, H1–H4 불변식
    ├── interruption.js   중단/재개 상태 머신
    └── types-v3.js       1373개 L4 활동 taxonomy (1.2MB)
```

---

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173
```

---

## 배포

### Vercel (권장 · 가장 쉬움)

1. 이 프로젝트를 GitHub에 푸시
   ```bash
   git init
   git add .
   git commit -m "initial"
   gh repo create detente --public --source=. --push
   ```
2. [vercel.com](https://vercel.com) → **Add New Project** → 레포 Import
3. Framework는 **Vite**로 자동 감지. 빌드 설정은 그대로 두고 **Deploy**.
4. 약 30초 후 `https://detente-xxx.vercel.app` 에서 실제 V3 엔진이 붙은 앱 확인 가능.

푸시할 때마다 자동 재배포됩니다. 환경변수 설정 없음 — 100% 클라이언트 사이드.

### Netlify

Vercel과 동일. Framework: **Vite** 자동 감지. Build: `npm run build` / Publish: `dist`.

### GitHub Pages

`vite.config.js`의 `base`를 레포 이름에 맞게 수정:
```js
base: '/your-repo-name/',
```
그 다음:
```bash
npm install gh-pages --save-dev
npm run build
npx gh-pages -d dist
```

---

## AI 엔진 v3 수정하려면

`src/ai/` 아래 8개 파일만 건드리면 됩니다. UI는 `src/engine.js` 어댑터만 바라보므로 v3 내부 구현을 바꿔도 UI는 그대로입니다.

어댑터 인터페이스:
```js
// src/engine.js 가 UI에 제공하는 것
export { runAnalysis, BEHAVIOR_TYPES, BUCKET_LABELS }

runAnalysis(tasks, learningData) → {
  breakdown: Action[],
  analyses: Analysis[],
  totalEstMin: number,
  totalReward: number,
  totalCost: number,
  v3: { engineVersion, parsed, unmatched, inferred, droppedAnchors, summary }  // 추가
}
```

v3 엔진 자체의 Public API (`analyze`, `replan`, `filterExpiredAnchors`, `TimeContext`) 는 그대로 `src/ai/analyze-v3.js`에서 export 됩니다.

### v3 테스트 실행

v3 자체 테스트 스위트(90 케이스)를 돌리려면:
```bash
cd src/ai
node analyze-v3.js    # 단독 import 테스트
```

원본 테스트 파일(`test-v3.js`)은 이 zip에는 포함하지 않았습니다. v3 원본 zip(detnete-v3_1_0.zip) 에 들어있습니다.

---

## 입력 예시

```
샤워하고 이메일 확인하고 논문 쓰기
```

위 텍스트가 내부적으로 v3 분석을 거쳐:
- `full_shower` (12분, personal_care)
- `email_batch` (30분, work)
- `full_draft` (360분, research · writing_academic)
세 개의 L4 태그로 파싱되고, 에너지 누적·슬랙 게이트·타임라인 배치가 적용되어 UI breakdown으로 내려옵니다.

인식 실패 시 레거시 엔진(키워드 사전 기반) 으로 자동 폴백합니다.

---

## 라이선스

UNLICENSED (내부 프로젝트)
