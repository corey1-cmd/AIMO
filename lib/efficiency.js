/* ═══════════════════════════════════════════════════════════════
   efficiency.js — Composite Efficiency Score (PRD §4.1.1)
   
   EfficiencyScore = round(
       0.40 × normalize(speedY)         // 100 → 50pt, 200 → 100pt, 50 → 0pt
     + 0.30 × consistency(stddev)       // lower stddev → higher pt
     + 0.20 × completionRate            // % of plans completed without cancel
     + 0.10 × recencyBonus              // last 7d activity → up to 10pt
   , 0)
   
   Output: integer 0–100. Color band: ≥80 good, 60–79 neutral, <60 warn.
   ═══════════════════════════════════════════════════════════════ */

import { getSpeedStatusFromMins } from '../constants';

/**
 * 메인 진입 함수.
 * @param {Array} records — 사용자 기록 목록
 * @returns {{ score, band, breakdown } | null}
 *   score: 0-100 정수
 *   band: 'good' | 'neutral' | 'warn'
 *   breakdown: { speed, consistency, completion, recency } — 각 0-1 정규화 값
 */
export function computeEfficiencyScore(records) {
  if (!Array.isArray(records) || records.length === 0) return null;

  const speed = computeSpeedComponent(records);
  const consistency = computeConsistencyComponent(records);
  const completion = computeCompletionComponent(records);
  const recency = computeRecencyComponent(records);

  // 가중 합산 (0-100)
  const score = Math.round(
      0.40 * speed       * 100
    + 0.30 * consistency * 100
    + 0.20 * completion  * 100
    + 0.10 * recency     * 100
  );

  const clamped = Math.max(0, Math.min(100, score));
  const band = clamped >= 80 ? 'good' : clamped >= 60 ? 'neutral' : 'warn';

  return {
    score: clamped,
    band,
    breakdown: { speed, consistency, completion, recency },
  };
}

/**
 * 속도 컴포넌트 (0-1).
 * 역수 모델 y값 평균을 정규화: y=100 → 0.5, y=200 → 1.0, y=50 → 0.0.
 * 데이터 부족하면 0.5 (중립).
 */
function computeSpeedComponent(records) {
  const ys = [];
  for (const r of records) {
    if (!r) continue;
    const status = getSpeedStatusFromMins(r.totalEstMin, r.totalActualMin);
    if (status && Number.isFinite(status.y)) ys.push(status.y);
  }
  if (ys.length === 0) return 0.5;
  const avg = ys.reduce((s, v) => s + v, 0) / ys.length;
  // y=50 → 0, y=100 → 0.5, y=200 → 1.0 (선형)
  return Math.max(0, Math.min(1, (avg - 50) / 150));
}

/**
 * 일관성 컴포넌트 (0-1).
 * 속도 표준편차가 낮을수록 점수 높음.
 * stddev 0 → 1.0, stddev 50+ → 0.0.
 */
function computeConsistencyComponent(records) {
  const ys = [];
  for (const r of records) {
    if (!r) continue;
    const status = getSpeedStatusFromMins(r.totalEstMin, r.totalActualMin);
    if (status && Number.isFinite(status.y)) ys.push(status.y);
  }
  if (ys.length < 2) return 0.5;
  const mean = ys.reduce((s, v) => s + v, 0) / ys.length;
  const variance = ys.reduce((s, v) => s + (v - mean) ** 2, 0) / ys.length;
  const stddev = Math.sqrt(variance);
  // stddev 0 → 1.0, 50+ → 0.0 (선형)
  return Math.max(0, Math.min(1, 1 - stddev / 50));
}

/**
 * 완료율 컴포넌트 (0-1).
 * 현재 데이터 모델은 완료된 record 만 저장하므로, 모든 record = 완료.
 * 향후 cancel 추적 추가 시 확장 가능. 지금은 1.0 고정 + 학습 데이터 기여 비율로 보정.
 */
function computeCompletionComponent(records) {
  if (records.length === 0) return 0.5;
  // 현재는 단순히 record 수가 일정 수준 이상이면 1.0
  // n=1 → 0.6, n=5 → 0.8, n=10+ → 1.0
  return Math.max(0, Math.min(1, 0.5 + records.length / 20));
}

/**
 * 최근 활동 컴포넌트 (0-1).
 * 지난 7일 내 record 수에 비례.
 * 0 → 0.0, 5+ → 1.0.
 */
function computeRecencyComponent(records) {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const recent = records.filter(r => {
    if (!r || !r.date) return false;
    const t = new Date(r.date).getTime();
    return Number.isFinite(t) && t >= weekAgo;
  });
  return Math.max(0, Math.min(1, recent.length / 5));
}
