/* AIMOInfoCard.jsx — 좌측 다섯 번째 카드 (Lenu §4-6)
 * AIMO V3 정보 + 큐브 SVG + LEARN MORE pill
 * Props: onLearnMore */

import { T } from '../constants';

export function AIMOInfoCard({ onLearnMore }) {
  return (
    <section style={{
      background: T.color.bgCard,
      borderRadius: T.radius.lg,
      padding: '24px 22px',
      boxShadow: T.shadow.ambient,
      border: `1px solid ${T.color.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'flex-start',
    }}>
      <Cube />
      <div>
        <div style={{
          fontFamily: T.font_.familyDisplay,
          fontSize: 22,
          fontWeight: T.font_.weight.extrabold,
          fontStyle: 'italic',
          color: T.color.primary,
          letterSpacing: T.font_.tracking.tight,
          marginBottom: 4,
        }}>AIMO V3</div>
        <p style={{
          fontSize: T.font_.size.caption,
          color: T.color.textSecondary,
          lineHeight: T.font_.leading.relaxed,
          margin: 0,
        }}>
          한국어를 자연스럽게 이해하고,
          <br />
          시간을 정확하게 추정합니다.
        </p>
      </div>
      <button
        onClick={onLearnMore}
        style={{
          padding: '6px 14px',
          fontSize: 11,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: T.font_.tracking.wider,
          textTransform: 'uppercase',
          background: T.color.mint,
          color: T.color.primary,
          border: 'none',
          borderRadius: T.radius.pill,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#A8DCBE'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = T.color.mint; }}
      >LEARN MORE →</button>
    </section>
  );
}

function Cube() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke={T.color.primary} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M24 6 L40 14 L40 32 L24 40 L8 32 L8 14 Z" />
        <path d="M24 6 L24 24 L40 14" />
        <path d="M24 24 L8 14" />
        <path d="M24 24 L24 40" />
      </g>
      <circle cx="24" cy="24" r="2" fill={T.color.mint} />
    </svg>
  );
}
