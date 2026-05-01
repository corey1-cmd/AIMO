/* RecentCompleted.jsx — 좌측 사이드바 RECENT (Atelier Cyan v6c — image-match)
 * 다크 글래스. 헤더: RECENT / 전체 보기 → (우측 정렬)
 * 각 행: 상태 점 / 제목 + 날짜·시간 / 우측 % 또는 평균
 * Props: items, onSelect, onSeeAll */

import { T } from '../constants';

// 사이드바용 컴팩트 표기: "1h 12m" / "45m" / "3h"
function fmtCompact(min) {
  if (!min || min < 1) return '0m';
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function shortDate(d) {
  // 2026.04.01 형식
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${y}.${m}.${dd}`;
}

function pctOrAvg(r) {
  if (!r.totalEstMin || r.totalEstMin <= 0) return '평균';
  const p = Math.round((r.totalActualMin / r.totalEstMin) * 100);
  return `${p}%`;
}

export function RecentCompleted({ items, onSelect, onSeeAll }) {
  return (
    <section style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 14,
        position: 'relative',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.62)',
          fontFamily: T.font_.familyMono,
        }}>RECENT</span>
        <button
          onClick={onSeeAll}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: T.font_.familyMono,
            padding: '2px 4px',
            letterSpacing: '0.04em',
            transition: 'color 200ms ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = T.color.electricMint; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >전체 보기 <span aria-hidden>›</span></button>
      </div>

      {(!items || items.length === 0) ? (
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.48)',
          padding: '14px 4px',
          textAlign: 'center',
        }}>기록이 쌓이면 여기에 표시돼요</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
          {items.map((r, i) => {
            const filled = i === 0;  // 가장 최근만 채움
            const pct = pctOrAvg(r);
            const isAvg = pct === '평균';
            return (
              <button
                key={r.id}
                onClick={() => onSelect?.(r.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span aria-hidden style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: filled ? T.color.electricMint : 'transparent',
                  border: filled ? 'none' : '1.5px solid rgba(255,255,255,0.32)',
                  boxShadow: filled ? `0 0 6px ${T.color.electricMint}` : 'none',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{
                    fontSize: 12.5,
                    fontWeight: T.font_.weight.semibold,
                    color: T.color.textOnDark,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{r.title}</span>
                  <span style={{
                    fontSize: 10.5,
                    color: 'rgba(255,255,255,0.44)',
                    fontFamily: T.font_.familyMono,
                    letterSpacing: '0.02em',
                  }}>
                    {shortDate(r.date)} · {fmtCompact(r.totalActualMin)}
                  </span>
                </div>
                <span style={{
                  fontSize: 11,
                  color: isAvg ? 'rgba(255,255,255,0.55)' : T.color.electricMint,
                  fontFamily: T.font_.familyMono,
                  fontWeight: T.font_.weight.semibold,
                  flexShrink: 0,
                }}>{pct}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

const cardDark = () => ({
  background: T.glass.dark,
  backdropFilter: T.glass.blur,
  WebkitBackdropFilter: T.glass.blur,
  borderRadius: 24,
  padding: '22px 24px',
  boxShadow: T.shadow.glassDark,
  border: `1px solid ${T.glass.darkBorder}`,
  position: 'relative',
  overflow: 'hidden',
});
