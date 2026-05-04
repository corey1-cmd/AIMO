/* PlannedVsActualChart.jsx — v2 primitive (Phase 2.B)
 *
 * Stage 2 (Insights) left card. 7-day planned vs actual line chart.
 * Strict craft: solid lines, mono numbers, no gradients on data surface.
 *
 * Props:
 *   data — Array<{ d, est, act, estMin, actMin }> from useMemo in AnalysisPage
 */

import { useState } from 'react';
import { T2 } from '../../constants';

export function PlannedVsActualChart({ data }) {
  const [hoverIdx, setHoverIdx] = useState(-1);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <section style={{
        background: T2.color.surfaceRaised,
        borderRadius: T2.radius.md,
        padding: `${T2.space[5]}px ${T2.space[6]}px`,
        border: `1px solid ${T2.color.border}`,
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{
          margin: 0, marginBottom: T2.space[5],
          fontSize: T2.font.sizeHeading, fontWeight: T2.font.weightSemibold,
          color: T2.color.text, letterSpacing: T2.font.tracking.tight,
        }}>예상 vs 실제 시간</h3>
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T2.color.textMuted, fontSize: T2.font.sizeBody,
        }}>추이 데이터가 없습니다</div>
      </section>
    );
  }

  const W = 720, H = 240;
  const padL = 40, padR = 16, padT = 16, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data.flatMap(d => [d.est, d.act]), 1);
  const x = (i) => data.length === 1 ? padL + innerW / 2 : padL + (i / Math.max(1, data.length - 1)) * innerW;
  const y = (v) => padT + (1 - v / max) * innerH;

  function buildPath(key) {
    if (data.length < 2) return `M${x(0)} ${y(data[0][key])}`;
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(d[key])}`).join(' ');
  }
  const estPath = buildPath('est');
  const actPath = buildPath('act');

  const hover = hoverIdx >= 0 ? data[hoverIdx] : null;

  return (
    <section style={{
      background: T2.color.surfaceRaised,
      borderRadius: T2.radius.md,
      padding: `${T2.space[5]}px ${T2.space[6]}px`,
      border: `1px solid ${T2.color.border}`,
      minHeight: 280,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: T2.space[4],
      }}>
        <h3 style={{
          margin: 0,
          fontSize: T2.font.sizeHeading, fontWeight: T2.font.weightSemibold,
          color: T2.color.text, letterSpacing: T2.font.tracking.tight,
        }}>예상 vs 실제 시간</h3>
        <span style={{
          fontSize: T2.font.sizeCaption,
          color: T2.color.textMuted,
          fontFamily: T2.font.familyMono,
        }}>최근 7일</span>
      </div>

      <div style={{
        display: 'flex', gap: T2.space[5], marginBottom: T2.space[3],
        fontSize: T2.font.sizeCaption, color: T2.color.textSecondary,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: T2.space[2] }}>
          <span style={{ width: 14, height: 2, background: T2.color.primary, display: 'inline-block', borderRadius: 1 }} />
          예상
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: T2.space[2] }}>
          <span style={{ width: 14, height: 0, borderTop: `1.5px dashed ${T2.color.accent}`, display: 'inline-block' }} />
          실제
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`} width="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
        onMouseLeave={() => setHoverIdx(-1)}
      >
        {/* y축 라벨 */}
        {[0, max / 2, max].map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={T2.color.border} strokeDasharray="2 4" />
            <text
              x={padL - 6} y={y(v) + 4} textAnchor="end"
              fill={T2.color.textMuted}
              fontSize="10"
              fontFamily={T2.font.familyMono}
            >{v < 1 ? `${Math.round(v * 60)}m` : `${v.toFixed(0)}h`}</text>
          </g>
        ))}

        {/* lines */}
        <path d={estPath} fill="none" stroke={T2.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={actPath} fill="none" stroke={T2.color.accent} strokeWidth="1.6" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />

        {/* dots + invisible hit zones */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.est)} r={3.5} fill={T2.color.primary} />
            <circle cx={x(i)} cy={y(d.act)} r={3.5} fill={T2.color.surfaceRaised} stroke={T2.color.accent} strokeWidth="1.5" />
            <rect
              x={x(i) - 18} y={padT} width={36} height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: 'crosshair' }}
            />
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={x(i)} y={H - 8} textAnchor="middle"
            fill={hoverIdx === i ? T2.color.text : T2.color.textMuted}
            fontSize="10.5"
            fontFamily={T2.font.familyMono}
            fontWeight={hoverIdx === i ? T2.font.weightSemibold : T2.font.weightRegular}
          >{d.d}</text>
        ))}

        {/* hover tooltip */}
        {hover && (
          <g>
            <line
              x1={x(hoverIdx)} x2={x(hoverIdx)}
              y1={padT} y2={padT + innerH}
              stroke={T2.color.border}
            />
            <g transform={`translate(${Math.min(x(hoverIdx) + 12, W - 130)}, ${padT + 6})`}>
              <rect width="120" height="58" rx="6" fill={T2.color.text} opacity="0.96" />
              <text x="10" y="18" fill={T2.color.surface} fontSize="11" fontWeight="600">{hover.d}</text>
              <text x="10" y="34" fill={T2.color.surface} fontSize="10" opacity="0.7">예상</text>
              <text x="110" y="34" textAnchor="end" fill={T2.color.surface} fontSize="10" fontFamily={T2.font.familyMono}>{fmtH(hover.estMin)}</text>
              <text x="10" y="48" fill={T2.color.surface} fontSize="10" opacity="0.7">실제</text>
              <text x="110" y="48" textAnchor="end" fill={T2.color.surface} fontSize="10" fontFamily={T2.font.familyMono}>{fmtH(hover.actMin)}</text>
            </g>
          </g>
        )}
      </svg>
    </section>
  );
}

function fmtH(min) {
  if (!min || min < 1) return '0m';
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
