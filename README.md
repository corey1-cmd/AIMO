# Day 6a 완료 보고

**일자**: 2026-04-24
**단계**: Day 6a (Supabase Auth 연결 + 번들 분리)
**상태**: 구현 완료, 통합 빌드 검증 통과

---

## 산출물 목록

**Auth 레이어 (신규)**
- `src/auth/supabase.js` — 싱글톤 클라이언트, PKCE flow, `detente-auth` storage key
- `src/auth/AuthProvider.jsx` — 3상태 context (loading / authenticated / unauthenticated)
- `src/auth/AuthButton.jsx` — Nav 삽입용 버튼, flash 방지 placeholder

**통합 변경**
- `src/main.jsx` — AuthProvider로 App 래핑
- `src/App.jsx` — AuthButton import + NavBar 우측 끝 삽입
- `package.json` — `@supabase/supabase-js ^2.104.1` 의존성 추가

**빌드·배포 설정**
- `vite.config.js` — manualChunks로 supabase 별도 청크 분리
- `vercel.json` — SPA rewrites + `/share/*` 경로 X-Robots-Tag 서버 헤더
- `.env.example` — 환경변수 3개 템플릿

**Day 6b 준비물**
- `schema.sql` — 시니어 2 확정본 전체 스키마 + RLS 검증 쿼리 주석

---

## 빌드 검증 결과

로컬 통합 환경(`/home/claude/build-test`)에서 `npm install && npx vite build` 성공적으로 통과했습니다. 번들 분리는 설계대로 동작합니다.

| 청크 | Raw | Gzip |
|---|---:|---:|
| index (main) | 881.31 KB | 168.40 KB |
| supabase (신규) | 197.04 KB | 51.80 KB |

patch-v5의 메인 번들이 167KB gzip이었는데 patch-v6a의 메인은 168KB gzip입니다. AuthProvider와 AuthButton 추가에도 불구하고 supabase 본체가 별도 청크로 분리되어 메인 번들은 사실상 변화가 없습니다. 사용자가 로그인 버튼을 클릭하거나 AuthProvider가 초기 세션을 조회할 때 비로소 supabase 청크(51.80 KB)가 로드됩니다.

Vite 경고가 여전히 표시되지만 이는 detnete의 엔진 모듈(`ai/types-v3.js` 1.2MB)이 유발하는 것으로 Day 6 범위 밖 이슈입니다.

---

## 시니어 2 체크포인트 항목에 대한 응답

**Flash 현상 방지**

AuthProvider의 status state가 `'loading'`에서 시작하도록 초기값을 명시했습니다. AuthButton은 `status === 'loading'`일 때 텍스트 없는 80px 너비 placeholder만 렌더합니다. 세션 확인이 끝난 후 비로소 "로그인" 또는 "로그아웃" 버튼으로 전환됩니다. 이로써 새로고침 시 비로그인 UI가 순간적으로 번쩍이는 현상이 구조적으로 차단됩니다.

실제 확인은 Vercel 배포 후 브라우저 새로고침 테스트로만 가능합니다. 제가 시뮬레이션할 수 없는 부분이라 `patch-v6a.zip` 전달 후 사용자가 직접 검증하시는 것이 남은 단계입니다. 테스트 절차는 Vercel preview 배포 → Google 로그인 → 페이지 새로고침 5회 연속 수행 → 우측 상단 영역의 flash 여부 관찰입니다.

**세션 지속성**

`persistSession: true`와 `autoRefreshToken: true` 설정이 반영되었습니다. `storageKey: 'detente-auth'`로 로컬스토리지에 세션이 저장되므로 탭을 닫았다가 다시 열어도 로그인 상태가 유지됩니다. Access token 만료 전에 자동으로 갱신됩니다. 이 역시 실제 검증은 배포 후 테스트가 필요합니다.

---

## 신 Publishable key 체계 호환성 확인

사용자 보고에서 Supabase 프로젝트가 Legacy JWT keys를 Disable하고 새로운 Publishable key 체계(`sb_publishable_...`)를 사용 중임을 확인했습니다. `@supabase/supabase-js ^2.104.1`은 양쪽 key 형식을 모두 지원하므로 `createClient(url, publishableKey)` 호출이 그대로 동작합니다. 환경변수명은 시니어 2 브리프와의 호환성을 위해 `VITE_SUPABASE_ANON_KEY`로 유지했습니다. 사용자가 Publishable key를 이 환경변수에 넣으시면 됩니다.

---

## 배포 적용 절차

사용자가 GitHub 저장소에 적용할 순서는 다음과 같습니다.

1. `patch-v6a.zip` 압축 해제
2. `src/auth/` 디렉토리 전체 복사 (신규)
3. `src/main.jsx`, `src/App.jsx` 덮어쓰기
4. `package.json`, `vite.config.js`, `vercel.json`, `.env.example` 덮어쓰기
5. 로컬 테스트를 원하면 `.env.example`을 `.env.local`로 복사 후 실제 값 입력
6. `npm install` 실행 (supabase-js 설치)
7. `npm run dev`로 로컬 검증
8. 저장소 commit → Vercel 자동 배포
9. Vercel 배포 URL에서 Google 로그인 플로우 테스트

`.gitignore`에 `.env.local`이 포함되어 있는지 반드시 확인해야 합니다. 기본 Vite 프로젝트는 포함하지만 혹시 모르니 커밋 전 확인 권장입니다.

---

## 자율 판단 결정사항 재확인

Day 6a 구현 중 추가로 판단한 사소한 결정 2건입니다.

첫째, Supabase `storageKey`를 `detente-auth`로 명시했습니다. 기본값인 `sb-<project_ref>-auth-token`을 그대로 쓰면 사용자의 다른 Supabase 앱과 localStorage 키가 섞일 위험이 있습니다. 앱 고유 prefix를 명시하여 격리했습니다.

둘째, signInWithGoogle 옵션에 `prompt: 'select_account'`를 **넣지 않았습니다**. 이것을 넣으면 로그인할 때마다 Google 계정 선택 화면이 뜹니다. detnete는 개인 생산성 앱이라 단일 계정 사용이 지배적이므로, 두 번째 로그인부터는 계정 선택 없이 바로 진행되는 편이 UX가 매끄럽습니다. 테스트 사용자 다중 전환이 필요해지면 `supabase.js`의 주석에 명시한 대로 옵션을 추가하면 됩니다.

---

## Day 6b 착수 조건

Day 6b는 SQL 스키마 실행과 RLS 검증입니다. 실행 주체는 사용자이며, 다음 순서로 진행하시면 됩니다.

1. Supabase Dashboard → SQL Editor → New Query
2. `schema.sql` 전체 복사 붙여넣기
3. Run 실행 (테이블 4개 + 인덱스 3개 + 정책 6개 생성)
4. Table Editor에서 테이블 4개 존재 확인
5. RLS 검증 쿼리 (schema.sql 말미 주석) 중 테스트 1(익명으로 records select) 실행하여 0 rows 반환 확인

검증 결과를 다음 턴에 공유해주시면 Day 6c 마이그레이션 로직 착수합니다.
