/* ═══════════════════════════════════════════════════════════════
   constants.js — 디자인 토큰, 카테고리, 유틸리티 함수

   2026-04 Sprout 시스템 전면 적용 (patch-v6a-design-system).
     - 팔레트: deep forest #00522D / mint #C5E8D6 / soft mint white #F6FBF4
     - 폰트: Plus Jakarta Sans + Noto Sans KR
     - 가이드: Lenu의 메인 대시보드 빌드 가이드 v1.1 (aimo-main-dashboard-build-guide.md)

   하이브리드 토큰 구조:
     - 평면 키 (T.accent, T.bgRoot 등): 기존 32곳 코드 호환성 유지. 색상값만 Sprout으로 교체.
     - 새 nested 키 (T.color.*, T.font.*, T.space.*, T.radius.*, T.shadow.*):
       Lenu 가이드 명세 그대로. 메인 페이지 재빌드 시점부터 사용 권장.

   브랜드 표기:
     - 외부 노출 브랜드명 = AIMO (Lenu 가이드 9-1 시니어 결정)
     - 내부 라이브러리/저장소명 = AIMO (이미 일치)
     - 코드 내 하드코딩 텍스트("détente" 등)는 점진 정리
   ═══════════════════════════════════════════════════════════════ */

/* ─── Sprout 팔레트 (단일 진실 원천) ────────────────────────── */
const SPROUT = {
  primary:       '#00522D',  // deep forest
  primaryHover:  '#00422A',
  primaryDark:   '#003319',
  mint:          '#C5E8D6',  // secondary container
  mintSoft:      '#E8F4ED',  // hover bg

  bgPage:        '#F6FBF4',  // 페이지 배경 (소프트 민트 화이트)
  bgCard:        '#FFFFFF',
  bgCardDark:    '#0E1614',  // Today Overview, 분석 실행 CTA
  bgElevated:    '#EBEFE8',

  textPrimary:   '#181D19',
  textSecondary: '#5C6760',
  textMuted:     '#8A9590',
  textOnDark:    '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.65)',

  border:        'rgba(24, 29, 25, 0.06)',
  borderStrong:  'rgba(24, 29, 25, 0.10)',
  borderDashed:  'rgba(24, 29, 25, 0.18)',
  divider:       'rgba(24, 29, 25, 0.04)',

  // 상태 색상
  success:       '#00522D',  // 빠른 완료 = 브랜드 그린
  successSoft:   'rgba(0, 82, 45, 0.10)',
  warning:       '#E8A33D',  // 주의
  warningSoft:   'rgba(232, 163, 61, 0.12)',
  error:         '#D14D4D',  // 오류
  errorSoft:     'rgba(209, 77, 77, 0.10)',
  notif:         '#E26D5A',  // 알림 배지

  // primary 의 다양한 alpha (rgba 직접 사용 회피용)
  primaryAlpha04: 'rgba(0, 82, 45, 0.04)',
  primaryAlpha06: 'rgba(0, 82, 45, 0.06)',
  primaryAlpha10: 'rgba(0, 82, 45, 0.10)',
  primaryAlpha12: 'rgba(0, 82, 45, 0.12)',
  primaryAlpha18: 'rgba(0, 82, 45, 0.18)',
  primaryAlpha25: 'rgba(0, 82, 45, 0.25)',

  // 다크 카드 우측 글로우
  darkGlow: 'radial-gradient(ellipse at right, rgba(60, 180, 120, 0.18) 0%, transparent 60%)',
};

/* ─── 평면 키 (기존 코드 호환성) ─────────────────────────────
   기존 32곳의 T.accent / T.bgRoot 등 참조가 그대로 동작하도록
   매핑. 색상값만 Sprout으로 교체. */
