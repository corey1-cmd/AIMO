/* AnalysisPage.jsx — 분석 페이지 (사용자 시안 2 기준)
 *
 * 구성:
 *   - 헤더: Analysis h1 + sub
 *   - 행동 범주별 속도 가로 막대 차트
 *   - 세부 활동 비율 도넛 차트
 *   - 예상 vs 실제 시간 추이 line chart (week)
 *   - 우측 통계 카드 (전체 기간 / 평균 속도 등)
 *
 * 외부 차트 라이브러리 미사용. SVG 직접 렌더.
 *
 * Props: records
 */

import { useMemo } from 'react';
import { T, CATEGORIES, formatMin } from '../constants';

export function AnalysisPage({ records }) {
  const stats = useMemo(() => computeStats(records), [records]);

  return (
    <section>
      <Header />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        marginTop: 32,
      }} className="analysis-top-grid">
        <CategorySpeedCard byCategory={stats.byCategory} />
        <ActivityRatioCard ratio={stats.activityRatio} totalCount={stats.count} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 24,
        marginTop: 24,
      }} className="analysis-bottom-grid">
        <TrendCard trend={stats.trend} />
        <SummaryCard
          totalActualMin={stats.totalActualMin}
          totalEstMin={stats.totalEstMin}
          avgSpeed={stats.avgSpeed}
        />
      </div>

      <style>{`
        @media (max-width: 980px) {
          .analysis-top-grid, .analysis-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─── 통계 계산 ───────────────────────────────────────────────── */

function computeStats(records) {
  const empty = {
    count: 0,
    avgSpeed: 100,
    totalActualMin: 0,
    totalEstMin: 0,
    byCategory: [],
    activityRatio: [],
    trend: { points: [], maxY: 4 },
  };
  if (!records || records.length === 0) return empty;

  let totalEst = 0, totalAct = 0;
  for (const r of records) { totalEst += r.totalEstMin; totalAct += r.totalActualMin; }
  const avgSpeed = totalEst > 0 ? Math.round((totalAct / totalEst) * 100) : 100;

  // 행동 범주별 속도 — 카테고리별 (실제/예상) %
  const catMap = {};
  for (const r of records) {
    const cats = r.categories || [];
    for (const c of cats) {
      if (!catMap[c]) catMap[c] = { est: 0, act: 0 };
      catMap[c].est += r.totalEstMin;
      catMap[c].act += r.totalActualMin;
    }
  }
  const byCategory = Object.entries(catMap).map(([key, v]) => {
    const meta = CATEGORIES.find(c => c.key === key);
    return {
      key,
      label: meta?.label || key,
      color: meta?.color || T.color.primary,
      ratio: v.est > 0 ? Math.round((v.act / v.est) * 100) : 100,
    };
  }).sort((a, b) => b.ratio - a.ratio).slice(0, 5);

  // 세부 활동 비율 — 카테고리별 record 수 비율
  const ratioMap = {};
  for (const r of records) {
    const cats = r.categories || ['other'];
    for (const c of cats) {
      ratioMap[c] = (ratioMap[c] || 0) + 1;
    }
  }
  const total = Object.values(ratioMap).reduce((s, v) => s + v, 0) || 1;
  const activityRatio = Object.entries(ratioMap).map(([key, count]) => {
    const meta = CATEGORIES.find(c => c.key === key);
    return {
      key,
      label: meta?.label || key,
      color: meta?.color || T.color.primary,
      pct: Math.round((count / total) * 100),
      count,
    };
  }).sort((a, b) => b.pct - a.pct).slice(0, 8);

  // 예상 vs 실제 시간 추이 — 최근 7일 일별 합계
  const days = 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, est: 0, act: 0 };
  });
  for (const r of records) {
    const rd = new Date(r.date);
    rd.setHours(0, 0, 0, 0);
    const idx = buckets.findIndex(b => b.date.getTime() === rd.getTime());
    if (idx >= 0) {
      buckets[idx].est += r.totalEstMin;
      buckets[idx].act += r.totalActualMin;
    }
  }
  const maxMin = Math.max(...buckets.flatMap(b => [b.est, b.act]), 60);
  const maxY = Math.ceil(maxMin / 60); // hours
  const points = buckets.map(b => ({
    date: b.date,
    est: b.est / 60,
    act: b.act / 60,
  }));

  return {
    count: records.length,
    avgSpeed,
    totalActualMin: totalAct,
    totalEstMin: totalEst,
    byCategory,
    activityRatio,
    trend: { points, maxY: Math.max(maxY, 4) },
  };
}

/* ─── 헤더 ───────────────────────────────────────────────────── */

function Header() {
  return (
    <header style={{ position: 'relative' }}>
      <h1 style={{
        margin: 0,
        fontFamily: T.font_.familyDisplay,
        fontSize: 44,
        fontWeight: T.font_.weight.bold,
        letterSpacing: T.font_.tracking.tight,
        lineHeight: T.font_.leading.tight,
        color: T.color.textPrimary,
      }}>
        Analysis
      </h1>
      <p style={{
        margin: '8px 0 0',
        fontSize: T.font_.size.body,
        color: T.color.textSecondary,
      }}>
        데이터를 분석하여 더 빠르고 효율적으로 일할 수 있도록 도와드립니다.
      </p>

      <svg
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          right: 0, top: 0,
          width: 380, height: 80,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ana-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={T.color.primary} stopOpacity="0" />
            <stop offset="60%" stopColor={T.color.primary} stopOpacity="0.35" />
            <stop offset="100%" stopColor={T.color.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 40 Q 75 10 150 40 T 300 40 T 450 40 T 600 40"
          fill="none"
          stroke="url(#ana-wave)"
          strokeWidth="1.5"
        />
      </svg>
    </header>
  );
}

/* ─── 행동 범주별 속도 (가로 막대) ────────────────────────────── */

function CategorySpeedCard({ byCategory }) {
  return (
    <div style={card()}>
      <div style={cardTitle()}>행동 범주별 속도</div>
      {byCategory.length === 0 ? (
        <Empty text="기록이 쌓이면 보여드릴게요" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          {byCategory.map(c => (
            <BarRow key={c.key} item={c} />
          ))}
        </div>
      )}
      <div style={{
        marginTop: 18,
        fontSize: 11,
        color: T.color.textMuted,
        lineHeight: T.font_.leading.relaxed,
      }}>
        100% = 예상과 동일, 낮을수록 느림
      </div>
    </div>
  );
}

function BarRow({ item }) {
  const fast = item.ratio <= 100;
  const w = Math.min(150, Math.max(20, item.ratio * 0.9));
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: item.color,
          flexShrink: 0,
        }} />
        <span style={{
          width: 60,
          fontSize: 13,
          color: T.color.textPrimary,
          fontWeight: T.font_.weight.medium,
        }}>
          {item.label}
        </span>
        <div style={{
          flex: 1,
          height: 6,
          background: T.color.divider,
          borderRadius: T.radius.pill,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${w}%`,
            height: '100%',
            background: fast ? T.color.primary : T.color.warning,
            transition: 'width 400ms ease',
          }} />
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: T.font_.weight.semibold,
          color: T.color.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 48,
          textAlign: 'right',
        }}>{item.ratio}%</span>
      </div>
    </div>
  );
}

