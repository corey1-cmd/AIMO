# AIMO Design Refresh — Product Requirements Document

> **Document Type**: Product Requirements Document (PRD)
> **Scope**: Phase 2 — Visual & Information Architecture redesign
> **Status**: Awaiting approval — implementation pending sign-off
> **Last updated**: v6m

---

## 1. Background

The current AIMO interface (v6a–v6m) was developed iteratively to add functionality. While the feature surface is complete, an accessibility / craft audit identified six structural design problems that prevent the product from being perceived as production-ready or trustworthy. This document defines the requirements for a design refresh that addresses those problems while preserving all functional capabilities delivered through v6m.

**Critical insight**: the existing UI treats the product as a *recording* tool. Users do not need a recording tool — they need a tool that interprets their performance and helps them make decisions. The design refresh therefore reframes the product as an **analytical interface**, not a logbook.

---

## 2. Design Objectives & Evaluation Criteria

The redesign will be evaluated against eight objectives. Every design decision must justify itself against this rubric.

| Code | Objective | Definition |
|---|---|---|
| O1 | Visual Comfort | Easy on the eyes; reduces visual fatigue during prolonged use. |
| O2 | Color Neutrality | Approachable, widely acceptable palette; no jarring saturation. |
| O3 | Trustworthiness | Establishes reliability through predictable, consistent treatment. |
| O4 | Premium Quality | High-end, restrained finish; nothing that reads as templated. |
| O5 | Future-oriented | Forward-thinking aesthetic without being trend-chasing. |
| O6 | Technical Credibility | Evokes confidence through professional, precise execution. |
| O7 | Sophisticated | Refined details; deliberate spacing, typography, micro-interactions. |
| O8 | Classic | Timeless principles; design that does not date in 18 months. |

**Rubric tension**: O5 (Future-oriented) and O8 (Classic) appear contradictory but are reconciled by treating "future" as conceptual (data interpretation, AI-driven insights) and "classic" as visual (proportion, typography, restraint).

---

## 3. Audit Findings — Problems Being Solved

The redesign explicitly resolves the following audit findings.

### 3.1 Triple-Muffle Effect (Critical, –20–30% accessibility penalty)
Noise/gradient backgrounds + semi-transparent cards + light gray text combine to suppress contrast. The result is design elements actively obstructing data.

**Resolution requirement**: WCAG AA compliance for all text-on-background combinations. Replace decorative backgrounds with solid surfaces. Body text minimum contrast ratio 4.5:1; large text 3:1.

### 3.2 Failure in Information Hierarchy
Decorative wave + large display title currently dominate the top viewport, pushing primary task data below the fold on standard laptop screens. The current layout follows landing-page logic where dashboard logic should apply.

**Resolution requirement**: KPI primary metrics must be visible within the first viewport (1366×768 baseline). Decorative elements limited to ≤8% of vertical space above the fold.

### 3.3 Poor Table Craftsmanship
Numbers are not right-aligned. Date strings break across two lines. Column widths are visually inconsistent. Filter pills do not visually clarify exclusivity.

**Resolution requirement**: Tabular data must follow strict alignment (numbers right, text left, status center). Single-line dates with deterministic formatting. Grid-based column system with documented widths.

### 3.4 Weak Interaction Affordance
The "Save" pill on Record cards is ambiguous (status badge or interactive control?). The triple-dot menu (`⋯`) lacks affordance cues. Filter pills don't visually separate active vs. inactive states clearly enough on first glance.

**Resolution requirement**: Every interactive element must have a visible hover state, an unambiguous resting state, and (where applicable) a discoverable shape (pill = toggle, button = action, link = navigation).

### 3.5 Excessive Decorative Clutter
Wave SVG, mint particles, gradient fills, and box shadows compound on functional surfaces. In an analytical UI these are signal-noise.

**Resolution requirement**: Decorative elements removed from data surfaces (Record table, Analysis charts). Allowed only on landing/empty states and as system-level navigation accents.

### 3.6 Ambiguous Information Architecture
Filter categories ("All / Move / Organize / …") are neither mutually exclusive nor clearly defined as actions / data types / status. Users must guess.

**Resolution requirement**: Filters explicitly labeled by axis: Task Type, Date Range, Status. Mutually exclusive within an axis. Multi-axis filters visually grouped.

### 3.7 Lack of Typographic Hierarchy
Insufficient size/weight/color differentiation between Title, Body, Metadata.

**Resolution requirement**: Three-level type system (Display / Body / Caption) with deterministic ratios. Applied consistently across pages.

### 3.8 Inconsistent Spacing
Padding within table cells and margins across layouts vary by component, not by system.

**Resolution requirement**: 4px base unit grid. All spacing must be a multiple of 4. Documented in design tokens.

### 3.9 Absence of Visual Flow Design
No deliberate F-pattern or Z-pattern guidance. Users' eyes do not have a designed entry point.

**Resolution requirement**: Each page must have a deliberate primary scan path documented. Top-left = identifier, top-right = state/action, body = primary data.

---

## 4. Solution Concept — Four-Stage Flow

