/* FocusDashboard.jsx — /focus 라우트 분석 대시보드 (Atelier Cyan v6c — image-match)
 *
 * 이미지 2 그대로의 레이아웃:
 *   ┌─ 작업 속도 추이 (wide) ──────┬─ 집중 상태 요약 ─┐
 *   ├─ 활동 분포 ─┬─ 평균 작업 수행 ─┤
 *   │              │                 ├─ 고정 시간까지 남은 시간 (spans) ─┤
 *   ├─ 주요 활동 섹터 (wide, 진행 바) ┤
 *   ├─ 평균 세션 시간 ┬─ 평균 대비 속도 ┤
 *
 * 모든 차트는 외부 라이브러리 없이 순수 SVG로 구성.
 * Props: 없음 (현재는 mock 데이터 — 실제 연결은 추후)
 */

import { useState } from 'react';
import { T } from '../constants';

/* ─── 데이터 (이미지의 정확한 수치 그대로) ─────────────────────── */

const SPEED_TREND_DAILY = [
  { d: '03.20', est: 2.9, act: 2.4 },
  { d: '03.21', est: 2.0, act: 1.4 },
  { d: '03.22', est: 1.7, act: 1.2 },
  { d: '03.23', est: 2.6, act: 2.0 },
  { d: '03.24', est: 2.75, act: 1.97 },
  { d: '03.25', est: 1.9, act: 1.7 },
  { d: '03.26', est: 2.6, act: 2.3 },
];

const ACTIVITY_DIST = [
  { label: '문서 작성',  pct: 35, time: '10h 45m' },
  { label: '코딩',       pct: 30, time: '9h 12m' },
  { label: '리서치',     pct: 15, time: '4h 38m' },
  { label: '기획',       pct: 10, time: '3h 04m' },
  { label: '커뮤니케이션', pct: 10, time: '3h 02m' },
];

const DAILY_PERF = [
  { d: '03.20', h: 1.1 },
  { d: '03.21', h: 1.5 },
  { d: '03.22', h: 1.8 },
  { d: '03.23', h: 1.0 },
  { d: '03.24', h: 1.6 },
  { d: '03.25', h: 1.7 },
  { d: '03.26', h: 1.5 },
];
const DAILY_AVG = 1.47; // ≈ 1h 28m

const FIXED_DEADLINES = [
  { label: '팀 미팅',       at: '오늘 14:00',  remaining: '01:12:45', progress: 0.78 },
  { label: '클라이언트 발표', at: '오늘 16:30',  remaining: '03:42:45', progress: 0.55 },
  { label: '일일 리포트 마감', at: '내일 09:00',  remaining: '20:12:45', progress: 0.18 },
];


/* ─── 메인 export ───────────────────────────────────────────── */

export function FocusDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Header />

      {/* 메인 그리드: 3-column. 우측 1열은 사이드 카드 2개. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 360px)',
        gap: 16,
        gridAutoRows: 'min-content',
      }} className="focus-grid">
        {/* Row 1: 작업 속도 추이 (col 1-2) */}
        <div style={{ gridColumn: '1 / 3' }}>
          <SpeedTrendCard />
        </div>

        {/* Row 1: 집중 상태 요약 (col 3) */}
        <div style={{ gridColumn: '3 / 4' }}>
          <ConcentrationCard />
        </div>

        {/* Row 2: 활동 분포 (col 1) */}
        <div style={{ gridColumn: '1 / 2' }}>
          <ActivityDistCard />
        </div>

        {/* Row 2: 평균 작업 수행 시간 (col 2) */}
        <div style={{ gridColumn: '2 / 3' }}>
          <DailyPerfCard />
        </div>

        {/* Row 2-3: 고정 시간까지 남은 시간 (col 3, spans 2) */}
        <div style={{ gridColumn: '3 / 4', gridRow: 'span 2' }}>
          <DeadlinesCard />
        </div>

        {/* Row 3: 주요 활동 섹터 (col 1) */}
        <div style={{ gridColumn: '1 / 2' }}>
          <SectorCard />
        </div>

        {/* Row 3: 평균 세션 시간 + 평균 대비 속도 (col 2, 두 개 인라인) */}
        <div style={{ gridColumn: '2 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SimpleStatCard title="평균 세션 시간" value="1h 28m" caption="지난 7일 기준" />
          <SimpleStatCard title="평균 대비 속도" value="112%" caption="지난 7일 기준" accent />
        </div>
      </div>

      <style>{`
        @media (max-width: 1180px) {
          .focus-grid { grid-template-columns: 1fr 1fr !important; }
          .focus-grid > div[style*="grid-column: 3 / 4"],
          .focus-grid > div[style*="gridColumn: '3 / 4'"] { grid-column: 1 / 3 !important; grid-row: auto !important; }
        }
        @media (max-width: 760px) {
          .focus-grid { grid-template-columns: 1fr !important; }
          .focus-grid > div { grid-column: 1 !important; }
        }
      `}</style>
    </div>
  );
}

