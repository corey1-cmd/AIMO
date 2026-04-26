/* TodayOverview.jsx — 좌측 첫 카드 (Lenu §4-2)
 * 다크 카드 + ↗ TODAY OVERVIEW + 3개 큰 숫자 (총 기록 / 평균 속도 / 이번 주) */

import { T, formatMin } from '../constants';

export function TodayOverview({ stats }) {
  return (
    <section style={{
      background: T.color.bgCardDark,
      borderRadius: T.radius.xl,
      padding: '28px 24px',
      color: T.color.textOnDark,
      boxShadow: T.shadow.dark,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute',
        right: -40,
        top: -40,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(60, 180, 120, 0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontSize: T.font_.size.tiny,
        fontWeight: T.font_.weight.semibold,
        letterSpacing: T.font_.tracking.wider,
        textTransform: 'uppercase',
        color: T.color.textOnDarkMuted,
        marginBottom: 20,
        position: 'relative',
      }}>
        ↗ TODAY OVERVIEW
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
        <Row label="총 기록" value={stats.count} unit="개" />
        <Row
          label="평균 속도"
          value={stats.count ? `${stats.avgSpeed}` : '—'}
          unit={stats.count ? '%' : ''}
          accent={stats.count > 0 && stats.avgSpeed <= 100}
        />
        <Row
          label="이번 주 기록"
          value={stats.weekCount}
          unit={stats.weekMin > 0 ? `· ${formatMin(stats.weekMin)}` : ''}
        />
      </div>
    </section>
  );
}

function Row({ label, value, unit, accent = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{
        fontSize: T.font_.size.caption,
        color: T.color.textOnDarkMuted,
        fontWeight: T.font_.weight.regular,
      }}>{label}</span>
      <span style={{
        fontSize: T.font_.size.statBig,
        fontWeight: T.font_.weight.extrabold,
        lineHeight: 1,
        color: accent ? T.color.mint : T.color.textOnDark,
        fontFamily: T.font_.familyDisplay,
      }}>
        {value}
        <span style={{
          fontSize: T.font_.size.body,
          fontWeight: T.font_.weight.medium,
          marginLeft: 4,
          color: T.color.textOnDarkMuted,
        }}>{unit}</span>
      </span>
    </div>
  );
}
