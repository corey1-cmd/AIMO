# AIMO Design Refresh — Build Process Plan

> **Document Type**: Implementation plan, paired with PRD.md
> **Scope**: Phase 2 — visual + IA redesign
> **Status**: Ready to execute on PRD sign-off
> **Last updated**: v6m

---

## 1. Strategy

The redesign touches a large surface (5+ pages, all data surfaces). Executing it as a single monolithic refactor would block the codebase and make regressions hard to isolate. Instead the work is broken into **5 sequential phases**, each independently shippable and verifiable.

Each phase produces a working build. Each phase has explicit acceptance gates aligned with PRD §7.

---

## 2. Phase Overview

```
Phase 2.A — Design Tokens & Foundation        [1 round]
Phase 2.B — Analysis Page (priority page)     [2 rounds]
Phase 2.C — Record Page                       [1 round]
Phase 2.D — Focus, Main, Settings tokens      [1 round]
Phase 2.E — Polish & Acceptance               [1 round]
```

Total: **6 rounds** of work, each producing a verified ZIP.

Critical path: 2.A → 2.B (everything else can defer).

---

## 3. Phase 2.A — Design Tokens & Foundation

**Goal**: All new tokens and primitive components in place, but no page consumes them yet (compatibility layer keeps everything green).

### 3.1 Files Touched

| File | Change |
|---|---|
| `src/constants.js` | Add v2 token export `T2 = { color, font, space, radius }`. Keep `T` (v1) intact. |
| `src/styles.js` | Decoration removal flag `DECORATION_LEVEL` per page. Keep gradients usable but optional. |
| **NEW** `src/components/v2/KpiCard.jsx` | Primitive |
| **NEW** `src/components/v2/Table.jsx` | Strict-craft tabular component |
| **NEW** `src/components/v2/FilterBar.jsx` | 3-axis filter primitive |
| **NEW** `src/components/v2/InsightStatement.jsx` | NLP rendering primitive |
| **NEW** `src/components/v2/EfficiencyScore.jsx` | Composite indicator |
| **NEW** `src/lib/insights.js` | Deterministic insight generation |
| **NEW** `src/lib/efficiency.js` | Score formula |

### 3.2 Token Migration Pattern

Tokens are added side-by-side, not replacing. Pages opt in by importing `T2`.

```javascript
// constants.js
export const T = { /* existing v1 tokens, unchanged */ };
export const T2 = {
  color: { primary: '#003D2A', accent: '#7BB89E', /* ... */ },
  font: { display: 32, heading: 18, body: 14, caption: 12, mono: 13 },
  space: [4, 8, 12, 16, 20, 24, 32, 40, 56, 80],
  radius: { sm: 6, md: 10, lg: 16 },
};
```

### 3.3 Acceptance

- [ ] `T2` exports correct values per PRD §5.1, §5.2, §5.3
- [ ] All 5 v2 primitives render in isolation (storybook-like sandbox or comments)
- [ ] `insights.js` returns `[]` for empty input, ≤3 items for full input
- [ ] `efficiency.js` returns 0–100 integer
- [ ] Build passes
- [ ] Zero visual changes to existing pages

---

## 4. Phase 2.B — Analysis Page (Round 1: Stage 1+2; Round 2: Stage 3+4)

**Goal**: Analysis page fully migrated to four-stage flow. This is the priority page — it's the audit's primary failure case.

### 4.1 Round 1 — Summary + Insights

**Files Touched**

| File | Change |
|---|---|
| `src/App.jsx` | `AnalysisPage` rewritten to use four-stage layout. KPI strip (Stage 1), Chart+Insights block (Stage 2). Filters and table left as-is temporarily. |

**Layout** (1366+):
```
┌────────────────────────────────────────────────────────────────┐
│  Analysis                                                       │
│  ──────────────────────────────────────────────────────────────│
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────────────┐            │
│  │ Total │  │ Avg   │  │ Avg   │  │ Efficiency    │            │
│  │ Tasks │  │ Time  │  │ Speed │  │ Score (big)   │            │
│  │  47   │  │ 1h22m │  │ 108%  │  │     82        │            │
│  └───────┘  └───────┘  └───────┘  └───────────────┘            │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │  Planned vs Actual       │  │  Insights                │     │
│  │  (line chart, 7-day)     │  │  • 12% faster lately…    │     │
│  │                          │  │  • Email tasks slower…   │     │
│  └─────────────────────────┘  └─────────────────────────┘     │
│                                                                 │
│  [legacy filters + table — to be replaced in Round 2]          │
└────────────────────────────────────────────────────────────────┘
```

