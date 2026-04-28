/* FocusDashboard.jsx — /focus 라우트 분석 대시보드 (Atelier Cyan v6e — data-driven)
 *
 * 가이드 기반 계산식:
 *   1. 작업 속도 추이: Efficiency = (Expected / Actual) × 100  ← Expected가 길수록 효율 ↑
 *   2. 집중 상태 요약: Completion Rate = Completed Time / Total Expected × 100
 *   3. 활동 분포: Specific Category Time / Total Actual Time × 100
 *   4. 평균 작업 수행 시간: Σ(Actual per day) / Total Days
 *   5. 고정 시간 카운트다운: Target Time - Current Time
 *   6. 평균 세션 시간: Total Time / Number of Sessions
 *      평균 대비 속도: Current 7d Avg / Past 7d Avg × 100
 *
 * Props: records (Record[]) — 빈 배열일 때는 모든 카드 빈 상태 안내
 */

import { useState, useMemo, useEffect } from 'react';
import { T, CATEGORIES } from '../constants';

/* useFocusStats — records로부터 모든 차트용 데이터 한 번에 계산 */
function useFocusStats(records) {
  return useMemo(() => {
    if (!records || records.length === 0) {
      return {
        empty: true,
        trend: [],
        completionRate: 0,
        completedMin: 0,
        remainingMin: 0,
        totalExpectedMin: 0,
        activityDist: [],
        topSector: null,
        dailyPerf: [],
        dailyAvgMin: 0,
        avgSessionMin: 0,
        speedChangePct: null,
        recordCount: 0,
      };
    }

    const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    // 1. 일별 그룹 → 작업 속도 추이
    const byDay = new Map();
    for (const r of sorted) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const acc = byDay.get(key) || { dateKey: key, date: d, est: 0, act: 0 };
      acc.est += r.totalEstMin || 0;
      acc.act += r.totalActualMin || 0;
      byDay.set(key, acc);
    }
    const dayList = [...byDay.values()].sort((a, b) => a.date - b.date);
    const trend = dayList.slice(-7).map(d => ({
      d: `${String(d.date.getMonth() + 1).padStart(2, '0')}.${String(d.date.getDate()).padStart(2, '0')}`,
      dateKey: d.dateKey,
      est: d.est / 60,
      act: d.act / 60,
      estMin: d.est,
      actMin: d.act,
      efficiency: d.act > 0 ? Math.round((d.est / d.act) * 100) : 100,
    }));

    // 2. 집중 상태 요약
    let completedMin = 0, totalExpectedMin = 0;
    for (const r of records) {
      completedMin += r.totalActualMin || 0;
      totalExpectedMin += r.totalEstMin || 0;
    }
    const remainingMin = Math.max(0, totalExpectedMin - completedMin);
    const completionRate = totalExpectedMin > 0
      ? Math.min(100, Math.round((completedMin / totalExpectedMin) * 100))
      : 0;

    // 3. 활동 분포
    const catMin = new Map();
    let totalActualForDist = 0;
    for (const r of records) {
      if (Array.isArray(r.breakdown)) {
        for (const b of r.breakdown) {
          if (!b || b.isMarker) continue;
          const cat = b.cat || 'other';
          const m = b.actMin || 0;
          catMin.set(cat, (catMin.get(cat) || 0) + m);
          totalActualForDist += m;
        }
      } else {
        const cat = (r.categories && r.categories[0]) || 'other';
        catMin.set(cat, (catMin.get(cat) || 0) + (r.totalActualMin || 0));
        totalActualForDist += (r.totalActualMin || 0);
      }
    }
    const activityDist = [...catMin.entries()]
      .map(([cat, mins]) => ({
        key: cat,
        label: CATEGORIES.find(c => c.key === cat)?.label || cat,
        color: CATEGORIES.find(c => c.key === cat)?.color || T.color.textMuted,
        mins,
        pct: totalActualForDist > 0 ? Math.round((mins / totalActualForDist) * 100) : 0,
      }))
      .sort((a, b) => b.mins - a.mins);
    const topSector = activityDist[0] || null;

    // 4. 평균 작업 수행 시간
    const dailyPerf = trend.map(d => ({ d: d.d, h: d.act, min: d.actMin }));
    const dailySum = dailyPerf.reduce((s, d) => s + d.min, 0);
    const dailyAvgMin = dailyPerf.length > 0 ? dailySum / dailyPerf.length : 0;

    // 6. 평균 세션 시간
    const totalActMin = records.reduce((s, r) => s + (r.totalActualMin || 0), 0);
    const avgSessionMin = records.length > 0 ? totalActMin / records.length : 0;

    // 6. 평균 대비 속도 — 최근 7일 vs 그 이전 7일 efficiency
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const recent7 = records.filter(r => (now - new Date(r.date).getTime()) <= 7 * day);
    const past7 = records.filter(r => {
      const dt = now - new Date(r.date).getTime();
      return dt > 7 * day && dt <= 14 * day;
    });
    const avgEffRecent = computeAvgEfficiency(recent7);
    const avgEffPast = computeAvgEfficiency(past7);
    const speedChangePct = (avgEffRecent != null && avgEffPast != null && avgEffPast > 0)
      ? Math.round((avgEffRecent / avgEffPast) * 100)
      : null;

    return {
      empty: false,
      trend,
      completionRate,
      completedMin,
      remainingMin,
      totalExpectedMin,
      activityDist,
      topSector,
      dailyPerf,
      dailyAvgMin,
      avgSessionMin,
      speedChangePct,
      recordCount: records.length,
    };
  }, [records]);
}

