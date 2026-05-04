/* InsightStatement.jsx — v2 primitive (Phase 2.A)
 *
 * Renders auto-generated NLP insight statements (PRD §4.2).
 * Stage 2 (Insights) right column on Analysis page.
 *
 * Severity → marker color + accent:
 *   positive  → statusGood
 *   neutral   → textSecondary
 *   attention → statusWarn
 */

import { T2 } from '../../constants';

export function InsightStatement({ statements }) {
  if (!Array.isArray(statements) || statements.length === 0) {
    return (
      <section style={{
        background: T2.color.surfaceRaised,
        borderRadius: T2.radius.md,
        padding: `${T2.space[5]}px ${T2.space[6]}px`,
        border: `1px solid ${T2.color.border}`,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: T2.font.sizeBody,
          color: T2.color.textMuted,
          lineHeight: T2.font.lineHeight.body,
        }}>
          데이터가 더 쌓이면 인사이트를 보여드릴게요.
        </div>
        <div style={{
          marginTop: T2.space[2],
          fontSize: T2.font.sizeCaption,
          color: T2.color.textMuted,
          opacity: 0.7,
        }}>
          최소 5개 기록 필요
        </div>
      </section>
    );
  }

  return (
    <section style={{
      background: T2.color.surfaceRaised,
      borderRadius: T2.radius.md,
      padding: `${T2.space[5]}px ${T2.space[6]}px`,
      border: `1px solid ${T2.color.border}`,
      minHeight: 200,
    }}>
      <h3 style={{
        margin: 0,
        marginBottom: T2.space[4],
        fontSize: T2.font.sizeHeading,
        fontWeight: T2.font.weightSemibold,
        color: T2.color.text,
        letterSpacing: T2.font.tracking.tight,
      }}>인사이트</h3>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: T2.space[3],
      }}>
        {statements.map(s => (
          <InsightItem key={s.id} statement={s} />
        ))}
      </ul>
    </section>
  );
}

function InsightItem({ statement }) {
  const markerColor =
      statement.severity === 'positive' ? T2.color.statusGood
    : statement.severity === 'attention' ? T2.color.statusWarn
    : T2.color.textSecondary;

  return (
    <li style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: T2.space[3],
      padding: `${T2.space[3]}px ${T2.space[4]}px`,
      background: T2.color.surfaceSoft,
      borderRadius: T2.radius.sm,
    }}>
      <span aria-hidden style={{
        width: 6, height: 6,
        marginTop: 7,
        borderRadius: '50%',
        background: markerColor,
        flexShrink: 0,
      }} />
      <span style={{
        flex: 1,
        fontSize: T2.font.sizeBody,
        color: T2.color.text,
        lineHeight: T2.font.lineHeight.body,
      }}>{statement.text}</span>
    </li>
  );
}
