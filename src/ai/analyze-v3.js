/* ═══════════════════════════════════════════════════════════════
   analyze-v3.js — 통합 분석 파이프라인 (TimeContext-enabled)

   Public API:
     analyze(text, opts)
     replan(prevResult, newNow, optsDelta?)     — Task 1 (H4)
     filterExpiredAnchors(anchors, ctx, opts?)  — Task 2

   Invariants enforced:
     H1: no task emitted with startTime < ctx.now
     H3: no anchor kept with fixedAt < ctx.now
     H4: ctx.now is monotonically non-decreasing across replan calls
   ═══════════════════════════════════════════════════════════════ */

import { parseInput } from './parser-v3.js';
import { analyzeDependencies } from './dependency-engine.js';
import { schedule, formatSchedule } from './scheduler.js';
import { TimeContext, TimeRegressionError, parseTime, nowContext } from './time-contract.js';

function resolveContext(opts) {
  if (opts.timeCtx instanceof TimeContext) return opts.timeCtx;
  if (opts.now != null) return new TimeContext({ now: parseTime(opts.now), source: 'opts.now' });
  if (opts.currentTime != null) {
    return new TimeContext({ now: parseTime(opts.currentTime), source: 'opts.currentTime' });
  }
  return null;
}

/**
 * Task 2 — Expired anchor filter. Categorizes each anchor into:
 *   STRICT_PAST             fixedAt < ctx.now
 *   OVERLAPPED_BY_RUNNING   running task still active at fixedAt
 *   COLLAPSED_AFTER_DELAY   same-minute duplicate (keep first)
 */
export function filterExpiredAnchors(anchors, ctx, { runningTask = null } = {}) {
  if (!ctx) return { kept: anchors, dropped: [] };
  const kept = [];
  const dropped = [];
  const seenAtMinute = new Set();
  const runningEndsAt = runningTask?.endsAt ?? null;

  for (const a of anchors) {
    const fixedAt = typeof a.startAt === 'string' ? parseTime(a.startAt) : a.fixedAt ?? a.startAt;

    if (fixedAt < ctx.now) {
      dropped.push({ tag: a.tag, fixedAt, reason: 'STRICT_PAST', category: 'expired' });
      continue;
    }
    if (runningEndsAt != null && fixedAt < runningEndsAt) {
      dropped.push({
        tag: a.tag, fixedAt, reason: 'OVERLAPPED_BY_RUNNING',
        category: 'expired', runningEndsAt,
      });
      continue;
    }
    if (seenAtMinute.has(fixedAt)) {
      dropped.push({
        tag: a.tag, fixedAt, reason: 'COLLAPSED_AFTER_DELAY', category: 'expired',
      });
      continue;
    }
    seenAtMinute.add(fixedAt);
    kept.push(a);
  }
  return { kept, dropped };
}

export function analyze(text, opts = {}) {
  const { weights = {}, inferMissing = true, optimize = true } = opts;

  const parsed = parseInput(text);
  if (parsed.tags.length === 0) {
    return {
      input: text,
      error: 'No activities recognized',
      unmatched: parsed.unmatched,
    };
  }

  const dep = analyzeDependencies(parsed.tags, {
    inferMissing,
    respectInputOrder: !optimize,
    companionState: opts.companionState || null,
    currentHour: opts.currentHour ?? null,
    recoveryThresholds: opts.recoveryThresholds || {},
  });

  const p8Map = new Map();
  for (const w of (dep.emotionalWarnings || [])) {
    if (w.affectedTag && w.multiplierSuggestion && w.multiplierSuggestion !== 1.0) {
      p8Map.set(w.affectedTag, w.multiplierSuggestion);
    }
  }

  const ctx = resolveContext(opts);
  const inputAnchors = opts.fixedEvents || [];
  const { kept: keptAnchors, dropped: prefilterDropped } = filterExpiredAnchors(
    inputAnchors, ctx, { runningTask: opts.runningTask }
  );

  const sched = schedule(dep.ordered, {
    weights, reorder: true,
    timeCtx: ctx,
    currentTime: ctx ? null : (opts.currentTime || null),
    fixedEvents: keptAnchors,
    emotionalAdjustments: p8Map.size > 0 ? p8Map : null,
    interruptions: opts.interruptions || [],
    runningTask: opts.runningTask || null,
    strictTimeEnforcement: opts.strictTimeEnforcement !== false,
  });

  const allDroppedAnchors = [...prefilterDropped, ...(sched.droppedAnchors || [])];

  return {
    input: text,
    parsed: parsed.tags,
    parsedDetails: parsed.details,
    unmatched: parsed.unmatched,
    inferred: dep.inferred,
    finalOrder: dep.ordered.map(o => o.tag),
    dependencies: dep.depSummary,
    constraints: dep.constraints,
    periodicSuggestions: dep.periodicSuggestions,
    emotionalWarnings: dep.emotionalWarnings,
    recoverySuggestions: dep.recoverySuggestions,
    schedule: { ...sched, droppedAnchors: allDroppedAnchors },
    summary: formatSchedule(sched),
    ctx,
    _originalOpts: opts,  // for replan()
  };
}

/**
 * Task 1 — Replan with H4 monotonic now enforcement.
 * newNow must be ≥ prevResult.ctx.now or TimeRegressionError is thrown.
 */
export function replan(prevResult, newNow, optsDelta = {}) {
  if (!prevResult || !prevResult.ctx) {
    throw new TimeRegressionError('REPLAN_REQUIRES_CTX', {
      msg: 'Previous result has no TimeContext; cannot enforce H4',
    });
  }
  const newCtx = prevResult.ctx.advance({
    now: parseTime(newNow),
    source: optsDelta._source || 'replan',
  });
  const merged = { ...(prevResult._originalOpts || {}), ...optsDelta, timeCtx: newCtx };
  return analyze(prevResult.input, merged);
}

export { TimeContext, TimeRegressionError, nowContext };
