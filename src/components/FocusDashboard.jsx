/* FocusDashboard.jsx — /focus 라우트 분석 + 세션 통합 대시보드 (Atelier Cyan v6g)
 *
 * 좌측 컬럼 (history 분석, records 기반):
 *   - 작업 속도 추이 (일/주/월 토글)
 *   - 활동 분포
 *   - 평균 작업 수행 시간
 *   - 주요 활동 섹터 / 평균 세션 시간 / 평균 대비 속도
 *
 * 우측 컬럼 (현재 진행 중인 세션 기반, plan 있을 때):
 *   - 라이브 타이머 카드 (이전 "집중 상태 요약" 도넛 자리)
 *     · STEP M/N · 행동유형
 *     · 현재 단계 제목
 *     · 큰 타이머 MM:SS
 *     · 진행률 바 (estimated 대비 elapsed)
 *     · 현재 속도 % (estimated/elapsed × 100)
 *     · 완료 / 세션 종료 버튼
 *   - 다음 할 일 카드 (이전 "고정 시간" 자리)
 *     · 다음 1-3개 단계 미리보기
 *
 * Plan 없을 때:
 *   - 라이브 타이머 자리 → 진행 중인 세션 없음 안내
 *   - 다음 할 일 자리 → 빈 안내
 *
 * 가이드 기반 계산식 (그대로 유지):
 *   Efficiency = (Expected / Actual) × 100
 *   Daily Avg = Σ(Actual)/Days
 *   Speed Change = Recent7d / Past7d × 100
 */

import { useState, useMemo, useEffect } from 'react';
import { T, CATEGORIES, formatMin, getSpeedY, getSpeedStatus, getSpeedStatusFromMins } from '../constants';
import { BEHAVIOR_TYPES, BUCKET_LABELS } from '../engine';