**Acceptance** (Round 1)
- [ ] All 4 KPI cards visible above the fold on 1366×768
- [ ] Efficiency Score renders correct value & color band
- [ ] Insights block renders 1–3 statements OR empty-state copy
- [ ] No DecorativeWave on this page
- [ ] Build passes; legacy filters/table still work below

### 4.2 Round 2 — Exploration + Detailed Data

**Files Touched**

| File | Change |
|---|---|
| `src/App.jsx` | `AnalysisPage` Stage 3 (FilterBar) + Stage 4 (Table). Removes legacy donut and radial. |

**Acceptance** (Round 2)
- [ ] Three filter axes visible, each with label
- [ ] Filters mutually exclusive within axis
- [ ] Table follows craft rules (right-aligned numbers, single-line dates, fr-grid)
- [ ] Speed displayed as multiplier (e.g., `1.33×`) with toggle to relative (e.g., `+33%`)
- [ ] Status colors per PRD §5.1
- [ ] Page passes WCAG AA contrast

---

## 5. Phase 2.C — Record Page

**Goal**: Same four-stage treatment, lighter (no Stage 2).

**Files Touched**

| File | Change |
|---|---|
| `src/App.jsx` | `RecordPage` rewrite. KPI lite (2 cards) + FilterBar + Table. |

**Layout** (1366+):
```
┌────────────────────────────────────────────────────────────────┐
│  Tasks Record                                                   │
│  ──────────────────────────────────────────────────────────────│
│  ┌──────────┐  ┌──────────┐                                     │
│  │ Saved    │  │ This week│                                     │
│  │  124     │  │   8      │                                     │
│  └──────────┘  └──────────┘                                     │
│                                                                 │
│  [FilterBar]                                                    │
│  [Table — strict craft]                                         │
└────────────────────────────────────────────────────────────────┘
```

**Acceptance**
- [ ] Two KPI cards above the fold
- [ ] FilterBar uses same 3-axis pattern as Analysis (with Save State as third axis instead of Sort)
- [ ] Table identical craft rules to Analysis
- [ ] Save toggle (status) and ⋯ menu (action) visually distinct — affordance fixed
- [ ] No DecorativeWave

---

## 6. Phase 2.D — Focus, Main, Settings — Token Migration

**Goal**: Pages preserved structurally, but visual tokens swapped to v2.

### 6.1 Focus Page

**Changes**: `T` → `T2` references for color, typography. Electric mint replaced with new accent. Preserve all session-aware functionality.

### 6.2 Main Page

**Changes**: Sidebar (Goal / Calendar / Active Sessions) re-tokenized. Right input box re-tokenized. Layout untouched.

### 6.3 Settings Page

**Changes**: Token swap. Auto-verify flow preserved. StatusMessage component re-tokenized.

**Acceptance**
- [ ] All three pages render without electric mint
- [ ] All session / calendar / settings functionality unchanged
- [ ] Token leak detection: search for hard-coded `#4FE0A8`, `#00522D` returns 0 results in src/

---

## 7. Phase 2.E — Polish & Acceptance

**Goal**: Final pass against PRD §7 acceptance criteria. Cleanup of v1 tokens once all consumers migrated.

**Tasks**

- Remove `T` (v1 tokens) export from `constants.js` once nothing consumes it
- Run automated WCAG check on all pages
- Verify above-fold KPI on 1366×768 baseline (manual screenshot regression)
- Audit decoration: confirm DecorativeWave removed from data surfaces
- Audit typography: confirm 3-size system used everywhere
- Audit color: confirm zero electric mint in src/

**Acceptance** — full PRD §7 criteria pass.

---

## 8. File Changes Summary (whole Phase 2)