function Header() {
  return (
    <header style={{ marginBottom: 6 }}>
      <h1 style={{
        margin: 0,
        marginBottom: 6,
        fontFamily: T.font_.familyDisplay,
        fontSize: 36,
        fontWeight: T.font_.weight.semibold,
        letterSpacing: T.font_.tracking.tightest,
        color: T.color.textPrimary,
      }}>Focus</h1>
      <p style={{
        margin: 0,
        fontSize: 13.5,
        color: T.color.textSecondary,
        lineHeight: 1.6,
      }}>작업 속도와 효율을 분석하여, 더 빠르고 스마트하게 일할 수 있도록 도와드립니다.</p>
    </header>
  );
}


/* ─── card helpers ──────────────────────────────────────────── */

function CardLight({ children, style }) {
  return (
    <section style={{
      background: 'rgba(255, 255, 255, 0.55)',
      borderRadius: 18,
      padding: '20px 22px',
      boxShadow: '0 2px 8px rgba(0, 32, 18, 0.04)',
      border: `1px solid rgba(0, 82, 45, 0.06)`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>{children}</section>
  );
}

function CardTitle({ children, right }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      gap: 8,
    }}>
      <span style={{
        fontSize: 14,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        letterSpacing: T.font_.tracking.tight,
      }}>{children}</span>
      {right}
    </div>
  );
}


/* ─── 작업 속도 추이 (line chart) ─────────────────────────── */