/* useFocusStats — records로부터 history 기반 통계 계산 */
function useFocusStats(records) {
  return useMemo(() => {
    if (!records || records.length === 0) {
      return {
        empty: true,
        trend: [],
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

    // 일별 그룹 → 작업 속도 추이
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
    const trend = dayList.slice(-7).map(d => {
      // x = (실제/예상)*100 → y = 10000/x = (예상/실제)*100
      const x = d.est > 0 && d.act > 0 ? (d.act / d.est) * 100 : null;
      const status = x != null ? getSpeedStatus(x) : null;
      return {
        d: `${String(d.date.getMonth() + 1).padStart(2, '0')}.${String(d.date.getDate()).padStart(2, '0')}`,
        dateKey: d.dateKey,
        est: d.est / 60,
        act: d.act / 60,
        estMin: d.est,
        actMin: d.act,
        // y값 (둘째 자리). 데이터 없을 시 100.
        efficiency: status ? status.y : 100,
        status,
      };
    });

    // 활동 분포
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

    // 평균 작업 수행 시간
    const dailyPerf = trend.map(d => ({ d: d.d, h: d.act, min: d.actMin }));
    const dailySum = dailyPerf.reduce((s, d) => s + d.min, 0);
    const dailyAvgMin = dailyPerf.length > 0 ? dailySum / dailyPerf.length : 0;

    // 평균 세션 시간
    const totalActMin = records.reduce((s, r) => s + (r.totalActualMin || 0), 0);
    const avgSessionMin = records.length > 0 ? totalActMin / records.length : 0;

    // 평균 대비 속도
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
export function FocusDashboard({ records = [], plan, onCompleteStep, onCancelSession, onNavigate }) {
  const stats = useFocusStats(records);
  const hasActiveSession = !!(plan && plan.items && plan.items.length > 0 && plan.curIdx < plan.items.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Header hasActiveSession={hasActiveSession} onCancel={onCancelSession} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 380px)',
        gap: 16,
        gridAutoRows: 'min-content',
      }} className="focus-grid">
        <div style={{ gridColumn: '1 / 3' }}>
          <SpeedTrendCard stats={stats} />
        </div>
        <div style={{ gridColumn: '3 / 4' }}>
          <LiveTimerCard plan={plan} hasActiveSession={hasActiveSession} onComplete={onCompleteStep} onNavigate={onNavigate} />
        </div>
        <div style={{ gridColumn: '1 / 2' }}>
          <ActivityDistCard stats={stats} />
        </div>
        <div style={{ gridColumn: '2 / 3' }}>
          <DailyPerfCard stats={stats} />
        </div>
        <div style={{ gridColumn: '3 / 4' }}>
          <NextStepsCard plan={plan} hasActiveSession={hasActiveSession} />
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
        @media (max-width: 1280px) {
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

function Header({ hasActiveSession, onCancel }) {
  return (
    <header style={{
      marginBottom: 6,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
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
        }}>{hasActiveSession
          ? '진행 중인 세션을 추적하고, 누적된 작업 속도를 함께 확인하세요.'
          : '작업 속도와 효율을 분석하여, 더 빠르고 스마트하게 일할 수 있도록 도와드립니다.'}
        </p>
      </div>

      {hasActiveSession && (
        <button
          onClick={onCancel}
          style={{
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: T.font_.weight.medium,
            color: '#C44949',
            background: 'rgba(255, 245, 245, 0.65)',
            border: '1px solid rgba(196, 73, 73, 0.20)',
            borderRadius: 9999,
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginTop: 8,
            transition: 'background 200ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 235, 235, 0.85)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 245, 245, 0.65)'; }}
        >세션 종료</button>
      )}
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


/* ─── 라이브 타이머 카드 (집중 상태 요약 자리) ─────────────── */

function LiveTimerCard({ plan, hasActiveSession, onComplete, onNavigate }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!hasActiveSession) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasActiveSession]);

  if (!hasActiveSession) {
    return (
      <CardLight style={{ minHeight: 350 }}>
        <CardTitle>현재 세션</CardTitle>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '40px 16px',
          color: T.color.textMuted,
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'rgba(0, 82, 45, 0.04)',
            border: '1px solid rgba(0, 82, 45, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.color.textMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7 V12 L15 14" />
            </svg>
          </div>
          <div style={{ fontSize: 13, color: T.color.textSecondary, fontWeight: T.font_.weight.medium }}>
            진행 중인 세션이 없어요
          </div>
          <div style={{ fontSize: 11, color: T.color.textMuted, lineHeight: 1.6 }}>
            메인에서 할 일을 분석하고 포커스 모드를 시작하세요
          </div>
          <button
            onClick={() => onNavigate?.('/')}
            style={{
              marginTop: 8,
              padding: '8px 18px',
              background: T.color.primary,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: T.font_.weight.semibold,
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(0, 82, 45, 0.18)',
            }}
          >메인으로 →</button>
        </div>
      </CardLight>
    );
  }

  const { items, curIdx, startTimes } = plan;
  const current = items[curIdx];
  const curStartedAt = startTimes?.[curIdx] || now;
  const elapsedSec = Math.max(0, Math.floor((now - curStartedAt) / 1000));
  const elapsedMin = elapsedSec / 60;
  const estMin = current?.estimatedMin || 0;
  const overTime = elapsedMin > estMin;
  // 사용자 정의 역수 모델: x = (실제/예상)*100 → y = 10000/x
  const status = getSpeedStatusFromMins(estMin, elapsedMin);
  const progressPct = estMin > 0 ? Math.min(100, Math.round((elapsedMin / estMin) * 100)) : 0;

  const bt = BEHAVIOR_TYPES[current?.behaviorType] || BEHAVIOR_TYPES.COGNITIVE;
  const stepTitle = (() => {
    const idx = current?.title?.indexOf(' — ');
    return idx > 0 ? current.title.slice(idx + 3) : (current?.title || '');
  })();

  return (
    <CardLight style={{
      border: `1px solid ${T.color.primary}`,
      boxShadow: '0 4px 18px rgba(0, 82, 45, 0.10)',
    }}>
      <CardTitle right={
        <span style={{
          fontSize: 10,
          fontFamily: T.font_.familyMono,
          letterSpacing: '0.06em',
          color: T.color.primary,
          background: T.color.mintSoft,
          padding: '2px 8px',
          borderRadius: 9999,
        }}>LIVE</span>
      }>현재 세션</CardTitle>

      <div style={{ fontSize: 10.5, color: T.color.textMuted, fontFamily: T.font_.familyMono, letterSpacing: '0.04em', marginBottom: 4 }}>
        STEP {curIdx + 1} / {items.length} · <span style={{ color: bt.color }}>{bt.label}</span>
      </div>
      <div style={{
        fontSize: 16,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        marginBottom: 18,
        letterSpacing: T.font_.tracking.tight,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{stepTitle}</div>

      {/* 큰 타이머 */}
      <div style={{
        background: 'rgba(232, 244, 237, 0.40)',
        borderRadius: 14,
        padding: '20px 16px',
        textAlign: 'center',
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: T.font_.familyMono,
          fontSize: 44,
          fontWeight: T.font_.weight.bold,
          color: overTime ? '#C97A4A' : T.color.primary,
          lineHeight: 1,
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 2,
        }}>
          <span>{String(Math.floor(elapsedSec / 60)).padStart(2, '0')}</span>
          <span style={{ opacity: 0.6 }}>:</span>
          <span>{String(elapsedSec % 60).padStart(2, '0')}</span>
        </div>
        <div style={{ fontSize: 10, color: T.color.textMuted, marginTop: 6 }}>경과 시간</div>
      </div>

      {/* 진행률 + 속도 (역수 모델 y값) */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: T.color.textMuted }}>
            예상 {formatMin(estMin)}
            {overTime && <span style={{ color: '#C97A4A', marginLeft: 6 }}>· 초과</span>}
          </span>
          <span style={{
            fontSize: 12,
            fontFamily: T.font_.familyMono,
            fontWeight: T.font_.weight.semibold,
            color: !status ? T.color.textMuted
              : status.type === 'fast' ? T.color.primary
              : status.type === 'slow' ? '#C97A4A'
              : T.color.textSecondary,
          }}>{status ? `${status.y}%` : '—'}</span>
        </div>
        <div style={{ height: 5, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, progressPct)}%`,
            height: '100%',
            background: overTime
              ? `linear-gradient(90deg, ${T.color.primary}, #C97A4A)`
              : `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
            borderRadius: 9999,
            transition: 'width 400ms ease',
          }} />
        </div>
      </div>

      {/* 상태 메시지 (역수 모델) */}
      {status && (
        <div style={{
          marginBottom: 14,
          padding: '8px 12px',
          background: status.type === 'fast' ? 'rgba(0, 82, 45, 0.06)'
            : status.type === 'slow' ? 'rgba(201, 122, 74, 0.08)'
            : 'rgba(24, 29, 25, 0.04)',
          border: `1px solid ${
            status.type === 'fast' ? 'rgba(0, 82, 45, 0.12)'
            : status.type === 'slow' ? 'rgba(201, 122, 74, 0.16)'
            : 'rgba(24, 29, 25, 0.08)'
          }`,
          borderRadius: 10,
          fontSize: 11.5,
          color: status.type === 'fast' ? T.color.primary
            : status.type === 'slow' ? '#A8602F'
            : T.color.textSecondary,
          textAlign: 'center',
          fontWeight: T.font_.weight.medium,
          letterSpacing: '0.01em',
        }}>{status.message}</div>
      )}

      <button
        onClick={onComplete}
        style={{
          width: '100%',
          padding: '11px 18px',
          background: T.color.primary,
          color: 'white',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontSize: 13.5,
          fontWeight: T.font_.weight.semibold,
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'background 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#003d22'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = T.color.primary; }}
      >
        <span aria-hidden>✓</span> 단계 완료
      </button>
    </CardLight>
  );
}


/* ─── 다음 할 일 카드 (고정 시간 자리) ─────────────────────── */

function NextStepsCard({ plan, hasActiveSession }) {
  if (!hasActiveSession) {
    return (
      <CardLight>
        <CardTitle>다음 할 일</CardTitle>
        <EmptyHint height={120} message={'세션이 시작되면\n다음 단계가 여기에 표시됩니다'} />
      </CardLight>
    );
  }

  const { items, curIdx } = plan;
  const upcoming = items.slice(curIdx + 1).filter(i => !i.isMarker).slice(0, 4);
  const remaining = items.slice(curIdx + 1).filter(i => !i.isMarker);
  const remainingMin = remaining.reduce((s, i) => s + (i.estimatedMin || 0), 0);

  return (
    <CardLight>
      <CardTitle right={
        <span style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>
          {remaining.length}개 · {formatMin(remainingMin)}
        </span>
      }>다음 할 일</CardTitle>

      {upcoming.length === 0 ? (
        <div style={{
          padding: '24px 12px',
          textAlign: 'center',
          color: T.color.textMuted,
          fontSize: 12,
        }}>
          <span aria-hidden style={{ fontSize: 22, display: 'block', marginBottom: 6, opacity: 0.5 }}>🎉</span>
          마지막 단계입니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {upcoming.map((it, i) => {
            const cat = CATEGORIES.find(c => c.key === it.cat) || CATEGORIES[CATEGORIES.length - 1];
            const stepTitle = (() => {
              const idx = it.title?.indexOf(' — ');
              return idx > 0 ? it.title.slice(idx + 3) : it.title;
            })();
            return (
              <div key={it.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                background: i === 0 ? 'rgba(232, 244, 237, 0.35)' : 'transparent',
                border: i === 0 ? '1px solid rgba(0, 82, 45, 0.08)' : '1px solid transparent',
              }}>
                <span style={{
                  width: 22, height: 22,
                  borderRadius: 6,
                  background: `${cat.color}1A`,
                  color: cat.color,
                  fontSize: 11,
                  fontFamily: T.font_.familyMono,
                  fontWeight: T.font_.weight.semibold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>{curIdx + 1 + i + 1}</span>
                <span style={{
                  flex: 1, minWidth: 0,
                  fontSize: 12.5,
                  color: i === 0 ? T.color.textPrimary : T.color.textSecondary,
                  fontWeight: i === 0 ? T.font_.weight.medium : T.font_.weight.regular,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{stepTitle}</span>
                <span style={{
                  fontSize: 10.5,
                  color: T.color.textMuted,
                  fontFamily: T.font_.familyMono,
                  flexShrink: 0,
                }}>{formatMin(it.estimatedMin)}</span>
              </div>
            );
          })}
          {remaining.length > upcoming.length && (
            <div style={{
              fontSize: 10.5,
              color: T.color.textMuted,
              textAlign: 'center',
              padding: '6px 0',
              fontFamily: T.font_.familyMono,
            }}>
              + {remaining.length - upcoming.length}개 더
            </div>
          )}
        </div>
      )}
    </CardLight>
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
                <text x="114" y="60" textAnchor="end" fill={T.color.primary} fontSize="10" fontFamily={T.font_.familyMono} fontWeight="600">{hover.efficiency.toFixed(2)}%</text>
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


/* 2. 활동 분포 */
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


/* 3. 평균 작업 수행 시간 */
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
