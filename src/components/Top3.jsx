/* Top3.jsx — 좌측 두 번째 카드 (Lenu §4-3)
 * 🏆 가장 빠르게 완료한 Top 3 — 번호 mint 원 + 제목 + 메타
 * Props: items (records 배열), onSelect (id => void) */

import { T, formatMin } from '../constants';

export function Top3({ items, onSelect }) {
  if (!items || items.length === 0) {
    return (
      <section style={cardStyle()}>
        <Header />
        <Empty text="아직 기록이 없어요" />
      </section>
    );
  }

  return (
    <section style={cardStyle()}>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((r, i) => {
          const ratio = r.totalEstMin > 0 ? Math.round((r.totalActualMin / r.totalEstMin) * 100) : 0;
          return (
            <button
              key={r.id}
              onClick={() => onSelect?.(r.id)}
              style={rowStyle()}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.color.mintSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={rankStyle()}>{i + 1}</span>
              <span style={bodyStyle()}>
                <span style={titleStyle()}>{r.title}</span>
                <span style={metaStyle()}>
                  예상 {formatMin(r.totalEstMin)} → 실제 {formatMin(r.totalActualMin)} ({ratio}%)
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Header() {
  return (
    <div style={{
      fontSize: T.font_.size.title,
      fontWeight: T.font_.weight.semibold,
      color: T.color.textPrimary,
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span aria-hidden="true">🏆</span>
      <span>가장 빠르게 완료한 Top 3</span>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{
      fontSize: T.font_.size.caption,
      color: T.color.textMuted,
      padding: '20px 4px',
      textAlign: 'center',
    }}>{text}</div>
  );
}

const cardStyle = () => ({
  background: T.color.bgCard,
  borderRadius: T.radius.lg,
  padding: '20px 22px',
  boxShadow: T.shadow.ambient,
  border: `1px solid ${T.color.border}`,
});

const rowStyle = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '10px 12px',
  borderRadius: T.radius.md,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
  width: '100%',
  transition: 'background 200ms ease',
});

const rankStyle = () => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: T.color.mint,
  color: T.color.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: T.font_.weight.bold,
  flexShrink: 0,
});

const bodyStyle = () => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  flex: 1,
});

const titleStyle = () => ({
  fontSize: T.font_.size.caption,
  fontWeight: T.font_.weight.semibold,
  color: T.color.textPrimary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const metaStyle = () => ({
  fontSize: 11,
  color: T.color.textMuted,
  fontFamily: 'ui-monospace, monospace',
});