function SpeedTrendCard() {
  const [period, setPeriod] = useState('일간');
  // 호버 인덱스 — 4번째(index 4) = 03.24 (이미지의 활성 점)
  const [hoverIdx, setHoverIdx] = useState(4);

  const data = SPEED_TREND_DAILY;
  const W = 720;
  const H = 220;
  const padL = 32, padR = 16, padT = 24, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = 4; // 0~4h
  const x = (i) => padL + (i / (data.length - 1)) * innerW;
  const y = (v) => padT + (1 - v / max) * innerH;

  // smooth path via Catmull-Rom -> bezier
  const smoothPath = (key) => {
    const pts = data.map((d, i) => [x(i), y(d[key])]);
    if (pts.length < 2) return '';
    let p = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      p += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return p;
  };
  const actPath = smoothPath('act');
  const estPath = smoothPath('est');
  const fillPath = `${actPath} L${x(data.length - 1)} ${padT + innerH} L${x(0)} ${padT + innerH} Z`;

  const hover = data[hoverIdx];
  const speed = hover ? Math.round((hover.est / hover.act) * 100) : 0; // 예상 ÷ 실제 (빠를수록 높음)

  return (
    <CardLight>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 14,
          fontWeight: T.font_.weight.semibold,
          color: T.color.textPrimary,
        }}>작업 속도 추이</span>
        <Tabs value={period} onChange={setPeriod} options={['일간', '주간', '월간']} />
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 4, fontSize: 11, color: T.color.textMuted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 0, borderTop: `1.5px dashed ${T.color.textMuted}`, display: 'inline-block' }} />
          예상 시간
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 2, background: T.color.primary, display: 'inline-block', borderRadius: 1 }} />
          실제 동작 시간
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="trendFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={T.color.primary} stopOpacity="0.16" />
              <stop offset="100%" stopColor={T.color.primary} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* y축 라벨 */}
          {[0, 2, 4].map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(24,29,25,0.06)" strokeDasharray="3 4" />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end" fill={T.color.textMuted} fontSize="10" fontFamily={T.font_.familyMono}>{v}h</text>
            </g>
          ))}

          {/* 영역 fill */}
          <path d={fillPath} fill="url(#trendFill)" />
          {/* 예상 (점선) */}
          <path d={estPath} fill="none" stroke={T.color.textMuted} strokeWidth="1.4" strokeDasharray="5 4" strokeLinecap="round" />
          {/* 실제 (실선 deep forest) */}
          <path d={actPath} fill="none" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" />

          {/* 데이터 점 */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(d.act)}
              r={i === hoverIdx ? 5 : 3}
              fill={i === hoverIdx ? 'white' : T.color.primary}
              stroke={i === hoverIdx ? T.color.primary : 'transparent'}
              strokeWidth={i === hoverIdx ? 2 : 0}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverIdx(i)}
            />
          ))}

          {/* 호버 vertical guide */}
          {hoverIdx >= 0 && (
            <line
              x1={x(hoverIdx)} x2={x(hoverIdx)}
              y1={padT} y2={padT + innerH}
              stroke="rgba(24,29,25,0.08)"
              strokeDasharray="3 3"
            />
          )}

          {/* x축 라벨 */}
          {data.map((d, i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fill={T.color.textMuted}
              fontSize="10"
              fontFamily={T.font_.familyMono}
            >{d.d}</text>
          ))}

          {/* 호버 툴팁 */}
          {hover && (
            <g transform={`translate(${Math.min(x(hoverIdx) + 14, W - 138)}, ${y(hover.act) - 70})`}>
              <rect x="0" y="0" width="124" height="68" rx="8" fill="white" stroke="rgba(24,29,25,0.10)" strokeWidth="1" filter="url(#tipShadow)" />
              <text x="10" y="16" fill={T.color.textPrimary} fontSize="11" fontWeight="600">{hover.d} (화)</text>
              <text x="10" y="32" fill={T.color.textMuted} fontSize="10">예상 시간</text>
              <text x="114" y="32" textAnchor="end" fill={T.color.textPrimary} fontSize="10" fontFamily={T.font_.familyMono}>{toHm(hover.est)}</text>
              <text x="10" y="46" fill={T.color.textMuted} fontSize="10">실제 시간</text>
              <text x="114" y="46" textAnchor="end" fill={T.color.textPrimary} fontSize="10" fontFamily={T.font_.familyMono}>{toHm(hover.act)}</text>
              <text x="10" y="60" fill={T.color.primary} fontSize="10">속도</text>
              <text x="114" y="60" textAnchor="end" fill={T.color.primary} fontSize="10" fontFamily={T.font_.familyMono} fontWeight="600">{speed}%</text>
            </g>
          )}

          <defs>
            <filter id="tipShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.12)" />
            </filter>
          </defs>
        </svg>
      </div>
    </CardLight>
  );
}

function toHm(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function Tabs({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex',
      gap: 2,
      padding: 3,
      background: 'rgba(232, 244, 237, 0.55)',
      border: `1px solid ${T.glass.lightBorder}`,
      borderRadius: T.radius.pill,
    }}>
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: T.font_.weight.medium,
            fontFamily: 'inherit',
            color: o === value ? T.color.primary : T.color.textMuted,
            background: o === value ? 'white' : 'transparent',
            border: 'none',
            borderRadius: T.radius.pill,
            cursor: 'pointer',
            transition: 'background 200ms ease, color 200ms ease',
            boxShadow: o === value ? '0 1px 3px rgba(0, 82, 45, 0.10)' : 'none',
          }}
        >{o}</button>
      ))}
    </div>
  );
}


/* ─── 집중 상태 요약 (donut) ──────────────────────────────── */

