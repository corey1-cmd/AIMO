/* RecentCompleted.jsx — 좌측 세 번째 카드 (Lenu §4-4)
 * 📋 최근 완료
 * Props: records, max (기본 3), onSelect, onSeeAll */

import { T, formatMin, formatDate, CATEGORIES } from '../constants';

function catIcon(c) {
  return CATEGORIES.find(x => x.key === c)?.icon || '📌';
}

export function RecentCompleted({ records, max = 3, onSelect, onSeeAll }) {
  const sliced = (records || []).slice(0, max);

  return (
    <section style={{
      background: T.color.bgCard,
      borderRadius: T.radius.lg,
      padding: '20px 22px',
      boxShadow: T.shadow.ambient,
      border: `1px solid ${T.color.border}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{
          fontSize: T.font_.size.title,
          fontWeight: T.font_.weight.semibold,
          color: T.color.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span aria-hidden="true">📋</span>
          <span>최근 완료</span>
        </span>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: T.color.textMuted,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 8px',
            }}
          >전체 보기 →</button>
        )}
      </div>

      {sliced.length === 0 ? (
        <div style={{
          fontSize: T.font_.size.caption,
          color: T.color.textMuted,
          padding: '20px 4px',
          textAlign: 'center',
        }}>기록이 쌓이면 여기에 표시돼요</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sliced.map(r => (
            <button
              key={r.id}
              onClick={() => onSelect?.(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: T.radius.md,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.color.mintSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true">
                {catIcon(r.categories?.[0])}
              </span>
              <span style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 0,
                flex: 1,
              }}>
                <span style={{
                  fontSize: T.font_.size.caption,
                  fontWeight: T.font_.weight.semibold,
                  color: T.color.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{r.title}</span>
                <span style={{
                  fontSize: 11,
                  color: T.color.textMuted,
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  {formatDate(r.date)} · {formatMin(r.totalActualMin)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
