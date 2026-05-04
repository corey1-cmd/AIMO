/* ═══════════════════════════════════════════════════════════════
   insights.js — Deterministic insight statements (PRD §4.2)
   
   No LLM dependency. Trigger rules + Korean templates.
   Returns 0-3 statements, ordered by signal strength.
   
   Threshold: empty data (n<5) → return [] so UI can show fallback copy.
   ═══════════════════════════════════════════════════════════════ */

import { getSpeedStatusFromMins, CATEGORIES } from '../constants';

const MIN_RECORDS = 5;

/**
 * Generate up to 3 insight statements from records.
 * @param {Array} records
 * @returns {Array<{id, text, severity}>}
 *   severity: 'positive' | 'neutral' | 'attention'
 */
export function generateInsights(records) {
  if (!Array.isArray(records) || records.length < MIN_RECORDS) return [];

  const candidates = [];

  // Rule 1: Recent speed trend (7-day)
  const recentSpeed = computeRecentSpeedTrend(records);
  if (recentSpeed) candidates.push(recentSpeed);

  // Rule 2: Slowest category
  const slowestCat = findSlowestCategory(records);
  if (slowestCat) candidates.push(slowestCat);

  // Rule 3: Fastest category
  const fastestCat = findFastestCategory(records);
  if (fastestCat) candidates.push(fastestCat);

  // Rule 4: Streak / activity volume
  const activity = activityVolume(records);
  if (activity) candidates.push(activity);

  // Rule 5: Consistency
  const consistency = consistencyInsight(records);
  if (consistency) candidates.push(consistency);

  // Sort by signal strength desc, take top 3
  candidates.sort((a, b) => b.signal - a.signal);
  return candidates.slice(0, 3).map(c => ({
    id: c.id,
    text: c.text,
    severity: c.severity,
  }));
}

/* ─── Rule 1: 7-day speed vs prior 7-day ─── */
function computeRecentSpeedTrend(records) {
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  const last7 = records.filter(r => r?.date && (now - new Date(r.date).getTime()) <= 7 * day);
  const prior7 = records.filter(r => {
    if (!r?.date) return false;
    const dt = now - new Date(r.date).getTime();
    return dt > 7 * day && dt <= 14 * day;
  });
  if (last7.length < 3) return null;

  const lastY = avgSpeedY(last7);
  if (lastY == null) return null;

  if (prior7.length >= 3) {
    const priorY = avgSpeedY(prior7);
    if (priorY != null) {
      const delta = lastY - priorY;
      if (Math.abs(delta) >= 5) {
        const pct = Math.round(Math.abs(delta));
        if (delta > 0) {
          return {
            id: 'speed-up',
            text: `지난 7일 동안 평균보다 ${pct}% 빠르게 진행하고 계세요.`,
            severity: 'positive',
            signal: Math.abs(delta) + 50,  // higher delta = stronger signal
          };
        } else {
          return {
            id: 'speed-down',
            text: `지난 7일 동안 평균보다 ${pct}% 느리게 진행되고 있어요.`,
            severity: 'attention',
            signal: Math.abs(delta) + 50,
          };
        }
      }
    }
  }

  // Fallback: just describe current pace
  if (lastY >= 110) {
    return {
      id: 'pace-fast',
      text: `지난 7일 평균 ${Math.round(lastY)}% 페이스로 빠르게 진행 중입니다.`,
      severity: 'positive',
      signal: 30,
    };
  }
  if (lastY <= 90) {
    return {
      id: 'pace-slow',
      text: `지난 7일 평균 ${Math.round(lastY)}% 페이스로 예상보다 더 걸리고 있어요.`,
      severity: 'attention',
      signal: 30,
    };
  }
  return null;
}