function ConcentrationCard() {
  const pct = 72;
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <CardLight>
      <CardTitle>집중 상태 요약</CardTitle>
      <div style={{
        fontSize: 11,
        color: T.color.textMuted,
        marginBottom: 14,
        marginTop: -8,
      }}>남은 할일 기준</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs>
              <linearGradient id="donut1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T.color.primary} />
                <stop offset="100%" stopColor={T.color.electricMint} />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(24,29,25,0.06)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={r}
              fill="none"
              stroke="url(#donut1)"
              strokeWidth="10"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={c / 4}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: T.font_.weight.semibold,
              color: T.color.textPrimary,
              fontFamily: T.font_.familyDisplay,
              letterSpacing: T.font_.tracking.tightest,
              lineHeight: 1,
            }}>{pct}%</span>
            <span style={{ fontSize: 10, color: T.color.textMuted }}>완료</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Stat label="완료한 일"   value="22h 13m" />
          <Stat label="남은 할일"   value="8h 32m" />
          <Stat label="전체 (예상)" value="30h 45m" />
        </div>
      </div>

      <div style={{
        marginTop: 16,
        paddingTop: 14,
        borderTop: `1px solid ${T.glass.lightBorder}`,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11.5,
      }}>
        <span style={{ color: T.color.textMuted }}>완료율 (작업 기준)</span>
        <span style={{
          color: T.color.primary,
          fontWeight: T.font_.weight.semibold,
          fontFamily: T.font_.familyMono,
        }}>{pct}%</span>
      </div>
    </CardLight>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 11, color: T.color.textMuted }}>{label}</span>
      <span style={{
        fontSize: 13,
        color: T.color.textPrimary,
        fontWeight: T.font_.weight.semibold,
        fontFamily: T.font_.familyMono,
      }}>{value}</span>
    </div>
  );
}


/* ─── 활동 분포 (horizontal bars) ─────────────────────────── */

function ActivityDistCard() {
  return (
    <CardLight>
      <CardTitle>활동 분포</CardTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ACTIVITY_DIST.map(a => (
          <div key={a.label} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px 60px', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: T.color.textPrimary, whiteSpace: 'nowrap' }}>{a.label}</span>
            <div style={{ height: 6, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                width: `${a.pct * 2}%`, // 35% 이하 데이터를 100%로 매핑하기 위해 ×2 — 시각적 비례 유지
                maxWidth: '100%',
                height: '100%',
                background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
                borderRadius: 9999,
              }} />
            </div>
            <span style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono, textAlign: 'right' }}>{a.pct}%</span>
            <span style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono, textAlign: 'right' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </CardLight>
  );
}


/* ─── 평균 작업 수행 시간 (vertical bars w/ avg line) ─────── */

