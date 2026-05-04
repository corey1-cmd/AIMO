/* FilterBar.jsx — v2 primitive (Phase 2.A)
 *
 * Stage 3 (Exploration) component. Three explicit filter axes (PRD §4.3).
 * Each axis has a label + mutually-exclusive options. No ambiguous "All" duplicates.
 *
 * Props:
 *   axes — Array<{
 *     id:       string,           // 'taskType' | 'dateRange' | 'sort' | ...
 *     label:    string,           // visible axis label
 *     options:  Array<{value, label}>,  // mutually exclusive
 *     value:    current selection,
 *     onChange: (value) => void,
 *   }>
 */

import { T2 } from '../../constants';

export function FilterBar({ axes }) {
  if (!Array.isArray(axes) || axes.length === 0) return null;

  return (
    <section style={{
      display: 'flex',
      gap: T2.space[6],
      flexWrap: 'wrap',
      padding: `${T2.space[4]}px ${T2.space[5]}px`,
      background: T2.color.surfaceRaised,
      borderRadius: T2.radius.md,
      border: `1px solid ${T2.color.border}`,
      alignItems: 'center',
    }}>
      {axes.map((axis, i) => (
        <FilterAxis key={axis.id} axis={axis} showDivider={i < axes.length - 1} />
      ))}
    </section>
  );
}

function FilterAxis({ axis, showDivider }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: T2.space[3] }}>
      <span style={{
        fontSize: T2.font.sizeCaption,
        fontWeight: T2.font.weightMedium,
        color: T2.color.textSecondary,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>{axis.label}</span>

      <div style={{ display: 'flex', gap: T2.space[1], flexWrap: 'wrap' }}>
        {axis.options.map(opt => {
          const active = opt.value === axis.value;
          return (
            <button
              key={opt.value}
              onClick={() => axis.onChange(opt.value)}
              aria-pressed={active}
              style={{
                padding: `${T2.space[1]}px ${T2.space[3]}px`,
                fontSize: T2.font.sizeCaption,
                fontWeight: active ? T2.font.weightSemibold : T2.font.weightMedium,
                fontFamily: 'inherit',
                color: active ? T2.color.surface : T2.color.textSecondary,
                background: active ? T2.color.primary : 'transparent',
                border: `1px solid ${active ? T2.color.primary : T2.color.border}`,
                borderRadius: T2.radius.pill,
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >{opt.label}</button>
          );
        })}
      </div>

      {showDivider && (
        <span aria-hidden style={{
          width: 1,
          height: 24,
          background: T2.color.border,
          marginLeft: T2.space[3],
        }} />
      )}
    </div>
  );
}
