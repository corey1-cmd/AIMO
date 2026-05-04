/* Table.jsx — v2 primitive (Phase 2.A)
 *
 * Stage 4 (Detailed Data) tabular component. Strict craft (PRD §4.4):
 *   - numeric columns right-aligned
 *   - text columns left-aligned
 *   - status columns center-aligned
 *   - documented column widths via fr ratios
 *   - row hover subtle highlight
 *   - dates single-line YYYY.MM.DD
 *
 * Props:
 *   columns — Array<{
 *     key:    string,
 *     label:  string,
 *     align:  'left' | 'right' | 'center',  // default 'left'
 *     fr:     number,                        // grid fr ratio
 *     mono?:  boolean,                       // use mono font for cells
 *   }>
 *   rows    — Array of objects keyed by column.key, plus optional `__id`, `__onClick`
 *   empty   — node to render when rows.length === 0
 */

import { T2 } from '../../constants';

export function Table({ columns, rows, empty }) {
  if (!Array.isArray(columns) || columns.length === 0) return null;

  const gridTemplate = columns.map(c => `${c.fr || 1}fr`).join(' ');

  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <section style={{
        background: T2.color.surfaceRaised,
        borderRadius: T2.radius.md,
        border: `1px solid ${T2.color.border}`,
        padding: `${T2.space[10]}px ${T2.space[6]}px`,
        textAlign: 'center',
      }}>
        {empty || (
          <div style={{ fontSize: T2.font.sizeBody, color: T2.color.textMuted }}>
            데이터가 없습니다
          </div>
        )}
      </section>
    );
  }

  return (
    <section style={{
      background: T2.color.surfaceRaised,
      borderRadius: T2.radius.md,
      border: `1px solid ${T2.color.border}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        role="row"
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          gap: T2.space[4],
          padding: `${T2.space[3]}px ${T2.space[6]}px`,
          background: T2.color.surfaceSoft,
          borderBottom: `1px solid ${T2.color.border}`,
        }}
      >
        {columns.map(col => (
          <div
            key={col.key}
            role="columnheader"
            style={{
              fontSize: T2.font.sizeCaption,
              fontWeight: T2.font.weightSemibold,
              color: T2.color.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textAlign: col.align || 'left',
            }}
          >{col.label}</div>
        ))}
      </div>

      {/* Body */}
      <div role="rowgroup">
        {rows.map((row, i) => (
          <Row
            key={row.__id || i}
            row={row}
            columns={columns}
            gridTemplate={gridTemplate}
            isLast={i === rows.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function Row({ row, columns, gridTemplate, isLast }) {
  const onClick = row.__onClick;
  return (
    <div
      role="row"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: T2.space[4],
        padding: `${T2.space[4]}px ${T2.space[6]}px`,
        borderBottom: isLast ? 'none' : `1px solid ${T2.color.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 120ms ease',
        alignItems: 'center',
      }}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.background = T2.color.surfaceSoft; } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.background = 'transparent'; } : undefined}
    >
      {columns.map(col => {
        const cell = row[col.key];
        return (
          <div
            key={col.key}
            role="cell"
            style={{
              fontFamily: col.mono ? T2.font.familyMono : 'inherit',
              fontSize: T2.font.sizeBody,
              color: T2.color.text,
              textAlign: col.align || 'left',
              fontVariantNumeric: col.mono ? 'tabular-nums' : 'normal',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >{cell == null ? '—' : cell}</div>
        );
      })}
    </div>
  );
}

/* Helpers — strict-craft formatters used by tables */

/** YYYY.MM.DD single-line. */
export function fmtDate(d) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return '—';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** Multiplier mode: 1.33× / 0.75× */
export function fmtMultiplier(y) {
  if (y == null || !isFinite(y) || y <= 0) return '—';
  return `${(y / 100).toFixed(2)}×`;
}

/** Relative mode: +33% / −25% */
export function fmtRelative(y) {
  if (y == null || !isFinite(y) || y <= 0) return '—';
  const delta = y - 100;
  if (Math.abs(delta) < 0.5) return '±0%';
  const sign = delta > 0 ? '+' : '−';
  return `${sign}${Math.abs(delta).toFixed(0)}%`;
}

/** Duration: Xh Ym (skip 0 hours) */
export function fmtDuration(min) {
  if (!min || !isFinite(min) || min < 1) return '0m';
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