function DailyPerfCard() {
  const max = 2;
  const W = 320, H = 160, padL = 16, padR = 16, padT = 22, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const bw = innerW / DAILY_PERF.length - 8;
  const x = (i) => padL + i * (innerW / DAILY_PERF.length) + 4;
  const y = (v) => padT + (1 - v / max) * innerH;

  return (
    <CardLight>
      <CardTitle>평균 작업 수행 시간 (일별)</CardTitle>

      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={T.color.electricMint} stopOpacity="0.85" />
              <stop offset="100%" stopColor={T.color.primary} stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* y축 라벨 (0, 1h, 2h) */}
          {[0, 1, 2].map(v => (
            <g key={v}>
              <text x={padL} y={y(v) + 4} fill={T.color.textMuted} fontSize="9" fontFamily={T.font_.familyMono}>{v === 0 ? '0' : `${v}h`}</text>
            </g>
          ))}

          {/* 평균 가이드 라인 */}
          <line x1={padL + 18} x2={W - padR} y1={y(DAILY_AVG)} y2={y(DAILY_AVG)} stroke={T.color.primary} strokeOpacity="0.32" strokeDasharray="4 4" />
          <text x={W - padR} y={y(DAILY_AVG) - 4} textAnchor="end" fill={T.color.primary} fontSize="9" fontFamily={T.font_.familyMono}>평균 1h 28m</text>

          {/* 막대 */}
          {DAILY_PERF.map((d, i) => {
            const bh = innerH * (d.h / max);
            const bx = x(i) + 14;
            const by = y(d.h);
            return (
              <g key={i}>
                <rect x={bx} y={by} width={bw - 4} height={bh} rx="3" fill="url(#barGrad)" opacity="0.92" />
                <text x={bx + (bw - 4) / 2} y={H - 6} textAnchor="middle" fill={T.color.textMuted} fontSize="9" fontFamily={T.font_.familyMono}>{d.d}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </CardLight>
  );
}


/* ─── 고정 시간까지 남은 시간 (countdown list) ─────────────── */

function DeadlinesCard() {
  return (
    <CardLight style={{ height: '100%' }}>
      <CardTitle>고정 시간까지 남은 시간</CardTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {FIXED_DEADLINES.map(d => (
          <div key={d.label} style={{
            padding: '14px 14px',
            background: 'rgba(232, 244, 237, 0.40)',
            border: `1px solid ${T.glass.lightBorder}`,
            borderRadius: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span aria-hidden style={{
                width: 28, height: 28,
                borderRadius: 8,
                background: 'rgba(0, 82, 45, 0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.color.primary,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7 V12 L15 14" />
                </svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: T.font_.weight.semibold, color: T.color.textPrimary }}>{d.label}</div>
                <div style={{ fontSize: 10.5, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>{d.at}</div>
              </div>
              <span style={{
                fontSize: 16,
                color: T.color.primary,
                fontFamily: T.font_.familyMono,
                fontWeight: T.font_.weight.semibold,
                letterSpacing: '0.02em',
              }}>{d.remaining}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                width: `${d.progress * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
                borderRadius: 9999,
              }} />
            </div>
          </div>
        ))}

        <button style={{
          padding: '12px 14px',
          background: 'transparent',
          border: `1.5px dashed ${T.color.borderDashed}`,
          borderRadius: 12,
          color: T.color.textMuted,
          fontSize: 12,
          fontFamily: 'inherit',
          fontWeight: T.font_.weight.medium,
          cursor: 'pointer',
          transition: 'border-color 200ms ease, color 200ms ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.color.primary; e.currentTarget.style.color = T.color.primary; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.color.borderDashed; e.currentTarget.style.color = T.color.textMuted; }}
        >+ 고정 시간 추가</button>
      </div>
    </CardLight>
  );
}


/* ─── 주요 활동 섹터 ─────────────────────────────────────── */

function SectorCard() {
  return (
    <CardLight>
      <CardTitle>주요 활동 섹터</CardTitle>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          fontSize: 18,
          fontWeight: T.font_.weight.semibold,
          color: T.color.textPrimary,
          letterSpacing: T.font_.tracking.tight,
        }}>코딩</span>
        <span style={{
          fontSize: 13,
          color: T.color.textMuted,
          fontFamily: T.font_.familyMono,
        }}>40% (12h 18m)</span>
      </div>
      <div style={{ height: 6, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{
          width: '40%',
          height: '100%',
          background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
          borderRadius: 9999,
        }} />
      </div>
    </CardLight>
  );
}


/* ─── 단순 스탯 카드 ─────────────────────────────────────── */

function SimpleStatCard({ title, value, caption, accent }) {
  return (
    <CardLight>
      <CardTitle>{title}</CardTitle>
      <div style={{
        fontSize: 28,
        fontWeight: T.font_.weight.semibold,
        color: accent ? T.color.primary : T.color.textPrimary,
        fontFamily: T.font_.familyDisplay,
        letterSpacing: T.font_.tracking.tightest,
        lineHeight: 1,
        marginBottom: 6,
        whiteSpace: 'nowrap',
      }}>{value}</div>
      <div style={{
        fontSize: 11,
        color: T.color.textMuted,
        fontFamily: T.font_.familyMono,
      }}>{caption}</div>
    </CardLight>
  );
}
