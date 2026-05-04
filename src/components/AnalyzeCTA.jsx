/* AnalyzeCTA.jsx — 우측 입력 모드 분석 실행 (Atelier Cyan v6c — image-match)
 * 다크 글래스 pill. "분석 실행하기 →" + 우측 슈팅스타 글로우.
 * 이미지처럼 약 50% 폭으로 우측 정렬. 작은 컴팩트 사이즈.
 * Props: onClick, disabled, count */

import { T2, T } from '../constants';

export function AnalyzeCTA({ onClick, disabled, count }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '20px 28px',
        background: 'rgba(28, 26, 24, 0.92)',
        backdropFilter: '20px',
        WebkitBackdropFilter: '20px',
        border: `1px solid ${'rgba(255,255,255,0.06)'}`,
        borderRadius: 18,
        color: '#FFFFFF',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.20)',
        opacity: disabled ? 0.45 : 1,
        transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
        minWidth: 280,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 14px 40px rgba(0, 82, 45, 0.20), 0 1px 0 rgba(255,255,255,0.06) inset';
        e.currentTarget.style.borderColor = 'rgba(79, 224, 168, 0.20)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.20)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      }}
    >
      {/* 슈팅스타: 우측에서 시작해 아치를 그리는 광선 */}
      <ShootingStar />

      <span style={{
        fontSize: 16,
        fontWeight: T2.font.weightSemibold,
        letterSpacing: T2.font.tracking.tight,
        position: 'relative',
        flex: 1,
        whiteSpace: 'nowrap',
      }}>
        분석 실행하기 <span aria-hidden style={{ marginLeft: 4 }}>→</span>
      </span>

      <span style={{
        position: 'relative',
        width: 30,
        height: 30,
        borderRadius: 8,
        background: 'rgba(79, 224, 168, 0.10)',
        border: '1px solid rgba(79, 224, 168, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        color: T2.color.accent,
        flexShrink: 0,
      }} aria-hidden>→</span>

      {/* 카운트 인디케이터 (작게, 우상단) */}
      {count > 0 && !disabled && (
        <span style={{
          position: 'absolute',
          top: 6, right: 6,
          fontSize: 9,
          color: 'rgba(255,255,255,0.45)',
          fontFamily: T2.font.familyMono,
          letterSpacing: '0.06em',
        }}>{count}</span>
      )}
    </button>
  );
}

function ShootingStar() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: -10, top: '50%',
        transform: 'translateY(-50%)',
        width: 240, height: 80,
        pointerEvents: 'none',
      }}
      viewBox="0 0 240 80"
    >
      <defs>
        <linearGradient id="ctaTrail" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(79, 224, 168, 0)" />
          <stop offset="80%" stopColor="rgba(79, 224, 168, 0.55)" />
          <stop offset="100%" stopColor="rgba(79, 224, 168, 0.95)" />
        </linearGradient>
        <radialGradient id="ctaSparkle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
          <stop offset="40%" stopColor="rgba(79, 224, 168, 0.7)" />
          <stop offset="100%" stopColor="rgba(79, 224, 168, 0)" />
        </radialGradient>
      </defs>
      <path d="M0 70 Q 100 30, 220 18" stroke="url(#ctaTrail)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="220" cy="18" r="14" fill="url(#ctaSparkle)" />
      <circle cx="220" cy="18" r="2.2" fill="white" />
    </svg>
  );
}