/* ─── Rule 2/3: Per-category speed extremes ─── */
function findSlowestCategory(records) {
  const stats = perCategoryStats(records);
  let worst = null;
  for (const [key, s] of Object.entries(stats)) {
    if (s.count < 3) continue;
    if (s.y >= 95) continue;  // not slow enough
    if (!worst || s.y < worst.y) worst = { key, ...s };
  }
  if (!worst) return null;
  const label = CATEGORIES.find(c => c.key === worst.key)?.label || worst.key;
  const slowerPct = Math.round(100 - worst.y);
  return {
    id: `cat-slow-${worst.key}`,
    text: `${label} 작업은 평균보다 ${slowerPct}% 더 걸리고 있어요.`,
    severity: 'attention',
    signal: (100 - worst.y) + 20,
  };
}

function findFastestCategory(records) {
  const stats = perCategoryStats(records);
  let best = null;
  for (const [key, s] of Object.entries(stats)) {
    if (s.count < 3) continue;
    if (s.y <= 105) continue;  // not fast enough
    if (!best || s.y > best.y) best = { key, ...s };
  }
  if (!best) return null;
  const label = CATEGORIES.find(c => c.key === best.key)?.label || best.key;
  const fasterPct = Math.round(best.y - 100);
  return {
    id: `cat-fast-${best.key}`,
    text: `${label} 작업은 평균보다 ${fasterPct}% 빠르게 진행하고 있어요.`,
    severity: 'positive',
    signal: (best.y - 100) + 15,
  };
}

/* ─── Rule 4: Activity volume ─── */
function activityVolume(records) {
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  const last7 = records.filter(r => r?.date && (now - new Date(r.date).getTime()) <= 7 * day);
  if (last7.length === 0) {
    return {
      id: 'no-recent',
      text: '지난 7일 동안 새 기록이 없어요. 첫 세션을 시작해 보세요.',
      severity: 'attention',
      signal: 25,
    };
  }
  if (last7.length >= 10) {
    return {
      id: 'high-volume',
      text: `지난 7일 동안 ${last7.length}개의 세션을 완료했습니다. 꾸준한 페이스예요.`,
      severity: 'positive',
      signal: 20,
    };
  }
  return null;
}

/* ─── Rule 5: Consistency ─── */
function consistencyInsight(records) {
  const ys = [];
  for (const r of records) {
    const s = getSpeedStatusFromMins(r?.totalEstMin, r?.totalActualMin);
    if (s) ys.push(s.y);
  }
  if (ys.length < 5) return null;
  const mean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const stddev = Math.sqrt(ys.reduce((a, b) => a + (b - mean) ** 2, 0) / ys.length);
  if (stddev <= 12) {
    return {
      id: 'consistent',
      text: '작업 속도가 일정합니다. 예측 가능한 페이스를 유지하고 있어요.',
      severity: 'positive',
      signal: 18,
    };
  }
  if (stddev >= 35) {
    return {
      id: 'inconsistent',
      text: '세션마다 속도 편차가 큽니다. 환경이나 컨디션을 점검해 보세요.',
      severity: 'attention',
      signal: 22,
    };
  }
  return null;
}

/* ─── Helpers ─── */
function avgSpeedY(records) {
  const ys = [];
  for (const r of records) {
    const s = getSpeedStatusFromMins(r?.totalEstMin, r?.totalActualMin);
    if (s) ys.push(s.y);
  }
  if (ys.length === 0) return null;
  return ys.reduce((a, b) => a + b, 0) / ys.length;
}

function perCategoryStats(records) {
  const m = {};
  for (const r of records) {
    if (!r || !Array.isArray(r.breakdown)) continue;
    for (const b of r.breakdown) {
      if (!b) continue;
      const cat = b.cat || 'other';
      if (!m[cat]) m[cat] = { totalEst: 0, totalAct: 0, count: 0 };
      m[cat].totalEst += Number.isFinite(b.estMin) ? b.estMin : 0;
      m[cat].totalAct += Number.isFinite(b.actMin) ? b.actMin : 0;
      m[cat].count++;
    }
  }
  const out = {};
  for (const [k, v] of Object.entries(m)) {
    const status = getSpeedStatusFromMins(v.totalEst, v.totalAct);
    if (status) out[k] = { y: status.y, count: v.count };
  }
  return out;
}