The redesign restructures every data-heavy page (initially Analysis, then Record) into a four-stage cognitive flow.

```
[Stage 1] Summary       → Immediate state recognition. KPI + Efficiency Score.
[Stage 2] Insights      → Data viz + auto-generated NLP statements.
[Stage 3] Exploration   → Filters, controls, sorting.
[Stage 4] Detailed Data → The table itself. Precision comparison.
```

Users entering the page should grasp performance at a glance from Stage 1. Stage 2 answers "why" without manual analysis. Stage 3 lets them narrow scope. Stage 4 supports validation. The flow is unidirectional — Stage 1 never depends on Stage 4.

### 4.1 Stage 1 — Summary (KPI Section)

**Required metrics** (Analysis page):

| Metric | Format | Source |
|---|---|---|
| Total Tasks | integer | records.length |
| Avg Completion Time | duration (Xh Ym) | mean(totalActualMin) |
| Avg Speed | y% (역수 모델) | mean of getSpeedY across records |
| Efficiency Score | composite 0–100 | see §4.1.1 |

#### 4.1.1 Efficiency Score (composite)

Single actionable indicator combining multiple dimensions. Formula:

```
EfficiencyScore = round(
    0.40 × normalize(speedY)         // 100 → 50pt, 200 → 100pt, 50 → 0pt
  + 0.30 × consistency(stddev)       // lower stddev → higher pt
  + 0.20 × completionRate            // % of plans completed without cancel
  + 0.10 × recencyBonus              // last 7d activity → up to 10pt
, 0)
```

Score colored: 80+ primary green, 60–79 neutral, <60 amber.
Composite — not a raw percentage — to prevent users from reading any single dimension as the truth.

### 4.2 Stage 2 — Insights (Chart + NLP)

A comparative chart (planned vs actual time, 7-day window) sits next to **auto-generated insight statements** in natural Korean/English. Examples of generated statements:

- "지난 7일 동안 평균보다 12% 빠르게 진행하고 계세요."
- "오후 2–5시 사이 작업이 가장 효율적이었어요."
- "이메일 작업은 계속 예상보다 35% 더 걸리고 있어요."

**Generation rules** (deterministic, no LLM dependency):
- Templates triggered by threshold rules.
- 최대 3개의 statement per page, ordered by signal strength.
- Each statement includes the data range it draws from.
- If insufficient data (n<5 records), display "데이터가 더 쌓이면 인사이트를 보여드릴게요."

### 4.3 Stage 3 — Exploration (Filters)

Three explicit filter axes:

| Axis | Type | Options |
|---|---|---|
| Task Type | single-select | All / Move / Communicate / Organize / Create / Design / Other |
| Date Range | preset+custom | Today / 7d / 30d / 90d / Custom |
| Sort | single-select | Latest / Oldest / Fastest / Slowest |

Filters must be visually grouped by axis. Mutually exclusive selections within an axis. No ambiguous "All" option duplicated across axes.

### 4.4 Stage 4 — Detailed Data (Table)

Strict craft requirements:

- All numeric columns right-aligned.
- All text columns left-aligned.
- Status columns center-aligned.
- Date format: `YYYY.MM.DD` single line, no breaks.
- Column widths defined as fr ratios in a CSS grid; documented.
- Speed reformulated from "133%" raw values to interpretable formats:
  - **Multiplier mode** (default): "1.33×" — instantly readable as "33% faster than expected".
  - **Relative mode** (toggle): "+33%" / "−25%" against baseline.
- Status indicators use semantic colors: green=on-pace, amber=behind, neutral=draft.
- Row hover provides subtle highlight; click navigates to detail.

---

## 5. Visual System

### 5.1 Color Palette (Sepia Neutral, Low Fatigue Contrast)

| Role | Token | Value | Usage |
|---|---|---|---|
| Primary | `primary` | `#2F241E` (deep sepia brown) | CTA, headlines, brand |
| Accent | `accent` | `#8C6F5A` (muted warm brown) | subtle highlights, focus |
| Surface (default) | `surface` | `#F4F1EC` (warm paper) | page background |
| Surface (raised) | `surface-raised` | `#FFFFFF` | cards, tables |
| Surface (soft contrast) | `surface-soft` | `#EAE5DF` | section separation (no borders needed) |
| Text Primary | `text` | `#1C1A18` | body, headings |
| Text Secondary | `text-secondary` | `#5A524C` | descriptions |
| Text Muted | `text-muted` | `#9A918A` | captions, hints |
| Border | `border` | `#E2DDD7` | minimal dividers |
| Status — Good | `status-good` | `#6E8B74` (desaturated olive) | on-pace, success |
| Status — Warn | `status-warn` | `#A67C52` (soft amber brown) | behind, caution |
| Status — Critical | `status-crit` | `#8A4A4A` (muted red-brown) | overdue, error |

