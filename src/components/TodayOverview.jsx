/* TodayOverview.jsx — 좌측 사이드바 OVERVIEW (Atelier Cyan v6c — image-match)
 * 다크 글래스. 헤더는 작은 "OVERVIEW" 라벨, 본문은 3개 스탯 가로 배치.
 *   5  / 92%  / 7h 47m
 *   총 기록 / 평균 속도 / 이번 주 기록 */

import { T2, T } from '../constants';

function fmtWeek(min) {
  if (!min || min <= 0) return '0m';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function TodayOverview({ stats }) {
  return (
    <section style={{ position: 'relative' }}>
      <div style={labelStyle()}>OVERVIEW</div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, position: 'relative' }}>
        <Stat value={stats.count} suffix="" label="총 기록" />
        <Divider />
        <Stat value={stats.count ? `${stats.avgSpeed}` : '—'} suffix={stats.count ? '%' : ''} label="평균 속도" />
        <Divider />
        <Stat value={fmtWeek(stats.weekMin).replace(/(\d+)([hm])/g, '$1·$2').replace(/·h/g, 'h').replace(/·m/g, 'm')} suffix="" label="이번 주 기록" raw />
      </div>
    </section>
  );
}

function Stat({ value, suffix, label, raw }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: 1,
      minWidth: 0,
      paddingRight: 4,
    }}>
      <span style={{
        fontSize: 30,
        lineHeight: 1,
        fontWeight: T2.font.weightSemibold,
        color: '#FFFFFF',
        fontFamily: T2.font.familyDisplay,
        letterSpacing: T2.font.tracking.tightest,
        whiteSpace: 'nowrap',
      }}>
        {raw ? renderDuration(value) : value}
        {suffix && (
          <span style={{
            fontSize: 17,
            fontWeight: T2.font.weightMedium,
            color: '#FFFFFF',
            marginLeft: 1,
          }}>{suffix}</span>
        )}
      </span>
      <span style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.62)',
        letterSpacing: '0.02em',
      }}>{label}</span>
    </div>
  );
}

// "7h 47m" 형식: 숫자는 큰 폰트, 단위(h/m)는 작은 폰트
function renderDuration(s) {
  if (!s || typeof s !== 'string') return s;
  const parts = [];
  const re = /(\d+)([hm])/g;
  let m;
  let lastIndex = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > lastIndex) parts.push({ t: 'gap', v: s.slice(lastIndex, m.index) });
    parts.push({ t: 'num', v: m[1] });
    parts.push({ t: 'unit', v: m[2] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < s.length) parts.push({ t: 'gap', v: s.slice(lastIndex) });
  return parts.map((p, i) => {
    if (p.t === 'unit') return (
      <span key={i} style={{ fontSize: 16, fontWeight: T2.font.weightMedium, marginLeft: 1, marginRight: 4 }}>{p.v}</span>
    );
    if (p.t === 'gap') return <span key={i}>{' '}</span>;
    return <span key={i}>{p.v}</span>;
  });
}

function Divider() {
  return (
    <span aria-hidden style={{
      width: 1,
      height: 28,
      background: 'rgba(255,255,255,0.08)',
      margin: '0 6px 12px',
      flexShrink: 0,
    }} />
  );
}

const cardDark = () => ({
  background: 'rgba(28, 26, 24, 0.92)',
  backdropFilter: '20px',
  WebkitBackdropFilter: '20px',
  borderRadius: 24,
  padding: '22px 24px',
  color: '#FFFFFF',
  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.20)',
  border: `1px solid ${'rgba(255,255,255,0.06)'}`,
  position: 'relative',
  overflow: 'hidden',
});

const labelStyle = () => ({
  fontSize: 10,
  fontWeight: T2.font.weightSemibold,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.50)',
  marginBottom: 16,
  position: 'relative',
  fontFamily: T2.font.familyMono,
});

const ambientOrb = (pos) => ({
  position: 'absolute',
  width: 200, height: 200,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(79, 224, 168, 0.16) 0%, transparent 65%)',
  pointerEvents: 'none',
  filter: 'blur(2px)',
  ...pos,
});

const topSheen = () => ({
  position: 'absolute',
  left: 0, right: 0, top: 0,
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
});
