/* ═══════════════════════════════════════════════════════════════
   constants.js — 디자인 토큰, 카테고리, 유틸리티 함수
   
   팔레트: HackHack 블루·보라 톤 (2026-04 업그레이드)
     - 브랜드: #2828cd (primary) / #1a1a85 (dark) / #dcdcf7 (light)
     - 서브: #7878e1 (periwinkle/tag purple)
     - 상태: #FF2E63 (ended), #00a86b (fast), #f59e0b (warning)
   ═══════════════════════════════════════════════════════════════ */

export const T = {
  bgRoot: "#f0f2f5", bgSurface: "#FFFFFF", bgCard: "#f7f7fb",
  bgElevated: "#e8e8f2", border: "#dde1e6", borderLight: "#edeff3",

  accent: "#2828cd", accentSoft: "rgba(40,40,205,0.10)",
  accentMid: "rgba(40,40,205,0.18)",
  accentGlow: "0 0 16px rgba(40,40,205,0.25)",
  accentHover: "#1e1ea5",

  accent2: "#7878e1", accent2Soft: "rgba(120,120,225,0.14)",
  accent3: "#1a1a85", accent3Soft: "rgba(26,26,133,0.10)",

  error: "#FF2E63", errorSoft: "rgba(255,46,99,0.12)",
  success: "#00a86b", successSoft: "rgba(0,168,107,0.12)",
  warning: "#f59e0b", warningSoft: "rgba(245,158,11,0.15)",

  textPrimary: "#12121a", textSecondary: "#4b5563",
  textMuted: "#6b6b80", textOnAccent: "#FFFFFF",

  done: "#9a9aab", doneBg: "#e8e8ed",
  currentBg: "rgba(40,40,205,0.08)", currentBorder: "#2828cd",

  font: "'Noto Sans KR','Pretendard',-apple-system,sans-serif",
  mono: "'JetBrains Mono','Fira Code',monospace",
  display: "'Playfair Display',Georgia,serif",
};

export const PASTELS = [
  { bg: "#e8e8f5", border: "#c4c4e8" },
  { bg: "#dce4f0", border: "#a8b8d4" },
  { bg: "#f0e8f5", border: "#dcc4e5" },
  { bg: "#e4eaf5", border: "#bac8e8" },
  { bg: "#e8e4f5", border: "#c8bee5" },
  { bg: "#dcdcf7", border: "#b4b4e8" },
  { bg: "#f5e8f0", border: "#e5c4d8" },
];

export const CATEGORIES = [
  { key: "move", label: "이동", icon: "🚶", color: "#7B8EB8" },
  { key: "talk", label: "대화", icon: "💬", color: "#D4956A" },
  { key: "organize", label: "자료 정리", icon: "📂", color: "#5B8C6A" },
  { key: "create", label: "창작", icon: "✏️", color: "#B87BA0" },
  { key: "digital", label: "디지털", icon: "💻", color: "#6A9BD4" },
  { key: "physical", label: "신체 활동", icon: "🏃", color: "#D49B6A" },
  { key: "wait", label: "대기/점검", icon: "⏳", color: "#A0A078" },
  { key: "other", label: "기타", icon: "📌", color: "#A0A0A0" },
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
