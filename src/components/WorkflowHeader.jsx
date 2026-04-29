/* WorkflowHeader.jsx — 우측 input 모드 헤더 (Lenu §4-7)
 * "WORK FLOW" 56px extrabold + Make a structure + 가이드 보기 + 데코 라인
 * Props: onShowGuide */

import { T } from '../constants';

export function WorkflowHeader({ onShowGuide }) {
  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 28,
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{
            margin: 0,
            fontFamily: T.font_.familyDisplay,
            fontSize: T.font_.size.display,
            fontWeight: T.font_.weight.extrabold,
            letterSpacing: T.font_.tracking.tight,
            lineHeight: T.font_.leading.tight,
            color: T.color.textPrimary,
          }}>WORK FLOW</h1>
          <span style={{
            fontSize: T.font_.size.body,
            color: T.color.textSecondary,
            fontWeight: T.font_.weight.medium,
          }}>Make a structure</span>
        </div>

        <button
          onClick={onShowGuide}
          style={{
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: T.font_.weight.medium,
            color: T.color.textSecondary,
            background: 'transparent',
            border: `1px solid ${T.color.borderStrong}`,
            borderRadius: T.radius.pill,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 200ms ease, color 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.color.mintSoft;
            e.currentTarget.style.color = T.color.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T.color.textSecondary;
          }}
        >가이드 보기</button>
      </div>

      <svg
        width="100%"
        height="12"
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        style={{ marginTop: 8 }}
        aria-hidden="true"
      >
        <path
          d="M0 6 Q 80 1, 160 6 T 320 6 T 480 6"
          stroke={T.color.primary}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </header>
  );
}
