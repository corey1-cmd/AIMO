/* AnalyzeCTA.jsx — 우측 input 모드 분석 실행 (Lenu §4-10)
 * Props: onAnalyze, busy, disabled, count */

import { T } from '../constants';

export function AnalyzeCTA({ onAnalyze, busy, disabled, count }) {
  const isInactive = busy || disabled;

  return (
    <button
      onClick={onAnalyze}
      disabled={isInactive}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '24px 28px',
        width: '100%',
        background: T.color.bgCardDark,
        border: 'none',
        borderRadius: T.radius.xl,
        color: T.color.textOnDark,
        cursor: isInactive ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: T.shadow.cta,
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => {
        if (isInactive) return;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 12px 36px rgba(0, 82, 45, 0.16)';
      }}
      onMouseLeave={(e) => {
        if (isInactive) return;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = T.shadow.cta;
      }}
    >
      <div aria-hidden="true" style={{
        position: 'absolute',
        right: -60,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(60, 180, 120, 0.20) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <span style={{
        flexShrink: 0,
        width: 44, height: 44,
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        position: 'relative',
        color: T.color.mint,
      }} aria-hidden="true">{busy ? '⋯' : '✦'}</span>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative',
        flex: 1,
      }}>
        <span style={{
          fontSize: T.font_.size.title + 2,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: T.font_.tracking.tight,
        }}>{busy ? '분석 중...' : '분석 실행하기'}</span>
        <span style={{
          fontSize: T.font_.size.tiny,
          color: T.color.textOnDarkMuted,
          fontWeight: T.font_.weight.regular,
        }}>
          {busy
            ? '잠시만 기다려주세요'
            : count > 0
              ? `${count}개 항목 → 시간 추정 + 순서 결정`
              : '항목을 추가한 후 실행할 수 있어요'}
        </span>
      </div>

      <span style={{
        position: 'relative',
        fontSize: 18,
        color: T.color.textOnDarkMuted,
        flexShrink: 0,
      }} aria-hidden="true">→</span>
    </button>
  );
}
