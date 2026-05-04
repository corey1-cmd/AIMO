/* KpiCard.jsx — v2 primitive (Phase 2.A)
 *
 * Stage 1 (Summary) KPI card. Used as a horizontal strip 4-up on Analysis,
 * 2-up on Record. Strict craft: numeric value uses mono, label uses caption.
 *
 * Props:
 *   label    — top caption (e.g. "총 기록")
 *   value    — primary value (string or number, mono-formatted)
 *   suffix   — optional trailing unit ("h", "%", "분")
 *   sub      — optional second line (smaller, muted)
 *   accent   — optional 'good' | 'warn' | 'crit' for value color
 *   size     — 'normal' | 'large' (large for Efficiency Score)
 */

import { T2 } from '../../constants';

export function KpiCard({ label, value, suffix, sub, accent, size = 'normal' }) {
  const valueColor =
    accent === 'good' ? T2.color.statusGood
    : accent === 'warn' ? T2.color.statusWarn
    : accent === 'crit' ? T2.color.statusCrit
    : T2.color.text;

  const valueSize = size === 'large' ? 48 : 32;

  return (
    <section style={{
      background: T2.color.surfaceRaised,
      borderRadius: T2.radius.md,
      padding: `${T2.space[5]}px ${T2.space[6]}px`,
      border: `1px solid ${T2.color.border}`,
      minHeight: size === 'large' ? 132 : 108,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div style={{
        fontSize: T2.font.sizeCaption,
        fontWeight: T2.font.weightMedium,
        color: T2.color.textSecondary,
        letterSpacing: '0.02em',
        lineHeight: T2.font.lineHeight.caption,
      }}>{label}</div>
      <div style={{ marginTop: T2.space[3] }}>
        <span style={{
          fontFamily: T2.font.familyMono,
          fontSize: valueSize,
          fontWeight: T2.font.weightSemibold,
          color: valueColor,
          letterSpacing: T2.font.tracking.tightest,
          lineHeight: 1,
        }}>{value}</span>
        {suffix && (
          <span style={{
            fontFamily: T2.font.familyMono,
            fontSize: Math.round(valueSize * 0.55),
            fontWeight: T2.font.weightMedium,
            color: T2.color.textSecondary,
            marginLeft: 4,
          }}>{suffix}</span>
        )}
      </div>
      {sub && (
        <div style={{
          marginTop: T2.space[2],
          fontSize: T2.font.sizeCaption,
          color: T2.color.textMuted,
          lineHeight: T2.font.lineHeight.caption,
        }}>{sub}</div>
      )}
    </section>
  );
}