/* ─── 세부 활동 비율 (도넛) ───────────────────────────────────── */

function ActivityRatioCard({ ratio, totalCount }) {
  if (ratio.length === 0) {
    return (
      <div style={card()}>
        <div style={cardTitle()}>세부 활동 비율</div>
        <Empty text="기록이 쌓이면 보여드릴게요" />
      </div>
    );
  }

  const total = ratio.reduce((s, r) => s + r.pct, 0) || 100;

  return (
    <div style={card()}>
      <div style={cardTitle()}>세부 활동 비율</div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginTop: 24,
      }}>
        <Donut data={ratio} total={total} totalCount={totalCount} />
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 16px',
          fontSize: 12,
        }}>
          {ratio.map(r => (
            <div key={r.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: r.color, flexShrink: 0,
                }} />
                <span style={{ color: T.color.textSecondary }}>{r.label}</span>
              </span>
              <span style={{
                fontWeight: T.font_.weight.semibold,
                color: T.color.textPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}>{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Donut({ data, total, totalCount }) {
  const size = 140;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  let offset = 0;
  const segments = data.map((d, i) => {
    const len = (d.pct / total) * C;
    const seg = (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={stroke}
        strokeDasharray={`${len} ${C}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        opacity={0.85}
      />
    );
    offset += len;
    return seg;
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.color.divider} strokeWidth={stroke} />
        {segments}
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
          fontSize: 10,
          color: T.color.textMuted,
          fontWeight: T.font_.weight.medium,
        }}>총 활동</span>
        <span style={{
          fontSize: 22,
          fontWeight: T.font_.weight.bold,
          color: T.color.textPrimary,
          fontFamily: T.font_.familyDisplay,
        }}>{totalCount}</span>
      </div>
    </div>
  );
}

/* ─── 예상 vs 실제 시간 추이 (line) ──────────────────────────── */

function TrendCard({ trend }) {
  return (
    <div style={card()}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={cardTitle()}>예상 vs 실제 시간 추이</div>
        <Legend />
      </div>
      {trend.points.length === 0 || trend.points.every(p => p.est === 0 && p.act === 0) ? (
        <Empty text="최근 7일 기록이 쌓이면 추이를 보여드릴게요" />
      ) : (
        <LineChart points={trend.points} maxY={trend.maxY} />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 16, height: 2, background: T.color.primary, display: 'inline-block' }} />
        <span style={{ color: T.color.textSecondary }}>예상 시간</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 16, height: 2, display: 'inline-block',
          backgroundImage: `linear-gradient(to right, ${T.color.textSecondary} 50%, transparent 50%)`,
          backgroundSize: '4px 2px',
        }} />
        <span style={{ color: T.color.textSecondary }}>실제 시간</span>
      </span>
    </div>
  );
}

function LineChart({ points, maxY }) {
  const width = 600;
  const height = 280;
  const padX = 40;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const xy = (i, val) => ({
    x: padX + i * stepX,
    y: padY + innerH - (val / maxY) * innerH,
  });

  const estPath = points.map((p, i) => {
    const { x, y } = xy(i, p.est);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const actPath = points.map((p, i) => {
    const { x, y } = xy(i, p.act);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // y축 grid
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    const yVal = (maxY / 4) * i;
    const y = padY + innerH - (yVal / maxY) * innerH;
    yTicks.push({ y, label: `${yVal.toFixed(0)}h` });
  }

  return (
    <div style={{ marginTop: 20, overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padX}
              x2={width - padX}
              y1={t.y}
              y2={t.y}
              stroke={T.color.divider}
              strokeWidth="1"
            />
            <text
              x={padX - 8}
              y={t.y + 4}
              fontSize="11"
              fill={T.color.textMuted}
              textAnchor="end"
              fontFamily="ui-monospace, monospace"
            >{t.label}</text>
          </g>
        ))}

        {/* 예상 시간 (실선) */}
        <path d={estPath} fill="none" stroke={T.color.primary} strokeWidth="2" />
        {/* 실제 시간 (점선) */}
        <path d={actPath} fill="none" stroke={T.color.textSecondary} strokeWidth="2" strokeDasharray="6 4" />

        {/* 점 */}
        {points.map((p, i) => {
          const a = xy(i, p.est);
          const b = xy(i, p.act);
          return (
            <g key={i}>
              <circle cx={a.x} cy={a.y} r="3.5" fill={T.color.primary} />
              <circle cx={b.x} cy={b.y} r="3.5" fill={T.color.bgCard} stroke={T.color.textSecondary} strokeWidth="1.5" />
            </g>
          );
        })}

        {/* x축 라벨 */}
        {points.map((p, i) => {
          const x = padX + i * stepX;
          const label = `${String(p.date.getMonth() + 1).padStart(2, '0')}.${String(p.date.getDate()).padStart(2, '0')}`;
          return (
            <text
              key={i}
              x={x}
              y={height - 4}
              fontSize="10"
              fill={T.color.textMuted}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >{label}</text>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── 우측 통계 카드 ─────────────────────────────────────────── */

function SummaryCard({ totalActualMin, totalEstMin, avgSpeed }) {
  const fast = avgSpeed <= 100;
  return (
    <div style={card()}>
      <div style={{
        fontSize: 12,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textMuted,
        marginBottom: 6,
        letterSpacing: T.font_.tracking.wider,
        textTransform: 'uppercase',
      }}>전체 기간</div>
      <div style={{
        fontSize: 32,
        fontWeight: T.font_.weight.bold,
        color: T.color.textPrimary,
        fontFamily: T.font_.familyDisplay,
        lineHeight: 1.1,
      }}>{formatMin(totalActualMin)}</div>
      <div style={{
        fontSize: 12,
        color: T.color.textMuted,
        marginTop: 4,
      }}>예상 {formatMin(totalEstMin)} 대비</div>

      <div style={{
        height: 1,
        background: T.color.divider,
        margin: '20px 0',
      }} />

      <div style={{
        fontSize: 32,
        fontWeight: T.font_.weight.bold,
        color: fast ? T.color.primary : T.color.warning,
        fontFamily: T.font_.familyDisplay,
        lineHeight: 1.1,
      }}>{avgSpeed}%</div>
      <div style={{
        fontSize: 12,
        color: T.color.textMuted,
        marginTop: 4,
      }}>{fast ? '빠르게 진행 중입니다' : '예상보다 느리게 진행 중입니다'}</div>
    </div>
  );
}

/* ─── 공통 ───────────────────────────────────────────────────── */

const card = () => ({
  background: T.color.bgCard,
  borderRadius: T.radius.lg,
  padding: '24px 24px',
  boxShadow: T.shadow.ambient,
  border: `1px solid ${T.color.border}`,
});

const cardTitle = () => ({
  fontSize: T.font_.size.title,
  fontWeight: T.font_.weight.semibold,
  color: T.color.textPrimary,
});

function Empty({ text }) {
  return (
    <div style={{
      fontSize: 13,
      color: T.color.textMuted,
      textAlign: 'center',
      padding: '40px 20px',
    }}>{text}</div>
  );
}
