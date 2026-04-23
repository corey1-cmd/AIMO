/* ═══════════════════════════════════════════════════════════════
   constants.js — 디자인 토큰, 카테고리, 유틸리티 함수

   팔레트: Sprout 네이처 그린 톤 (2026-04 재업그레이드)
     - 브랜드: #00522d (primary, 딥 포레스트) / #006d3e (container) / #2D3D33 (CTA sage)
     - 서브: #466557 (sage secondary) / #c5e8d6 (민트 컨테이너)
     - 상태: #ba1a1a (error), #006d3e (success), #d97757 (terracotta warm)
     - 폰트: Plus Jakarta Sans (전체) + Noto Sans KR (한글 폴백)
   ═══════════════════════════════════════════════════════════════ */

export const T = {
  bgRoot: "#f6fbf4", bgSurface: "#ffffff", bgCard: "#f0f5ee",
  bgElevated: "#ebefe8", border: "#bec9be", borderLight: "#dfe4dd",

  accent: "#00522d", accentSoft: "rgba(0,82,45,0.10)",
  accentMid: "rgba(0,82,45,0.18)",
  accentGlow: "0 4px 24px rgba(45,75,62,0.05)",
  accentHover: "#003d22",

  accent2: "#466557", accent2Soft: "rgba(70,101,87,0.14)",
  accent3: "#2D3D33", accent3Soft: "rgba(45,61,51,0.10)",

  // Sprout secondary-container 계열 — 민트 톤 soft 컨테이너
  mint: "#c5e8d6", mintStrong: "#9bd4b5", onMint: "#002111",

  error: "#ba1a1a", errorSoft: "rgba(186,26,26,0.12)",
  success: "#006d3e", successSoft: "rgba(0,109,62,0.12)",
  warning: "#d97757", warningSoft: "rgba(217,119,87,0.15)",

  textPrimary: "#181d19", textSecondary: "#3f4941",
  textMuted: "#6f7a70", textOnAccent: "#ffffff",

  done: "#6f7a70", doneBg: "#e5e9e3",
  currentBg: "rgba(0,82,45,0.08)", currentBorder: "#00522d",

  // Sprout shadow 체계: ambient는 매우 낮고(0.05) 부드러움
  shadowAmbient: "0 4px 24px rgba(45,75,62,0.05)",
  shadowRaised: "0 8px 32px rgba(45,75,62,0.12)",
  shadowNav: "0 4px 24px rgba(45,75,62,0.05)",
  shadowCta: "0 4px 24px rgba(45,75,62,0.18)",
  shadowCtaHover: "0 6px 28px rgba(45,75,62,0.26)",

  // Sprout radius 체계: lg=2rem(32), xl=3rem(48), 카드는 대체로 rounded-lg
  radiusCard: "24px",
  radiusCardLg: "32px",
  radiusCtaPill: "9999px",

  // Plus Jakarta Sans를 우선 로드 — 한글은 Noto Sans KR로 폴백
  font: "'Plus Jakarta Sans','Noto Sans KR','Pretendard',-apple-system,BlinkMacSystemFont,sans-serif",
  mono: "'JetBrains Mono','Fira Code',monospace",
  display: "'Plus Jakarta Sans','Noto Sans KR','Pretendard',-apple-system,BlinkMacSystemFont,sans-serif",
};

export const PASTELS = [
  { bg: "#e0ebe2", border: "#bed0c0" },
  { bg: "#d9e5d5", border: "#b4c9ad" },
  { bg: "#e8ebe0", border: "#c8ceb8" },
  { bg: "#dfe8e1", border: "#bcc9be" },
  { bg: "#e4ede0", border: "#c0ceb8" },
  { bg: "#d8e8dd", border: "#b0c8ba" },
  { bg: "#e6ede4", border: "#c4cfc2" },
];

export const CATEGORIES = [
  { key: "move",     label: "이동",       icon: "🚶", color: "#6b8e7b" },
  { key: "talk",     label: "대화",       icon: "💬", color: "#d97757" },
  { key: "organize", label: "자료 정리",  icon: "📂", color: "#466557" },
  { key: "create",   label: "창작",       icon: "✏️", color: "#8a7a9e" },
  { key: "digital",  label: "디지털",     icon: "💻", color: "#5b8374" },
  { key: "physical", label: "신체 활동",  icon: "🏃", color: "#c28a5c" },
  { key: "wait",     label: "대기/점검",  icon: "⏳", color: "#9ca88e" },
  { key: "other",    label: "기타",       icon: "📌", color: "#9ca39c" },
];

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatMin(min) {
  if (min < 1) return "1분 미만";
  if (min < 60) return `${Math.round(min)}분`;
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export function formatDate(d) {
  return (d instanceof Date ? d : new Date(d)).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