| File | Phase | Type |
|---|---|---|
| `src/constants.js` | 2.A | Add v2 tokens |
| `src/components/v2/KpiCard.jsx` | 2.A | NEW |
| `src/components/v2/Table.jsx` | 2.A | NEW |
| `src/components/v2/FilterBar.jsx` | 2.A | NEW |
| `src/components/v2/InsightStatement.jsx` | 2.A | NEW |
| `src/components/v2/EfficiencyScore.jsx` | 2.A | NEW |
| `src/lib/insights.js` | 2.A | NEW |
| `src/lib/efficiency.js` | 2.A | NEW |
| `src/App.jsx` (AnalysisPage) | 2.B | Rewrite |
| `src/App.jsx` (RecordPage) | 2.C | Rewrite |
| `src/App.jsx` (FocusPage section) | 2.D | Token swap |
| `src/App.jsx` (MainPage section) | 2.D | Token swap |
| `src/App.jsx` (SettingsPage) | 2.D | Token swap |
| `src/components/FocusDashboard.jsx` | 2.D | Token swap |
| `src/components/CalendarPanel.jsx` | 2.D | Token swap |
| `src/components/GoalMemoCard.jsx` | 2.D | Token swap |
| `src/components/ActiveSessionsCard.jsx` | 2.D | Token swap |
| `src/styles.js` | 2.D | Decoration flag |
| `src/constants.js` | 2.E | Remove v1 tokens |

Estimated total LOC change: **+1,800 / −1,200** (net +600).

---

## 9. Risk & Rollback

Each phase ships an independent ZIP. If a phase causes regression:

- **Rollback strategy**: Revert to previous round's ZIP. v1 tokens preserved through Phase 2.D specifically to allow incremental rollback.
- **Phase 2.A → 2.B isolation**: New tokens never break v1 consumers because v1 tokens are not modified.
- **Phase 2.D → 2.E isolation**: v1 tokens removed only after exhaustive grep proves zero references.

### Mitigation by phase

| Phase | Risk | Mitigation |
|---|---|---|
| 2.A | New primitives untested | Each component shipped with manual smoke-test before consuming |
| 2.B | Insight templates feel wrong | Start with 3 conservative templates; expand with feedback |
| 2.B | Efficiency formula opinionated | Tooltip explaining weights; formula in `efficiency.js` documented |
| 2.C | Record table breaks for users with old records | Same data shape as v1; only presentation changes |
| 2.D | Token swap misses a hard-coded color | Phase 2.E grep audit |
| 2.E | Unknown WCAG failures | Run automated check early in 2.E; fix before final ship |

---

## 10. Verification — How Each Phase Is Confirmed

For each phase, verification follows the existing protocol:

1. `npx vite build` passes
2. ZIP packaging via `_pkg.sh`
3. CHANGES.md updated with phase-specific notes
4. Acceptance criteria checklist marked
5. Present ZIP to user for inspection

For the priority Analysis page (Phase 2.B), additional verification:

- Puppeteer screenshot capture on 1366×768
- Visual diff against current screenshot to confirm changes
- Console error count (target: 0)
- WCAG AA contrast spot-check on key text

---

## 11. Out-of-Phase Work (deferred)

Items that surfaced during PRD review but are explicitly deferred:

- **Mobile responsive**: Phase 2 is desktop-first. Mobile/tablet covered by future Phase 3.
- **Dark mode**: Light mode only.
- **AI-driven insights**: Phase 2 uses deterministic templates only. LLM-driven insights are a future capability requiring API key infrastructure (see README.md Q&A on Anthropic costs from earlier rounds).
- **Calendar event injection into Focus**: Infrastructure exists from v6l; UI wiring is a follow-on.
- **Time estimation dictionary expansion**: README.md Phase 2 task; independent of design refresh.

---

## 12. Initial Approval Checklist

Before Phase 2.A begins:

- [ ] PRD §5 (visual tokens) reviewed
- [ ] PRD §4 (four-stage flow) accepted
- [ ] Phase boundaries acceptable
- [ ] Rollback strategy understood
- [ ] Round count (6 rounds) acceptable

On approval, Phase 2.A starts. Each subsequent phase begins on user "go" after previous phase ZIP is verified.
