/* ═══════════════════════════════════════════════════════════════
   engine.js — v3.1.0 AI Scheduler Adapter

   외부(UI)에는 기존 계약 그대로 제공:
     export { runAnalysis, BEHAVIOR_TYPES, BUCKET_LABELS }

   내부는 detnete-scheduler v3.1.0 사용:
     - tasks[] → "A 그리고 B 그리고 C" 자연어 입력으로 변환
     - analyze(text, {now, ...}) 호출
     - schedule.timeline → detente breakdown shape 으로 매핑
     - v3 가 파싱 실패하면 레거시 엔진(engine-legacy.js) 으로 폴백
   ═══════════════════════════════════════════════════════════════ */

import { uid } from './constants';
import { analyze } from './ai/analyze-v3.js';
import { runAnalysisLegacy } from './engine-legacy.js';

/* ── 기존 UI가 참조하는 상수 (그대로 유지) ── */
export const BEHAVIOR_TYPES = {
  ACTIVATION:  { label: "시작 행동",  icon: "⚡", color: "#4CAF50", order: 0 },
  MECHANICAL:  { label: "단순 실행",  icon: "⚙️", color: "#7B8EB8", order: 5 },
  COGNITIVE:   { label: "집중 사고",  icon: "🧠", color: "#9C5BB5", order: 3 },
  EVALUATIVE:  { label: "판단/평가",  icon: "🔍", color: "#D4956A", order: 4 },
};
export const BUCKET_LABELS = { MICRO: "마이크로", EXECUTION: "실행", DEEP: "딥워크" };

/* ── v3 L1 → detente 카테고리 매핑 ── */
const L1_CAT = {
  personal_care: "physical",
  hygiene: "physical",
  eating: "physical",
  household: "organize",
  food_prep: "physical",
  commute: "move",
  movement: "move",
  transportation: "move",
  exercise: "physical",
  sports: "physical",
  research: "create",
  writing_academic: "create",
  creative: "create",
  creative_work: "create",
  study: "organize",
  learning: "organize",
  reading: "organize",
  work: "digital",
  professional: "digital",
  meeting: "talk",
  communication: "talk",
  social: "talk",
  relationship: "talk",
  digital: "digital",
  tech: "digital",
  admin: "organize",
  finance: "organize",
  rest: "wait",
  leisure: "other",
  entertainment: "other",
  maintenance: "organize",
  errand: "move",
  medical: "wait",
  health: "physical",
};
function mapL1ToCategory(l1, l2) {
  if (L1_CAT[l1]) return L1_CAT[l1];
  if (l2 && L1_CAT[l2]) return L1_CAT[l2];
  return "other";
}

/* ── v3 태그 → 한국어 라벨 (주요 태그만 오버라이드, 나머지는 L3/태그 자체) ── */
const TAG_LABEL = {
  full_shower: "샤워", quick_shower: "간단 샤워",
  simple_meal: "식사 준비", yogurt_granola: "요거트/그래놀라",
  full_draft: "논문 초안 작성", paper_drafting: "논문 작성",
  email_batch: "이메일 처리", email_triage: "이메일 분류",
  regular_meeting: "정기 미팅", meeting_regular: "정기 미팅",
  brush_teeth: "양치",
  warmup: "워밍업",
  quick_nap: "짧은 낮잠",
  deep_clean: "대청소",
  light_clean: "가벼운 청소",
};
function tagToLabel(tag, l3) {
  if (TAG_LABEL[tag]) return TAG_LABEL[tag];
  // L3 기반 추정: paper_drafting → 논문 작성
  if (l3 && TAG_LABEL[l3]) return TAG_LABEL[l3];
  // Fallback: snake_case → 사람이 읽을 수 있게
  return String(tag).replace(/_/g, " ");
}

/* ── 행동 유형 추정 (v3의 baseEnergy, l1 기반) ── */
function inferBehaviorType(step) {
  const { l1, l2, baseEnergy = 0 } = step;

  // 평가/검토 성 활동
  if (["research", "study", "learning"].includes(l1) && baseEnergy >= 3) return "COGNITIVE";
  if (l2 && /writing|drafting|analysis|planning/.test(l2)) return "COGNITIVE";
  if (l1 === "writing_academic" || l1 === "creative") return "COGNITIVE";

  // 회의/대화
  if (l1 === "meeting" || l1 === "communication" || l1 === "social") return "EVALUATIVE";

  // 에너지 기반
  if (baseEnergy >= 3) return "COGNITIVE";
  if (baseEnergy <= 1) return "MECHANICAL";
  return "MECHANICAL";
}

/* ── 시간 버킷 (Simon 청킹과 동일 규칙) ── */
function assignBucket(min) {
  if (min <= 2) return "MICRO";
  if (min <= 7) return "EXECUTION";
  return "DEEP";
}
const LOAD_MAP = { MICRO: 1, EXECUTION: 2, DEEP: 3 };

