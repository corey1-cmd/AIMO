/* FocusInline.jsx — 우측 focus 모드 콘텐츠 (Lenu §4-11)
 * 진행 중 세션 + 진행률 + 이어서 하기 / 새로 시작
 * Props: plan, onResume, onClose */

import { T, formatMin } from '../constants';

export function FocusInline({ plan, onResume, onClose }) {
  if (!plan || !plan.items || plan.items.length === 0) return null;

  const total = plan.items.length;
  const done = plan.items.filter(i => i.status === 'done').length;
  const current = plan.items[plan.curIdx];
  const ratio = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{
          margin: 0,
          fontFamily: T.font_.familyDisplay,
          fontSize: T.font_.size.display,
          fontWeight: T.font_.weight.extrabold,
          letterSpacing: T.font_.tracking.tight,
          lineHeight: T.font_.leading.tight,
          color: T.color.textPrimary,
        }}>FOCUS</h1>
        <span style={{
          fontSize: T.font_.size.body,
          color: T.color.textSecondary,
          fontWeight: T.font_.weight.medium,
        }}>진행 중인 세션</span>
      </header>

      <div style={{
        background: T.color.bgCard,
        borderRadius: T.radius.xl,
        padding: '28px 24px',
        boxShadow: T.shadow.ambient,
        border: `1px solid ${T.color.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{
            fontSize: T.font_.size.tiny,
            fontWeight: T.font_.weight.semibold,
            letterSpacing: T.font_.tracking.wider,
            textTransform: 'uppercase',
            color: T.color.textMuted,
          }}>진행률</span>
          <span style={{
            fontSize: T.font_.size.statBig,
            fontWeight: T.font_.weight.extrabold,
            color: T.color.primary,
            fontFamily: T.font_.familyDisplay,
          }}>{done} / {total}</span>
        </div>

        <div style={{
          height: 8,
          background: T.color.mintSoft,
          borderRadius: T.radius.pill,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${ratio}%`,
            height: '100%',
            background: T.color.primary,
            transition: 'width 400ms ease',
          }} />
        </div>

        {current && (
          <div style={{
            background: T.color.mintSoft,
            borderRadius: T.radius.md,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <span style={{
              fontSize: T.font_.size.tiny,
              fontWeight: T.font_.weight.semibold,
              letterSpacing: T.font_.tracking.wider,
              textTransform: 'uppercase',
              color: T.color.primary,
            }}>지금 진행 중</span>
            <span style={{
              fontSize: T.font_.size.body,
              fontWeight: T.font_.weight.semibold,
              color: T.color.textPrimary,
            }}>{current.title}</span>
            {current.estimatedMin && (
              <span style={{
                fontSize: 12,
                color: T.color.textMuted,
                fontFamily: 'ui-monospace, monospace',
              }}>예상 {formatMin(current.estimatedMin)}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onResume}
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: T.font_.size.body,
              fontWeight: T.font_.weight.semibold,
              fontFamily: 'inherit',
              background: T.color.primary,
              color: 'white',
              border: 'none',
              borderRadius: T.radius.pill,
              cursor: 'pointer',
              boxShadow: T.shadow.cta,
              transition: 'background 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.color.primaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.color.primary; }}
          >이어서 하기 →</button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '14px 20px',
                fontSize: T.font_.size.body,
                fontWeight: T.font_.weight.medium,
                fontFamily: 'inherit',
                background: 'transparent',
                color: T.color.textSecondary,
                border: `1px solid ${T.color.borderStrong}`,
                borderRadius: T.radius.pill,
                cursor: 'pointer',
                transition: 'background 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.color.mintSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >새로 시작</button>
          )}
        </div>
      </div>
    </section>
  );
}
