/* FocusInline.jsx — 우측 focus 모드 콘텐츠 (Atelier Cyan v6b)
 * 라이트 글래스 카드 + 진행률 + 이어서 하기 / 새로 시작
 * Props: plan, onResume, onClose */

import { T2, T, formatMin } from '../constants';

export function FocusInline({ plan, onResume, onClose }) {
  if (!plan || !plan.items || plan.items.length === 0) return null;

  const total = plan.items.length;
  const done = plan.items.filter(i => i.status === 'done').length;
  const current = plan.items[plan.curIdx];
  const ratio = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{
            margin: 0,
            fontFamily: T2.font.familyDisplay,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: T2.font.tracking.tightest,
            lineHeight: 1.1,
            color: T2.color.text,
          }}>FOCUS</h1>
          <span aria-hidden style={{
            display: 'inline-block',
            width: 8, height: 8,
            borderRadius: '50%',
            background: T2.color.accent,
            boxShadow: `0 0 10px ${T2.color.accent}`,
            animation: 'cyanPulse 2.4s ease-in-out infinite',
            marginBottom: 14,
          }} />
        </div>
        <span style={{
          fontSize: 14,
          color: T2.color.textSecondary,
          fontWeight: T2.font.weightMedium,
          letterSpacing: T2.font.tracking.tight,
        }}>진행 중인 세션</span>
      </header>

      <div style={{
        background: T2.color.surfaceRaised,
        backdropFilter: '20px',
        WebkitBackdropFilter: '20px',
        borderRadius: 24,
        padding: '30px 28px',
        boxShadow: '0 8px 28px rgba(28, 26, 24, 0.08)',
        border: `1px solid ${T2.color.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 코너 ambient orb */}
        <div aria-hidden style={{
          position: 'absolute',
          right: -60,
          top: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 224, 168, 0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', position: 'relative' }}>
          <span style={{
            fontSize: 11,
            fontWeight: T2.font.weightSemibold,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: T2.color.textMuted,
            fontFamily: T2.font.familyMono,
          }}>진행률</span>
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: T2.color.primary,
            fontFamily: T2.font.familyMono,
            letterSpacing: T2.font.tracking.tightest,
          }}>{done} / {total}</span>
        </div>

        <div style={{
          height: 8,
          background: 'rgba(0, 82, 45, 0.06)',
          borderRadius: 9999,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: `${ratio}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${T2.color.primary} 0%, ${T2.color.accent} 100%)`,
            transition: 'width 400ms ease',
            boxShadow: `0 0 8px rgba(79, 224, 168, 0.32)`,
          }} />
        </div>

        {current && (
          <div style={{
            background: 'rgba(232, 244, 237, 0.55)',
            border: `1px solid ${T2.color.border}`,
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            position: 'relative',
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: T2.font.weightSemibold,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: T2.color.primary,
              fontFamily: T2.font.familyMono,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span aria-hidden style={{
                display: 'inline-block',
                width: 5, height: 5,
                borderRadius: '50%',
                background: T2.color.accent,
                boxShadow: `0 0 5px ${T2.color.accent}`,
              }} />
              지금 진행 중
            </span>
            <span style={{
              fontSize: 14,
              fontWeight: T2.font.weightSemibold,
              color: T2.color.text,
              letterSpacing: T2.font.tracking.tight,
            }}>{current.title}</span>
            {current.estimatedMin && (
              <span style={{
                fontSize: 12,
                color: T2.color.textMuted,
                fontFamily: T2.font.familyMono,
              }}>예상 {formatMin(current.estimatedMin)}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative' }}>
          <button
            onClick={onResume}
            style={{
              flex: 1,
              padding: '14px 22px',
              fontSize: 14,
              fontWeight: T2.font.weightSemibold,
              fontFamily: 'inherit',
              background: T2.color.primary,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              cursor: 'pointer',
              boxShadow: `0 6px 20px rgba(0, 82, 45, 0.22)`,
              transition: 'background 200ms ease, transform 200ms ease, box-shadow 200ms ease',
              letterSpacing: T2.font.tracking.tight,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1F1612';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 10px 28px rgba(0, 82, 45, 0.30)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T2.color.primary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 6px 20px rgba(0, 82, 45, 0.22)`;
            }}
          >이어서 하기 →</button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '14px 22px',
                fontSize: 14,
                fontWeight: T2.font.weightMedium,
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.55)',
                color: T2.color.textSecondary,
                border: `1px solid ${'rgba(47, 36, 30, 0.14)'}`,
                borderRadius: 9999,
                cursor: 'pointer',
                transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T2.color.surfaceSoft;
                e.currentTarget.style.color = T2.color.primary;
                e.currentTarget.style.borderColor = 'rgba(0, 82, 45, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)';
                e.currentTarget.style.color = T2.color.textSecondary;
                e.currentTarget.style.borderColor = 'rgba(47, 36, 30, 0.14)';
              }}
            >새로 시작</button>
          )}
        </div>
      </div>
    </section>
  );
}
