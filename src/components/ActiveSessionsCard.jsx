/* ActiveSessionsCard.jsx — 좌측 사이드바: 진행 중인 세션 목록 (Atelier Cyan v6i)
 *
 * Props:
 *   sessions: activePlans 배열 (id, label, items, curIdx, ...)
 *   activeId: 현재 보고 있는 세션 id
 *   onSelect(sessionId) — 클릭 시 해당 세션의 포커스 모드로 진입
 */

import { T2, T, formatMin } from '../constants';

export function ActiveSessionsCard({ sessions = [], activeId, onSelect }) {
  return (
    <section style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: T2.font.weightSemibold,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.62)',
          fontFamily: T2.font.familyMono,
        }}>진행 중</span>
        {sessions.length > 0 && (
          <span style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.42)',
            fontFamily: T2.font.familyMono,
            letterSpacing: '0.04em',
          }}>{sessions.length}개</span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div style={{
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.42)',
          padding: '10px 4px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>진행 중인 세션 없음<br/><span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.32)' }}>분석 후 포커스 모드 시작</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sessions.map(s => {
            const total = s.items?.length || 0;
            const cur = (s.curIdx ?? 0);
            const done = s.items ? s.items.filter(i => i.status === 'done').length : 0;
            const progressPct = total > 0 ? (done / total) * 100 : 0;
            const remaining = s.items ? s.items.slice(cur).filter(i => !i.isMarker).reduce((sm, i) => sm + (i.estimatedMin || 0), 0) : 0;
            const isActive = s.id === activeId;
            const currentStep = s.items?.[cur];
            const stepTitle = (() => {
              if (!currentStep?.title) return '';
              const idx = currentStep.title.indexOf(' — ');
              return idx > 0 ? currentStep.title.slice(idx + 3) : currentStep.title;
            })();

            return (
              <button
                key={s.id}
                onClick={() => onSelect?.(s.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  width: '100%',
                  padding: '12px 12px',
                  background: isActive ? 'rgba(79, 224, 168, 0.10)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isActive ? 'rgba(79, 224, 168, 0.28)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  color: '#FFFFFF',
                  transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
                }}
                onMouseEnter={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title={s.label}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden style={{
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: T2.color.accent,
                    boxShadow: `0 0 6px ${T2.color.accent}`,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, minWidth: 0,
                    fontSize: 12.5,
                    fontWeight: T2.font.weightSemibold,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{s.label}</span>
                </div>

                {stepTitle && (
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.62)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingLeft: 15,
                  }}>
                    <span aria-hidden style={{ marginRight: 4 }}>↳</span>
                    {stepTitle}
                  </div>
                )}

                <div style={{ paddingLeft: 15 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${T2.color.primary}, ${T2.color.accent})`,
                      borderRadius: 9999,
                      transition: 'width 200ms ease',
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginTop: 4,
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.42)',
                    fontFamily: T2.font.familyMono,
                  }}>
                    <span>{done} / {total}</span>
                    <span>{remaining > 0 ? `남은 ${formatMin(remaining)}` : '완료 임박'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
