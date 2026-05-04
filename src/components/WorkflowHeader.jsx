/* WorkflowHeader.jsx — 우측 input 모드 헤더 (Atelier Cyan v6c — image-match)
 * ← 메인 (pill button) + Work Flow + Step 1 / 본문 2줄 / 우측 wave 데코
 * Props: onBack, onShowGuide */

import { T2, T } from '../constants';

export function WorkflowHeader({ onBack, onShowGuide }) {
  return (
    <header style={{ marginBottom: 30, position: 'relative' }}>
      {/* 우측 상단 영역에 wave 데코 */}
      <WaveDeco />

      {/* 1단: ← 메인 버튼 + 제목 + Step 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, position: 'relative', flexWrap: 'wrap' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: T2.font.weightMedium,
              color: T2.color.textSecondary,
              background: 'rgba(255, 255, 255, 0.65)',
              border: `1px solid ${'rgba(47, 36, 30, 0.14)'}`,
              borderRadius: 9999,
              cursor: 'pointer',
              fontFamily: 'inherit',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 200ms ease, color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
              e.currentTarget.style.color = T2.color.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)';
              e.currentTarget.style.color = T2.color.textSecondary;
            }}
          >
            <span aria-hidden>←</span>
            <span>메인</span>
          </button>
        )}

        <h1 style={{
          margin: 0,
          fontFamily: T2.font.familyDisplay,
          fontSize: 36,
          fontWeight: T2.font.weightSemibold,
          letterSpacing: T2.font.tracking.tightest,
          lineHeight: 1.1,
          color: T2.color.text,
        }}>Work Flow</h1>

        <span style={{
          padding: '4px 11px',
          fontSize: 11,
          fontFamily: T2.font.familyMono,
          fontWeight: T2.font.weightMedium,
          color: T2.color.primary,
          background: T2.color.accent,
          border: `1px solid rgba(0, 82, 45, 0.10)`,
          borderRadius: 9999,
          letterSpacing: '0.04em',
          alignSelf: 'center',
          marginTop: 4,
        }}>Step 1</span>

        {/* 가이드 버튼은 제거됨 (이미지에 없음). onShowGuide prop은 호환성 유지. */}
        {false && onShowGuide && (
          <button onClick={onShowGuide}>가이드</button>
        )}
      </div>

      {/* 2단: 본문 설명 */}
      <p style={{
        margin: 0,
        fontSize: 14,
        color: T2.color.textSecondary,
        lineHeight: 1.7,
        maxWidth: 580,
        position: 'relative',
      }}>
        할 일 이름만 입력하면 AI가 필요한 시간과 세부 스텝을 자동으로 산정합니다.
        <br />
        특정 시간에 반드시 시작해야 하는 일정이라면 <span aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: T2.color.textMuted }}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" />
          </svg>
        </span> 고정 시간을 지정하세요.
      </p>
    </header>
  );
}

function WaveDeco() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: 0,
        top: -10,
        width: 'min(46%, 380px)',
        height: 88,
        pointerEvents: 'none',
      }}
      viewBox="0 0 380 88"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wfWave2" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={T2.color.primary} stopOpacity="0" />
          <stop offset="50%" stopColor={T2.color.accent} stopOpacity="0.42" />
          <stop offset="100%" stopColor={T2.color.accent} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M-10 70 Q 70 60, 130 50 T 260 28 T 380 8"
        stroke="url(#wfWave2)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="378" cy="9" r="2.4" fill={T2.color.accent} />
      <circle cx="378" cy="9" r="6" fill={T2.color.accent} opacity="0.18" />
    </svg>
  );
}
