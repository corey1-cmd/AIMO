/* QuickEntry.jsx — 좌측 사이드바 3-아이콘 빠른 진입 (Atelier Cyan v6c — image-match)
 * 다크 글래스. 가로 3분할: 구조 만들기 / 포커스 모드 / 기록 보기
 * Props: onNavigate */

import { T } from '../constants';

const MODES = [
  { key: 'distill', icon: 'frame',   label: '구조 만들기', to: '/distill' },
  { key: 'focus',   icon: 'target',  label: '포커스 모드', to: '/focus' },
  { key: 'record',  icon: 'check',   label: '기록 보기',   to: '/record' },
];

function Icon({ name }) {
  const stroke = T.color.electricMint;
  const sw = 1.6;
  if (name === 'frame') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8 V5 a1 1 0 0 1 1-1 h3" />
        <path d="M16 4 h3 a1 1 0 0 1 1 1 v3" />
        <path d="M20 16 v3 a1 1 0 0 1-1 1 h-3" />
        <path d="M8 20 h-3 a1 1 0 0 1-1-1 v-3" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    );
  }
  if (name === 'target') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.2" fill={stroke} />
      </svg>
    );
  }
  // check (clipboard)
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4 V3 a1 1 0 0 1 1-1 h4 a1 1 0 0 1 1 1 V4" />
      <path d="M9 12 l2 2 l4-4" />
    </svg>
  );
}

export function QuickEntry({ onNavigate }) {
  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
      position: 'relative',
    }}>
      {MODES.map(m => (
        <button
          key={m.key}
          onClick={() => onNavigate?.(m.to)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px 6px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid rgba(255,255,255,0.06)`,
            borderRadius: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: T.color.textOnDark,
            transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(79, 224, 168, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(79, 224, 168, 0.18)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Icon name={m.icon} />
          <span style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.78)',
            fontWeight: T.font_.weight.medium,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}>{m.label}</span>
        </button>
      ))}
    </section>
  );
}
