/* Top3.jsx — 좌측 사이드바 TOP 3 (Atelier Cyan v6c — image-match)
 * 다크 글래스. 헤더: TOP 3 / 실제 시간 기준 (우측 정렬)
 * 각 행: 번호 / 제목 + 진행 바 / 우측 % / 두번째 줄에 예상·실제 메타
 * Props: items, onSelect */

import { T } from '../constants';

// 사이드바용 컴팩트 표기: "1h 12m" / "45m" / "3h"
function fmtCompact(min) {
  if (!min || min < 1) return '0m';
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function Top3({ items, onSelect }) {
  return (
    <section style={{ position: 'relative' }}>
      <Header />
      {(!items || items.length === 0) ? (
        <Empty />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((r, i) => {
            // 화면 표시용 비율: 빠를수록 짧은 바 (예상 대비 실제). 최대 60%까지 표시.
            const ratio = r.totalEstMin > 0 ? Math.min(60, Math.round((r.totalActualMin / r.totalEstMin) * 100)) : 0;
            const displayPct = r.totalEstMin > 0 ? Math.round((r.totalActualMin / r.totalEstMin) * 100) : 0;
            return (
              <button
                key={r.id}
                onClick={() => onSelect?.(r.id)}
                style={rowButton()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={rankNum()}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={titleStyle()}>{r.title}</span>
                    <span style={pctStyle()}>{displayPct}%</span>
                  </div>
                  <div style={barTrack()}>
                    <div style={{
                      width: `${ratio}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, rgba(79, 224, 168, 0.25), ${T.color.electricMint})`,
                      borderRadius: 9999,
                      boxShadow: '0 0 6px rgba(79,224,168,0.32)',
                    }} />
                  </div>
                  <span style={metaStyle()}>
                    예상 {fmtCompact(r.totalEstMin)} · 실제 {fmtCompact(r.totalActualMin)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Header() {
  return (
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
      }}>TOP 3</span>
      <span style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.42)',
        fontFamily: T.font_.familyMono,
        letterSpacing: '0.04em',
      }}>실제 시간 기준</span>
    </div>
  );
}

function Empty() {
  return (
    <div style={{
      fontSize: 12,
      color: 'rgba(255,255,255,0.48)',
      padding: '14px 4px',
      textAlign: 'center',
    }}>아직 기록이 없어요</div>
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

const rowButton = () => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '4px 4px',
  borderRadius: 10,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
  width: '100%',
  transition: 'background 200ms ease',
});

const rankNum = () => ({
  width: 22,
  fontSize: 22,
  fontWeight: T.font_.weight.semibold,
  color: 'rgba(255,255,255,0.62)',
  fontFamily: T.font_.familyDisplay,
  flexShrink: 0,
  marginTop: -3,
  letterSpacing: T.font_.tracking.tightest,
});

const titleStyle = () => ({
  fontSize: 13,
  fontWeight: T.font_.weight.semibold,
  color: T.color.textOnDark,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const pctStyle = () => ({
  fontSize: 11,
  color: T.color.electricMint,
  fontFamily: T.font_.familyMono,
  fontWeight: T.font_.weight.semibold,
  flexShrink: 0,
});

const barTrack = () => ({
  height: 4,
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 9999,
  overflow: 'hidden',
});

const metaStyle = () => ({
  fontSize: 10.5,
  color: 'rgba(255,255,255,0.44)',
  fontFamily: T.font_.familyMono,
  letterSpacing: '0.02em',
});