export const T = {
  // 배경
  bgRoot:        SPROUT.bgPage,
  bgSurface:     SPROUT.bgCard,
  bgCard:        SPROUT.bgCard,
  bgElevated:    SPROUT.bgElevated,

  // 보더
  border:        SPROUT.border,
  borderLight:   SPROUT.divider,

  // 액센트 (브랜드 primary)
  accent:        SPROUT.primary,
  accentSoft:    SPROUT.primaryAlpha10,
  accentMid:     SPROUT.primaryAlpha18,
  accentGlow:    `0 0 16px ${SPROUT.primaryAlpha25}`,
  accentHover:   SPROUT.primaryHover,

  // 액센트 보조 (구 periwinkle 자리. 신 시스템에서는 mint 사용)
  accent2:       SPROUT.mint,
  accent2Soft:   SPROUT.mintSoft,
  accent3:       SPROUT.primaryDark,
  accent3Soft:   SPROUT.primaryAlpha10,

  // 상태
  error:         SPROUT.error,
  errorSoft:     SPROUT.errorSoft,
  success:       SPROUT.success,
  successSoft:   SPROUT.successSoft,
  warning:       SPROUT.warning,
  warningSoft:   SPROUT.warningSoft,

  // 텍스트
  textPrimary:   SPROUT.textPrimary,
  textSecondary: SPROUT.textSecondary,
  textMuted:     SPROUT.textMuted,
  textOnAccent:  SPROUT.textOnDark,

  // 완료 상태
  done:          SPROUT.textMuted,
  doneBg:        SPROUT.bgElevated,
  currentBg:     SPROUT.primaryAlpha06,
  currentBorder: SPROUT.primary,

  // 폰트 패밀리
  font:    "'Plus Jakarta Sans','Noto Sans KR','Pretendard',-apple-system,BlinkMacSystemFont,sans-serif",
  mono:    "'JetBrains Mono','Fira Code',ui-monospace,Menlo,monospace",
  display: "'Plus Jakarta Sans',-apple-system,sans-serif",  // 영문 디스플레이

  /* ─── 새 nested 토큰 (Lenu 가이드 §2 그대로) ────────────── */

  color: {
    // 배경
    bgPage:          SPROUT.bgPage,
    bgCard:          SPROUT.bgCard,
    bgCardDark:      SPROUT.bgCardDark,
    bgElevated:      SPROUT.bgElevated,

    // 텍스트
    textPrimary:     SPROUT.textPrimary,
    textSecondary:   SPROUT.textSecondary,
    textMuted:       SPROUT.textMuted,
    textOnDark:      SPROUT.textOnDark,
    textOnDarkMuted: SPROUT.textOnDarkMuted,

    // 액센트
    primary:         SPROUT.primary,
    primaryHover:    SPROUT.primaryHover,
    mint:            SPROUT.mint,
    mintSoft:        SPROUT.mintSoft,

    // 그라디언트
    darkGlow:        SPROUT.darkGlow,

    // 보더
    border:          SPROUT.border,
    borderStrong:    SPROUT.borderStrong,
    borderDashed:    SPROUT.borderDashed,
    divider:         SPROUT.divider,

    // 상태
    rankFast:        SPROUT.primary,
    rankAvg:         '#7B8EB8',  // Lenu 가이드 §2-1 명시
    success:         SPROUT.success,
    successSoft:     SPROUT.successSoft,
    warning:         SPROUT.warning,
    warningSoft:     SPROUT.warningSoft,
    error:           SPROUT.error,
    errorSoft:       SPROUT.errorSoft,

    // 알림
    notifBadge:      SPROUT.notif,
  },

  font_: {  // T.font 가 string 으로 사용 중이라 충돌 회피용 별칭
    family:        "'Plus Jakarta Sans','Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif",
    familyDisplay: "'Plus Jakarta Sans',-apple-system,sans-serif",
    size: {
      logo:    36,
      display: 56,
      h1:      28,
      statBig: 34,
      rankNum: 34,
      title:   16,
      body:    15,
      caption: 13,
      tiny:    11,
    },
    weight: {
      light:     300,
      regular:   400,
      medium:    500,
      semibold:  600,
      bold:      700,
      extrabold: 800,
    },
    tracking: {
      tight:  '-0.01em',
      normal: '0',
      wide:   '0.04em',
      wider:  '0.12em',
    },
    leading: {
      tight:   1.15,
      normal:  1.45,
      relaxed: 1.6,
    },
  },

  space: {
    xs:      4,
    sm:      8,
    md:      16,
    lg:      24,
    xl:      32,
    xxl:     48,
    xxxl:    64,
    section: 96,
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   20,
    xl:   24,
    pill: 9999,
  },

  shadow: {
    none:    'none',
    ambient: '0 4px 24px rgba(45, 75, 62, 0.05)',
    hover:   '0 6px 28px rgba(45, 75, 62, 0.08)',
    cta:     '0 8px 32px rgba(0, 82, 45, 0.12)',
    dark:    '0 6px 24px rgba(0, 0, 0, 0.18)',
  },

  /* 브랜드 표기 (Lenu 9-1 시니어 결정) */
  brand: {
    name: 'AIMO',
  },
};

/* ─── PASTELS — 카드 배경 컬러 (Sprout 톤으로 재구성) ────── */
export const PASTELS = [
  { bg: '#E8F4ED', border: '#C5E8D6' },  // mint
  { bg: '#EFF5EA', border: '#D4E5C6' },  // sage light
  { bg: '#F0EFE6', border: '#DCD8C0' },  // warm sand
  { bg: '#E8EFEC', border: '#C8D8D0' },  // pale teal
  { bg: '#EEEAE5', border: '#D8CDB8' },  // earth
  { bg: '#E5EDE8', border: '#BFD3C7' },  // green-grey
  { bg: '#EBE8DE', border: '#D5CDB8' },  // beige
];

/* ─── 카테고리 — 색상만 새 팔레트 톤으로 조정 ────────────── */
export const CATEGORIES = [
  { key: 'move',     label: '이동',      icon: '🚶', color: '#7B8EB8' },
  { key: 'talk',     label: '대화',      icon: '💬', color: '#C49873' },
  { key: 'organize', label: '자료 정리', icon: '📂', color: '#5B8C6A' },
  { key: 'create',   label: '창작',      icon: '✏️', color: '#A87BA0' },
  { key: 'digital',  label: '디지털',    icon: '💻', color: '#6A9BC4' },
  { key: 'physical', label: '신체 활동', icon: '🏃', color: '#C49B6A' },
  { key: 'wait',     label: '대기/점검', icon: '⏳', color: '#A0A078' },
  { key: 'other',    label: '기타',      icon: '📌', color: '#8A9590' },
];

/* ─── 유틸 함수 (변경 없음) ──────────────────────────────── */

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatMin(min) {
  if (min < 1) return '1분 미만';
  if (min < 60) return `${Math.round(min)}분`;
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export function formatDate(d) {
  return (d instanceof Date ? d : new Date(d)).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