function computeAvgEfficiency(recs) {
  if (!recs || recs.length === 0) return null;
  let est = 0, act = 0;
  for (const r of recs) { est += r.totalEstMin || 0; act += r.totalActualMin || 0; }
  if (act <= 0) return null;
  return (est / act) * 100;
}

function fmtHm(min) {
  if (!min || min < 1) return '0m';
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}


/* 메인 export */
export function FocusDashboard({ records = [] }) {
  const stats = useFocusStats(records);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Header />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 360px)',
        gap: 16,
        gridAutoRows: 'min-content',
      }} className="focus-grid">
        <div style={{ gridColumn: '1 / 3' }}>
          <SpeedTrendCard stats={stats} />
        </div>
        <div style={{ gridColumn: '3 / 4' }}>
          <ConcentrationCard stats={stats} />
        </div>
        <div style={{ gridColumn: '1 / 2' }}>
          <ActivityDistCard stats={stats} />
        </div>
        <div style={{ gridColumn: '2 / 3' }}>
          <DailyPerfCard stats={stats} />
        </div>
        <div style={{ gridColumn: '3 / 4', gridRow: 'span 2' }}>
          <DeadlinesCard />
        </div>
        <div style={{ gridColumn: '1 / 2' }}>
          <SectorCard stats={stats} />
        </div>
        <div style={{ gridColumn: '2 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SimpleStatCard
            title="평균 세션 시간"
            value={stats.empty ? '—' : fmtHm(stats.avgSessionMin)}
            caption={stats.empty ? '기록 후 표시' : `총 ${stats.recordCount}개 세션`}
          />
          <SimpleStatCard
            title="평균 대비 속도"
            value={stats.speedChangePct != null ? `${stats.speedChangePct}%` : '—'}
            caption={stats.speedChangePct != null ? '직전 7일 대비' : '비교 데이터 부족'}
            accent
          />
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


/* card helpers */

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

function EmptyHint({ height = 160, message = '기록이 쌓이면 여기에 표시돼요' }) {
  return (
    <div style={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.color.textMuted,
      fontSize: 12,
      letterSpacing: '0.02em',
      textAlign: 'center',
      whiteSpace: 'pre-line',
      padding: '0 12px',
    }}>{message}</div>
  );
}


/* 1. 작업 속도 추이 */
function SpeedTrendCard({ stats }) {
  const [period, setPeriod] = useState('일간');
  const [hoverIdx, setHoverIdx] = useState(-1);

  const data = stats.trend;
  const empty = data.length === 0;
  const effectiveHover = hoverIdx >= 0 ? hoverIdx : (data.length - 1);

  const W = 720, H = 220;
  const padL = 36, padR = 16, padT = 24, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = useMemo(() => {
    if (empty) return 4;
    const m = Math.max(...data.map(d => Math.max(d.est, d.act)));
    return Math.max(1, Math.ceil(m));
  }, [data, empty]);
  const x = (i) => data.length === 1 ? padL + innerW / 2 : padL + (i / (data.length - 1)) * innerW;
  const y = (v) => padT + (1 - v / max) * innerH;

  const smoothPath = (key) => {
    if (data.length < 2) return '';
    const pts = data.map((d, i) => [x(i), y(d[key])]);
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
  const fillPath = data.length >= 2
    ? `${actPath} L${x(data.length - 1)} ${padT + innerH} L${x(0)} ${padT + innerH} Z`
    : '';

  const hover = data[effectiveHover];

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

      {empty ? <EmptyHint height={160} message="작업을 기록하면 일별 속도 추이가 표시됩니다" /> : (
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="trendFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={T.color.primary} stopOpacity="0.16" />
                <stop offset="100%" stopColor={T.color.primary} stopOpacity="0" />
              </linearGradient>
              <filter id="tipShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.12)" />
              </filter>
            </defs>

            {[0, max / 2, max].map(v => (
              <g key={v}>
                <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(24,29,25,0.06)" strokeDasharray="3 4" />
                <text x={padL - 6} y={y(v) + 4} textAnchor="end" fill={T.color.textMuted} fontSize="10" fontFamily={T.font_.familyMono}>{Math.round(v)}h</text>
              </g>
            ))}

            {fillPath && <path d={fillPath} fill="url(#trendFill)" />}
            {estPath && <path d={estPath} fill="none" stroke={T.color.textMuted} strokeWidth="1.4" strokeDasharray="5 4" strokeLinecap="round" />}
            {actPath && <path d={actPath} fill="none" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" />}

            {data.map((d, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(d.act)}
                r={i === effectiveHover ? 5 : 3}
                fill={i === effectiveHover ? 'white' : T.color.primary}
                stroke={i === effectiveHover ? T.color.primary : 'transparent'}
                strokeWidth={i === effectiveHover ? 2 : 0}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(-1)}
              />
            ))}

            {effectiveHover >= 0 && data.length >= 2 && (
              <line
                x1={x(effectiveHover)} x2={x(effectiveHover)}
                y1={padT} y2={padT + innerH}
                stroke="rgba(24,29,25,0.08)"
                strokeDasharray="3 3"
              />
            )}

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

            {hover && (
              <g transform={`translate(${Math.min(x(effectiveHover) + 14, W - 138)}, ${y(hover.act) - 70})`}>
                <rect x="0" y="0" width="124" height="68" rx="8" fill="white" stroke="rgba(24,29,25,0.10)" strokeWidth="1" filter="url(#tipShadow)" />
                <text x="10" y="16" fill={T.color.textPrimary} fontSize="11" fontWeight="600">{hover.d}</text>
                <text x="10" y="32" fill={T.color.textMuted} fontSize="10">예상 시간</text>
                <text x="114" y="32" textAnchor="end" fill={T.color.textPrimary} fontSize="10" fontFamily={T.font_.familyMono}>{fmtHm(hover.estMin)}</text>
                <text x="10" y="46" fill={T.color.textMuted} fontSize="10">실제 시간</text>
                <text x="114" y="46" textAnchor="end" fill={T.color.textPrimary} fontSize="10" fontFamily={T.font_.familyMono}>{fmtHm(hover.actMin)}</text>
                <text x="10" y="60" fill={T.color.primary} fontSize="10">속도</text>
                <text x="114" y="60" textAnchor="end" fill={T.color.primary} fontSize="10" fontFamily={T.font_.familyMono} fontWeight="600">{hover.efficiency}%</text>
              </g>
            )}
          </svg>
        </div>
      )}
    </CardLight>
  );
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


/* 2. 집중 상태 요약 */
function ConcentrationCard({ stats }) {
  const pct = stats.completionRate;
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
      }}>완료한 작업 기준</div>

      {stats.empty ? <EmptyHint height={180} message="기록이 쌓이면 완료율이 표시돼요" /> : (
        <>
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
              <Stat label="완료한 일"   value={fmtHm(stats.completedMin)} />
              <Stat label="남은 할일"   value={fmtHm(stats.remainingMin)} />
              <Stat label="전체 (예상)" value={fmtHm(stats.totalExpectedMin)} />
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
            <span style={{ color: T.color.textMuted }}>완료율 (시간 기준)</span>
            <span style={{
              color: T.color.primary,
              fontWeight: T.font_.weight.semibold,
              fontFamily: T.font_.familyMono,
            }}>{pct}%</span>
          </div>
        </>
      )}
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


