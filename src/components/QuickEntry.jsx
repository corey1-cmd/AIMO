/* QuickEntry.jsx — 좌측 네 번째 카드 (Lenu §4-5)
 * 빠른 진입: Make a structure / Focus Mode / Tasks Record
 * Props: onNavigate (path => void) */

import { T } from '../constants';

const MODES = [
  { key: 'distill', icon: '🧩', title: 'Make a structure', desc: '할 일을 분해', to: '/distill' },
  { key: 'focus',   icon: '🎯', title: 'Focus Mode',       desc: '하나에 집중',  to: '/focus' },
  { key: 'record',  icon: '📋', title: 'Tasks Record',     desc: '기록 보기',    to: '/record' },
];

export function QuickEntry({ onNavigate }) {
  return (
    <section style={{
      background: T.color.bgCard,
      borderRadius: T.radius.lg,
      padding: '20px 22px',
      boxShadow: T.shadow.ambient,
      border: `1px solid ${T.color.border}`,
    }}>
      <div style={{
        fontSize: T.font_.size.title,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        marginBottom: 14,
      }}>빠른 진입</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => onNavigate?.(m.to)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: T.color.mintSoft,
              border: `1px solid ${T.color.border}`,
              borderRadius: T.radius.md,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = T.shadow.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: T.color.bgCard,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }} aria-hidden="true">{m.icon}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontSize: T.font_.size.caption,
                fontWeight: T.font_.weight.semibold,
                color: T.color.textPrimary,
              }}>{m.title}</span>
              <span style={{ fontSize: 11, color: T.color.textMuted }}>{m.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
