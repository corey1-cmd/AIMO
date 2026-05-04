/* EfficiencyScore.jsx — v2 primitive (Phase 2.A)
 *
 * Composite score 0-100 with color band. Used as a large KPI on Analysis Stage 1.
 * Tooltip explains the formula (PRD §4.1.1).
 *
 * Props:
 *   result — output of computeEfficiencyScore() — { score, band, breakdown } | null
 */

import { useState } from 'react';
import { T2 } from '../../constants';

export function EfficiencyScore({ result }) {
  const [tipOpen, setTipOpen] = useState(false);

  if (!result) {
    return (
      <section style={{
        background: T2.color.surfaceRaised,
        borderRadius: T2.radius.md,
        padding: `${T2.space[5]}px ${T2.space[6]}px`,
        border: `1px solid ${T2.color.border}`,
        minHeight: 132,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: T2.font.sizeCaption,
          fontWeight: T2.font.weightMedium,
          color: T2.color.textSecondary,
        }}>효율 점수</div>
        <div style={{
          fontFamily: T2.font.familyMono,
          fontSize: 48,
          color: T2.color.textMuted,
          fontWeight: T2.font.weightSemibold,
          letterSpacing: T2.font.tracking.tightest,
        }}>—</div>
        <div style={{ fontSize: T2.font.sizeCaption, color: T2.color.textMuted }}>
          데이터 누적 후 표시
        </div>
      </section>
    );
  }

  const { score, band, breakdown } = result;
  const valueColor =
      band === 'good' ? T2.color.statusGood
    : band === 'warn' ? T2.color.statusWarn
    : T2.color.text;
  const bandLabel =
      band === 'good' ? '양호'
    : band === 'warn' ? '주의'
    : '보통';

  return (
    <section
      style={{
        background: T2.color.surfaceRaised,
        borderRadius: T2.radius.md,
        padding: `${T2.space[5]}px ${T2.space[6]}px`,
        border: `1px solid ${T2.color.border}`,
        minHeight: 132,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: T2.font.sizeCaption,
          fontWeight: T2.font.weightMedium,
          color: T2.color.textSecondary,
        }}>효율 점수</span>
        <button
          onMouseEnter={() => setTipOpen(true)}
          onMouseLeave={() => setTipOpen(false)}
          onFocus={() => setTipOpen(true)}
          onBlur={() => setTipOpen(false)}
          aria-label="효율 점수 산식 안내"
          style={{
            width: 18, height: 18,
            borderRadius: '50%',
            background: T2.color.surfaceSoft,
            border: 'none',
            color: T2.color.textSecondary,
            fontSize: 11,
            fontWeight: T2.font.weightSemibold,
            cursor: 'help',
            fontFamily: 'inherit',
            lineHeight: 1,
            padding: 0,
          }}
        >?</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: T2.space[3] }}>
        <span style={{
          fontFamily: T2.font.familyMono,
          fontSize: 48,
          fontWeight: T2.font.weightSemibold,
          color: valueColor,
          letterSpacing: T2.font.tracking.tightest,
          lineHeight: 1,
        }}>{score}</span>
        <span style={{
          fontFamily: T2.font.familyMono,
          fontSize: 14,
          color: T2.color.textMuted,
          fontWeight: T2.font.weightMedium,
        }}>/ 100</span>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: T2.space[2],
        fontSize: T2.font.sizeCaption,
        color: valueColor,
        fontWeight: T2.font.weightMedium,
      }}>
        <span aria-hidden style={{
          width: 6, height: 6, borderRadius: '50%', background: valueColor,
        }} />
        <span>{bandLabel}</span>
      </div>

      {tipOpen && (
        <div role="tooltip" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: 260,
          padding: `${T2.space[3]}px ${T2.space[4]}px`,
          background: T2.color.text,
          color: T2.color.surface,
          borderRadius: T2.radius.sm,
          fontSize: T2.font.sizeCaption,
          lineHeight: T2.font.lineHeight.body,
          boxShadow: T2.shadow.md,
          zIndex: 10,
        }}>
          <div style={{ fontWeight: T2.font.weightSemibold, marginBottom: 6 }}>산식</div>
          <div style={{ fontFamily: T2.font.familyMono, fontSize: 11, opacity: 0.9, marginBottom: 8 }}>
            속도 40% + 일관성 30% +<br/>
            완료율 20% + 최근성 10%
          </div>
          {breakdown && (
            <div style={{ fontFamily: T2.font.familyMono, fontSize: 11, opacity: 0.85 }}>
              속도 {Math.round(breakdown.speed * 100)} ·
              일관성 {Math.round(breakdown.consistency * 100)} ·<br/>
              완료 {Math.round(breakdown.completion * 100)} ·
              최근 {Math.round(breakdown.recency * 100)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