/* 3. 활동 분포 */
function ActivityDistCard({ stats }) {
  const list = stats.activityDist || [];
  const maxPct = list.length > 0 ? Math.max(...list.map(a => a.pct)) : 100;
  return (
    <CardLight>
      <CardTitle>활동 분포</CardTitle>
      {stats.empty || list.length === 0 ? (
        <EmptyHint height={120} message="카테고리별 분포는 기록 후 표시돼요" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(a => (
            <div key={a.key} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px 60px', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: T.color.textPrimary, whiteSpace: 'nowrap' }}>{a.label}</span>
              <div style={{ height: 6, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{
                  width: `${(a.pct / Math.max(maxPct, 1)) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
                  borderRadius: 9999,
                }} />
              </div>
              <span style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono, textAlign: 'right' }}>{a.pct}%</span>
              <span style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono, textAlign: 'right' }}>{fmtHm(a.mins)}</span>
            </div>
          ))}
        </div>
      )}
    </CardLight>
  );
}


/* 4. 평균 작업 수행 시간 */
function DailyPerfCard({ stats }) {
  const data = stats.dailyPerf || [];
  const empty = data.length === 0;
  const max = useMemo(() => empty ? 2 : Math.max(0.5, Math.ceil(Math.max(...data.map(d => d.h)))), [data, empty]);
  const W = 320, H = 160, padL = 16, padR = 16, padT = 22, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot = data.length > 0 ? innerW / data.length : innerW;
  const bw = Math.max(8, slot - 8);
  const x = (i) => padL + i * slot + 4;
  const y = (v) => padT + (1 - v / max) * innerH;

  const avgH = stats.dailyAvgMin / 60;

  return (
    <CardLight>
      <CardTitle>평균 작업 수행 시간 (일별)</CardTitle>
      {empty ? (
        <EmptyHint height={120} message="작업을 기록하면 일별 막대로 표시됩니다" />
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={T.color.electricMint} stopOpacity="0.85" />
                <stop offset="100%" stopColor={T.color.primary} stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {[0, max / 2, max].map(v => (
              <text key={v} x={padL} y={y(v) + 4} fill={T.color.textMuted} fontSize="9" fontFamily={T.font_.familyMono}>{v === 0 ? '0' : `${v}h`}</text>
            ))}

            {avgH > 0 && (
              <>
                <line x1={padL + 18} x2={W - padR} y1={y(avgH)} y2={y(avgH)} stroke={T.color.primary} strokeOpacity="0.32" strokeDasharray="4 4" />
                <text x={W - padR} y={y(avgH) - 4} textAnchor="end" fill={T.color.primary} fontSize="9" fontFamily={T.font_.familyMono}>평균 {fmtHm(stats.dailyAvgMin)}</text>
              </>
            )}

            {data.map((d, i) => {
              const bh = innerH * (d.h / Math.max(max, 0.001));
              const bx = x(i) + 14;
              const by = y(d.h);
              return (
                <g key={i}>
                  <rect x={bx} y={by} width={Math.max(4, bw - 4)} height={Math.max(0, bh)} rx="3" fill="url(#barGrad)" opacity="0.92" />
                  <text x={bx + (bw - 4) / 2} y={H - 6} textAnchor="middle" fill={T.color.textMuted} fontSize="9" fontFamily={T.font_.familyMono}>{d.d}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </CardLight>
  );
}


/* 5. 고정 시간 카운트다운 — 외부 일정 데이터 미연결, 빈 상태만 노출 */
function DeadlinesCard() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // TODO: props/context로 사용자 일정 연결
  const deadlines = [];

  return (
    <CardLight style={{ height: '100%' }}>
      <CardTitle>고정 시간까지 남은 시간</CardTitle>
      {deadlines.length === 0 ? (
        <EmptyHint height={220} message={'캘린더 일정이 등록되면\n남은 시간이 실시간 카운트다운됩니다'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {deadlines.map(d => {
            const remainMs = Math.max(0, new Date(d.target).getTime() - now);
            const totalMs = new Date(d.target).getTime() - new Date(d.createdAt).getTime();
            const elapsedMs = totalMs - remainMs;
            const progress = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;
            return (
              <div key={d.id} style={{
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
                  }}>{fmtCountdown(remainMs)}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
                    borderRadius: 9999,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardLight>
  );
}

function fmtCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}


/* 6-A. 주요 활동 섹터 */
function SectorCard({ stats }) {
  const top = stats.topSector;
  return (
    <CardLight>
      <CardTitle>주요 활동 섹터</CardTitle>
      {!top ? (
        <EmptyHint height={70} message="기록이 쌓이면 가장 비중 높은 카테고리가 표시돼요" />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{
              fontSize: 18,
              fontWeight: T.font_.weight.semibold,
              color: T.color.textPrimary,
              letterSpacing: T.font_.tracking.tight,
            }}>{top.label}</span>
            <span style={{
              fontSize: 13,
              color: T.color.textMuted,
              fontFamily: T.font_.familyMono,
            }}>{top.pct}% ({fmtHm(top.mins)})</span>
          </div>
          <div style={{ height: 6, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              width: `${top.pct}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
              borderRadius: 9999,
            }} />
          </div>
        </>
      )}
    </CardLight>
  );
}

/* 6-B. 단순 스탯 카드 */
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