**Removed**: electric mint accents, large gradients, mint particle decorations, all green-family tokens from v1.
**Reasoning**: Visual Comfort (O1) — sepia tones reduce blue-light fatigue. Color Neutrality (O2) — warm browns are widely acceptable across cultures. Classic (O8) — paper-like palette references print and longform reading traditions. Surface (soft contrast) `#EAE5DF` enables section separation without using borders, supporting Sophisticated (O7).

### 5.2 Typography

Three sizes, three weights. No more.

| Role | Size | Weight | Use |
|---|---|---|---|
| Display | 32px / 1.1 | 600 | Page H1 |
| Heading | 18px / 1.3 | 600 | Section H2 |
| Body | 14px / 1.5 | 400 | Default |
| Caption | 12px / 1.4 | 500 | Meta, labels |
| Mono | 13px / 1.4 | 500 | Numbers, durations |

Display font: existing Plus Jakarta Sans (kept — neutral, classic).
Mono font: JetBrains Mono (kept).

### 5.3 Spacing — 4px base grid

Allowed spacing values: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80.
Cards: padding 24px. Page padding: 32px (mobile) / 56px (desktop).
Section spacing: 32px between major blocks.

### 5.4 Decoration Policy

- **Permitted on**: Empty states, landing page, login, settings hero.
- **Forbidden on**: Data tables, charts, KPI cards, filter rows.
- DecorativeWave SVG removed from Record / Analysis pages.
- Box gradient backgrounds replaced with solid `surface-raised`.

---

## 6. Page-by-Page Requirements

### 6.1 Analysis Page (priority: highest)

- Stage 1 (Summary): KPI strip across the top — 4 cards in a row, 1366px+ — Total Tasks / Avg Time / Avg Speed / Efficiency Score.
- Stage 2 (Insights): two-column block — line chart left (planned vs actual, 7-day), insights right (3 NLP statements max).
- Stage 3 (Exploration): horizontal filter bar — 3 axes labeled.
- Stage 4 (Detailed Data): replaces the current donut + radial — a single sortable table.

### 6.2 Record Page

- Stage 1 lite: 2 KPI cards (Total saved / Saved this week).
- Stage 3 + 4: filter bar + table.
- Stage 2 omitted (Record is not insight-driven).

### 6.3 Focus Page

- Substantially preserved from v6m — already insight-forward.
- Updated to new color tokens, removed electric mint, retain timer / next-up / progress.

### 6.4 Main Page

- Substantially preserved.
- Updated tokens.
- New sidebar (Goal / Calendar / Active Sessions) preserved as built in Phase 1.

### 6.5 Settings Page

- Preserved layout.
- New tokens.
- Auto-verify flow built in Phase 1 retained.

### 6.6 Library, Learning Pages

- Token updates only.

---

## 7. Acceptance Criteria

The redesign is complete when:

1. **Contrast**: All text passes WCAG AA at standard zoom. Verified via automated check.
2. **Above-fold KPI**: On 1366×768, Analysis page shows all four KPI cards within the top 50% of viewport.
3. **Table craft**: Number columns right-aligned. No date line breaks. Documented column ratios.
4. **Decoration audit**: DecorativeWave appears only on empty/landing/settings states. Zero gradients on data surfaces.
5. **Filter clarity**: Three axes, axis labels visible. No duplicate "All" pills.
6. **Color migration**: Zero references to electric mint (`#4FE0A8`) on data surfaces. Removed from token export.
7. **Typography**: Three sizes (display/heading/body) and one mono — used systematically.
8. **Insight statements**: Analysis page renders 1–3 generated statements based on data; renders empty-state copy below threshold.
9. **Efficiency Score**: Renders as single value 0–100 with color band.
10. **Regression**: All Phase 1 functionality (Goal memo, Calendar panel, multi-session, Focus dashboard, settings auto-verify) operates unchanged.

---

## 8. Out of Scope (this round)

- AI-generated insight statements (using LLM). The Phase 2 design uses **deterministic templated** statements only.
- Maps / Calendar advanced integrations (refineTravelTimes UI, exportPlanToCalendar UI). Infrastructure exists; UI integration deferred.
- Mobile / tablet specific layouts. Desktop 1366+ is the baseline.
- Dark mode toggle. Single (light) mode only.
- Internationalization beyond Korean + English. (Both supported, no other languages.)

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Tone tokens (deeper green) reduce vibrance, may feel "less alive" | Justify against O2 (Color Neutrality) + O8 (Classic). Rebalance accent only after user feedback. |
| Insight statement templates feel generic | Iterate on triggers. Start small (3 templates), expand based on usage. |
| Efficiency Score weighting is opinionated | Document formula transparently. Provide tooltip explaining. |
| Some users prefer visual decoration | Decoration is preserved on empty states and landing — not removed entirely, just relocated. |

---

## 10. Approval

Sign-off required before implementation begins:

- [ ] Visual system (§5) tokens approved
- [ ] Four-stage flow (§4) accepted as page structure
- [ ] Efficiency Score formula (§4.1.1) approved or revised
- [ ] Insight statement templates approved (initial set TBD)
- [ ] Acceptance criteria (§7) understood

Upon sign-off, see **Build Process Plan** document for implementation sequencing.