/* ── v3 step → detente breakdown item ── */
function v3StepToAction(step, order, parentTitle) {
  const estMin = Math.round((step.actFinal ?? step.baseAct ?? 1) * 10) / 10;
  const bucket = assignBucket(estMin);
  const label = tagToLabel(step.tag, step.l3);
  return {
    id: uid(),
    parentTitle: parentTitle || tagToLabel(step.l3 || step.tag),
    title: `${parentTitle || label} — ${label}`,
    shortTitle: label,
    estimatedMin: estMin,
    category: mapL1ToCategory(step.l1, step.l2),
    behaviorType: step.isFixed ? "EVALUATIVE" : inferBehaviorType(step),
    timeBucket: bucket,
    cognitiveLoad: LOAD_MAP[bucket],
    rewardScore: Math.round((1 / Math.max(0.5, estMin)) * 100) / 100,
    difficulty: Math.min(10, Math.max(1, Math.round((step.baseEnergy ?? 2) * 2))),
    energy: Math.min(5, Math.max(1, Math.round(step.baseEnergy ?? 2))),
    order,
    isMarker: false,
    v3: {
      tag: step.tag,
      clockTime: step.clockTime,
      isFixed: !!step.isFixed,
      energyMultiplier: step.energyMultiplier ?? 1,
      isRecovery: !!step.isRecovery,
    },
  };
}

/* ── Skinner 진행 마커 ── */
function makeMarker(count, order) {
  return {
    id: uid(),
    parentTitle: "__marker__",
    title: `✓ 진행 체크포인트 — ${count}개 완료`,
    shortTitle: `✓ ${count}개 완료`,
    estimatedMin: 0.5,
    category: "other",
    behaviorType: "ACTIVATION",
    timeBucket: "MICRO",
    cognitiveLoad: 1,
    rewardScore: 2.0,
    difficulty: 0,
    energy: 0,
    order,
    isMarker: true,
  };
}

/* ── 현재 시각을 HH:MM 문자열로 ── */
function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ══════════════════════════════════════════════════════════
   메인 파이프라인
   ══════════════════════════════════════════════════════════ */
export function runAnalysis(tasks, learningData) {
  const valid = tasks.filter(t => t.title && t.title.trim());
  if (!valid.length) {
    return { breakdown: [], analyses: [], totalEstMin: 0, totalReward: 0, totalCost: 0 };
  }

  // 1) 입력 조합
  const text = valid.map(t => t.title.trim()).join(" 그리고 ");

  // 2) v3 분석 호출
  let v3;
  try {
    v3 = analyze(text, {
      now: nowHHMM(),
      inferMissing: true,
      optimize: true,
      strictTimeEnforcement: false, // UI 런타임에서는 관대하게
    });
  } catch (e) {
    console.warn("[engine] v3 analyze threw, falling back:", e?.message || e);
    return runAnalysisLegacy(tasks, learningData);
  }

  // 3) 인식 실패 시 레거시 폴백
  const timeline = v3?.schedule?.timeline || [];
  const realSteps = timeline.filter(s => s.tag && !String(s.tag).startsWith("__"));
  if (v3.error || realSteps.length === 0) {
    console.info("[engine] v3 returned no activities, using legacy engine");
    return runAnalysisLegacy(tasks, learningData);
  }

  // 4) 태그 → 입력 태스크 역매핑 (parsedDetails 기반)
  const tagToInput = new Map();
  (v3.parsedDetails || []).forEach(d => {
    if (d.matched && d.l4) tagToInput.set(d.l4, d.input);
  });

  // 5) timeline → breakdown (마커 3개마다 삽입)
  const breakdown = [];
  let realCount = 0;
  realSteps.forEach(step => {
    const parent = tagToInput.get(step.tag) || tagToLabel(step.l3 || step.tag);
    breakdown.push(v3StepToAction(step, breakdown.length, parent));
    realCount++;
    if (realCount % 3 === 0 && realCount < realSteps.length) {
      breakdown.push(makeMarker(realCount, breakdown.length));
    }
  });

  // 6) 각 입력 태스크의 분석 메타 (UI score-panel 용)
  const analyses = valid.map(t => {
    const detail = (v3.parsedDetails || []).find(d => d.input === t.title.trim());
    if (!detail || !detail.matched) {
      return { title: t.title, type: "COGNITIVE", complexity: 5, tier: "medium", domain: "other" };
    }
    const matchedSteps = timeline.filter(s => s.tag === detail.l4);
    const avgEnergy = matchedSteps.length
      ? matchedSteps.reduce((a, s) => a + (s.baseEnergy || 0), 0) / matchedSteps.length
      : 2;
    const complexity = Math.min(10, Math.max(1, Math.round(avgEnergy * 2.5)));
    const tier = complexity <= 4 ? "simple" : complexity <= 7 ? "medium" : "hard";
    const bt = inferBehaviorType(matchedSteps[0] || { baseEnergy: avgEnergy });
    return {
      title: t.title,
      type: bt,
      complexity,
      tier,
      domain: mapL1ToCategory(matchedSteps[0]?.l1, matchedSteps[0]?.l2),
    };
  });

  // 7) 집계
  const totalEstMin = breakdown.filter(b => !b.isMarker).reduce((s, b) => s + b.estimatedMin, 0);
  const totalReward = breakdown.reduce((s, b) => s + (b.rewardScore || 0), 0);
  const totalCost = breakdown.reduce((s, b) => s + (b.cognitiveLoad || 0), 0);

  // 8) v3 부가정보도 반환 (UI 확장 가능)
  return {
    breakdown,
    analyses,
    totalEstMin,
    totalReward,
    totalCost,
    v3: {
      engineVersion: "3.1.0",
      parsed: v3.parsed,
      unmatched: v3.unmatched,
      inferred: v3.inferred,
      finalEnergy: v3?.schedule?.finalEnergy,
      droppedAnchors: v3?.schedule?.droppedAnchors || [],
      summary: v3.summary,
    },
  };
}
