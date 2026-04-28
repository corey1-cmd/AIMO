/* FocusSession.jsx — 우측 박스 안에 들어가는 포커스 세션 UI (Atelier Cyan v6f)
 *
 * 이미지 1 매칭:
 *   상단: ← 메인 / Focus / 세션 종료
 *   전체 진행률 바: "전체 진행률 X / N · NN%"
 *   메인 카드 (현재 step):
 *     STEP M / N · 행동유형
 *     제목 (large) / source task (small)
 *     칩 3개: 청크 / CL단계 / 카테고리
 *     타이머 MM:SS / 경과 시간 / 예상 N분
 *     완료 버튼
 *   전체 스텝 리스트 (작은 카드)
 *
 * Props:
 *   plan, onComplete (current step), onCancel, onBack
 */

import { useEffect, useState, useRef } from 'react';
import { T, formatMin, CATEGORIES } from '../constants';
import { BEHAVIOR_TYPES, BUCKET_LABELS } from '../engine';

export function FocusSession({ plan, onComplete, onCancel, onBack }) {
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!plan || !plan.items || plan.items.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: T.color.textMuted }}>
        <p style={{ fontSize: 14, marginBottom: 16 }}>진행 중인 포커스 세션이 없습니다</p>
        <button onClick={onBack} style={ghostPill()}>메인으로</button>
      </div>
    );
  }

  const { items, curIdx, startTimes } = plan;
  const current = items[curIdx];
  const doneCount = items.filter(i => i.status === 'done').length;
  const progressPct = Math.round((doneCount / items.length) * 100);
  const curStartedAt = startTimes?.[curIdx] || Date.now();
  const curElapsedSec = Math.max(0, Math.floor((now - curStartedAt) / 1000));
  const estMin = current?.estimatedMin || 0;
  const overTime = curElapsedSec / 60 > estMin;

  function fmtTimer(sec) {
    const m = Math.floor(sec / 60), ss = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  const bt = BEHAVIOR_TYPES[current?.behaviorType] || BEHAVIOR_TYPES.COGNITIVE;
  const cat = CATEGORIES.find(c => c.key === current?.cat) || CATEGORIES[CATEGORIES.length - 1];
  const bucketLabel = BUCKET_LABELS[current?.bucket] || (current?.bucket || '');
  const sourceTask = (() => {
    // current.title이 "원본 — 단계명" 형식이면 분리
    const idx = current?.title?.indexOf(' — ');
    if (idx > 0) return { src: current.title.slice(0, idx), step: current.title.slice(idx + 3) };
    return { src: '', step: current?.title || '' };
  })();

  return (
    <div>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 14, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={ghostPill()}>
          <span aria-hidden>←</span>
          <span>메인</span>
        </button>
        <h1 style={{
          margin: 0,
          fontFamily: T.font_.familyDisplay,
          fontSize: 32,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: T.font_.tracking.tightest,
          color: T.color.textPrimary,
        }}>Focus</h1>
        <button onClick={onCancel} style={dangerPill()}>세션 종료</button>
      </div>

      {/* 전체 진행률 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.55)',
        border: '1px solid rgba(0, 82, 45, 0.06)',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0, 32, 18, 0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: T.color.textSecondary, fontWeight: T.font_.weight.medium }}>전체 진행률</span>
          <span style={{ fontSize: 13, color: T.color.textPrimary, fontFamily: T.font_.familyMono, fontWeight: T.font_.weight.semibold }}>
            {doneCount} / {items.length} · {progressPct}%
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
            borderRadius: 9999,
            transition: 'width 400ms ease',
          }} />
        </div>
      </div>

      {/* 현재 활동 메인 카드 */}
      <div style={{
        background: 'white',
        border: `2px solid ${T.color.primary}`,
        borderRadius: 22,
        padding: '32px 36px',
        marginBottom: 24,
        boxShadow: '0 8px 28px rgba(0, 82, 45, 0.10)',
        position: 'relative',
      }}>
        <div style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono, letterSpacing: '0.04em', marginBottom: 8 }}>
          STEP {curIdx + 1} / {items.length} · <span style={{ color: bt.color }}>{bt.icon} {bt.label}</span>
        </div>
        <h2 style={{
          margin: 0,
          marginBottom: 6,
          fontFamily: T.font_.familyDisplay,
          fontSize: 38,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: T.font_.tracking.tightest,
          color: T.color.textPrimary,
          lineHeight: 1.1,
        }}>{sourceTask.step}</h2>
        {sourceTask.src && (
          <div style={{ fontSize: 12, color: T.color.textMuted, marginBottom: 18 }}>
            <span aria-hidden>↳ </span>{sourceTask.src}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {bucketLabel && <Chip color={T.color.primary}>{bucketLabel}</Chip>}
          {current?.complexity != null && <Chip subtle>CL{current.complexity}</Chip>}
          {cat && <Chip subtle><span style={{ color: cat.color, marginRight: 4 }}>{cat.icon}</span>{cat.label}</Chip>}
        </div>

        {/* 타이머 박스 */}
        <div style={{
          background: 'rgba(232, 244, 237, 0.40)',
          border: '1px solid rgba(0, 82, 45, 0.06)',
          borderRadius: 16,
          padding: '28px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: T.font_.familyMono,
            fontSize: 64,
            fontWeight: T.font_.weight.bold,
            color: overTime ? '#C97A4A' : T.color.primary,
            lineHeight: 1,
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 4,
          }}>
            <span>{String(Math.floor(curElapsedSec / 60)).padStart(2, '0')}</span>
            <span style={{ opacity: 0.6 }}>:</span>
            <span>{String(curElapsedSec % 60).padStart(2, '0')}</span>
          </div>
          <div style={{ fontSize: 11, color: T.color.textMuted, marginTop: 8 }}>경과 시간</div>
          <div style={{ fontSize: 12, color: T.color.textSecondary, marginTop: 4 }}>
            예상 {formatMin(estMin)}{overTime && <span style={{ color: '#C97A4A', marginLeft: 8 }}>· 초과 진행 중</span>}
          </div>

          <button
            onClick={onComplete}
            style={{
              marginTop: 20,
              padding: '12px 32px',
              background: T.color.primary,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: T.font_.weight.semibold,
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(0, 82, 45, 0.18)',
              letterSpacing: '0.02em',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 82, 45, 0.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 45, 0.18)';
            }}
          >
            <span aria-hidden>✓</span> 완료
          </button>
        </div>
      </div>

      {/* 전체 스텝 리스트 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.55)',
        border: '1px solid rgba(0, 82, 45, 0.06)',
        borderRadius: 18,
        padding: '20px 22px',
        boxShadow: '0 2px 8px rgba(0, 32, 18, 0.04)',
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: T.font_.weight.semibold,
          color: T.color.textPrimary,
          marginBottom: 12,
        }}>전체 스텝</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((it, i) => {
            const done = it.status === 'done';
            const active = i === curIdx;
            const itCat = CATEGORIES.find(c => c.key === it.cat) || CATEGORIES[CATEGORIES.length - 1];
            const stepTitle = (() => {
              const idx = it.title?.indexOf(' — ');
              return idx > 0 ? it.title.slice(idx + 3) : it.title;
            })();
            return (
              <li key={it.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                background: active ? 'rgba(0, 82, 45, 0.04)' : 'transparent',
              }}>
                <span aria-hidden style={{
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: done ? T.color.primary : (active ? T.color.electricMint : 'transparent'),
                  border: !done && !active ? '1.5px solid rgba(24,29,25,0.18)' : 'none',
                  boxShadow: active ? `0 0 6px ${T.color.electricMint}` : 'none',
                  flexShrink: 0,
                }} />
                <span style={{
                  flex: 1, minWidth: 0,
                  fontSize: 13,
                  color: done ? T.color.textMuted : T.color.textPrimary,
                  fontWeight: active ? T.font_.weight.semibold : T.font_.weight.regular,
                  textDecoration: done ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{stepTitle}</span>
                <span style={{
                  fontSize: 11,
                  color: T.color.textMuted,
                  fontFamily: T.font_.familyMono,
                  flexShrink: 0,
                }}>{formatMin(it.estimatedMin)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Chip({ children, color, subtle }) {
  if (subtle) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 11px',
        fontSize: 11,
        fontWeight: T.font_.weight.medium,
        color: T.color.textSecondary,
        background: 'rgba(232, 244, 237, 0.55)',
        border: '1px solid rgba(0, 82, 45, 0.08)',
        borderRadius: 9999,
      }}>{children}</span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 11px',
      fontSize: 11,
      fontWeight: T.font_.weight.semibold,
      color,
      background: T.color.mint,
      border: `1px solid ${color}24`,
      borderRadius: 9999,
    }}>{children}</span>
  );
}

function ghostPill() {
  return {
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: T.font_.weight.medium,
    color: T.color.textSecondary,
    background: 'rgba(255, 255, 255, 0.65)',
    border: `1px solid ${T.glass.lightBorderStrong}`,
    borderRadius: 9999,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };
}

function dangerPill() {
  return {
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: T.font_.weight.medium,
    color: '#C44949',
    background: 'rgba(255, 245, 245, 0.65)',
    border: '1px solid rgba(196, 73, 73, 0.20)',
    borderRadius: 9999,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
