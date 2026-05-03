/* FocusDashboard.jsx — /focus 라우트 (Atelier Cyan v6i)
 *
 * 단일 진행 중 세션 전용 화면. 진행 중 세션이 없으면 라우터에서 redirect.
 *
 * 카드 배치:
 *   좌상단 (col 1-2 wide): 단계별 시간 그래프 — 클릭/호버로 정보, 0.2s 트랜지션
 *   우상단 (col 3): 라이브 타이머 카드 + 일시정지
 *   좌중단: 고정 시간 활동 모니터 (활동 분포 자리 대체)
 *   중중단: 평균 작업 수행 시간 (현재 세션 단계별)
 *   우중단: 다음 할 일 + 단계 완료 버튼
 *   하단: 단순 스탯 (진행률 / 평균 속도)
 *
 * 모든 데이터는 plan 기반.
 */

import { useState, useEffect, useRef } from 'react';
import { T, CATEGORIES, formatMin, getSpeedY, getSpeedStatus, getSpeedStatusFromMins } from '../constants';
import { BEHAVIOR_TYPES, BUCKET_LABELS } from '../engine';

function fmtHm(min) {
  if (!min || min < 1) return '0m';
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* 메인 export */
export function FocusDashboard({ plan, onCompleteStep, onCancelSession, onNavigate, paused, elapsedOffsetSec, onTogglePause }) {
  if (!plan || !plan.items || plan.items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Header plan={plan} onCancel={onCancelSession} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 380px)',
        gap: 16,
        gridAutoRows: 'min-content',
      }} className="focus-grid">
        <div style={{ gridColumn: '1 / 3' }}>
          <SessionTimelineCard plan={plan} elapsedOffsetSec={elapsedOffsetSec} paused={paused} />
        </div>
        <div style={{ gridColumn: '3 / 4' }}>
          <LiveTimerCard plan={plan} elapsedOffsetSec={elapsedOffsetSec} paused={paused} onTogglePause={onTogglePause} />
        </div>
        <div style={{ gridColumn: '1 / 2' }}>
          <FixedDeadlineCard plan={plan} />
        </div>
        <div style={{ gridColumn: '2 / 3' }}>
          <StepDurationCard plan={plan} />
        </div>
        <div style={{ gridColumn: '3 / 4' }}>
          <NextStepsCard plan={plan} onComplete={onCompleteStep} />
        </div>
        <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SessionProgressCard plan={plan} />
          <SessionPaceCard plan={plan} elapsedOffsetSec={elapsedOffsetSec} paused={paused} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1280px) {
          .focus-grid { grid-template-columns: 1fr 1fr !important; }
          .focus-grid > div[style*="grid-column: 3 / 4"],
          .focus-grid > div[style*="gridColumn: '3 / 4'"] { grid-column: 1 / 3 !important; grid-row: auto !important; }
        }
        @media (max-width: 760px) {
          .focus-grid { grid-template-columns: 1fr !important; }
          .focus-grid > div { grid-column: 1 !important; }
        }
      `}</style>
    </div>
  );
}

function Header({ plan, onCancel }) {
  return (
    <header style={{
      marginBottom: 6,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontFamily: T.font_.familyMono,
          letterSpacing: '0.06em',
          color: T.color.primary,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>● 진행 중인 세션</div>
        <h1 style={{
          margin: 0,
          marginBottom: 4,
          fontFamily: T.font_.familyDisplay,
          fontSize: 30,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: T.font_.tracking.tightest,
          color: T.color.textPrimary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{plan.label || 'Focus 세션'}</h1>
        <p style={{
          margin: 0,
          fontSize: 12.5,
          color: T.color.textSecondary,
          lineHeight: 1.6,
        }}>실시간 진행 상황과 단계별 페이스를 추적합니다.</p>
      </div>

      <button
        onClick={onCancel}
        style={{
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: T.font_.weight.medium,
          color: '#C44949',
          background: 'rgba(255, 245, 245, 0.65)',
          border: '1px solid rgba(196, 73, 73, 0.20)',
          borderRadius: 9999,
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginTop: 8,
          transition: 'background 200ms ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 235, 235, 0.85)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 245, 245, 0.65)'; }}
      >세션 종료</button>
    </header>
  );
}

/* card helpers */
function CardLight({ children, style }) {
  return (
    <section style={{
      background: 'rgba(255, 255, 255, 0.55)',
      borderRadius: 18,
      padding: '20px 22px',
      boxShadow: '0 2px 8px rgba(0, 32, 18, 0.04)',
      border: `1px solid rgba(0, 82, 45, 0.06)`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>{children}</section>
  );
}

function CardTitle({ children, right }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      gap: 8,
    }}>
      <span style={{
        fontSize: 14,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        letterSpacing: T.font_.tracking.tight,
      }}>{children}</span>
      {right}
    </div>
  );
}


/* ─── 1. 단계별 시간 그래프 ───────────────────────────────────
   각 step의 estimatedMin을 막대로, 현재 step만 actual 진행에 따라 색상 변경.
   고정 시간 step은 빨간색으로 x축에 별도 마커.
   클릭/호버: 정보 박스 (그래프 영역 벗어나면 사라짐).
   현재 단계가 바뀌면 0.2s로 부드럽게 이동 (CSS transition).
   ──────────────────────────────────────────────────────── */
function SessionTimelineCard({ plan, elapsedOffsetSec = 0, paused }) {
  const [now, setNow] = useState(Date.now());
  const [hover, setHover] = useState(null); // { idx, x, y }
  const svgRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const items = plan.items.filter(i => !i.isMarker);
  const curIdx = plan.curIdx ?? 0;

  // 데이터: 각 step의 estimated, 현재 step의 elapsed
  const data = items.map((it, i) => {
    const estMin = it.estimatedMin || 0;
    let actMin = 0;
    if (i < curIdx) {
      // 완료된 단계
      actMin = it.actualMin != null ? it.actualMin : estMin;
    } else if (i === curIdx) {
      const startedAt = plan.startTimes?.[curIdx] || now;
      const elapsedSec = paused ? elapsedOffsetSec : Math.max(0, (now - startedAt) / 1000) + elapsedOffsetSec;
      actMin = elapsedSec / 60;
    }
    return {
      idx: i,
      title: stripPrefix(it.title),
      estMin,
      actMin,
      isFixed: !!it.v3?.isFixed,
      isCurrent: i === curIdx,
      isDone: i < curIdx,
      cat: it.cat,
      bt: it.behaviorType,
    };
  });

  const maxMin = Math.max(...data.map(d => Math.max(d.estMin, d.actMin)), 1);

  const W = 720, H = 240;
  const padL = 36, padR = 16, padT = 24, padB = 50;  // padB 늘림 — 고정 시간 마커
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot = innerW / data.length;
  const bw = Math.max(8, slot * 0.6);
  const x = (i) => padL + i * slot + (slot - bw) / 2;
  const y = (v) => padT + (1 - v / maxMin) * innerH;

  // 클릭/호버 처리
  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    // 어느 막대인지 판정
    const i = Math.floor((px - padL) / slot);
    if (i < 0 || i >= data.length) {
      setHover(null);
      return;
    }
    setHover({ idx: i, mouseX: px });
  };

  const handleLeave = () => setHover(null);

  // 현재 단계 위치로 자동 스크롤 시각 표시 (CSS transition으로 부드럽게)
  const currentX = x(curIdx) + bw / 2;

  // 막대 색상: estimated (회색) + actual overlay (현재 단계만 색상 변경)
  function actualColor(d, status) {
    if (!d.isCurrent) return T.color.primary;
    if (!status) return T.color.electricMint;
    if (status.type === 'fast') return T.color.primary;
    if (status.type === 'slow') return '#C97A4A';
    return T.color.electricMint;
  }

  // 툴팁 위치 계산 — 위 공간 부족하면 아래로
  let tip = null;
  if (hover) {
    const d = data[hover.idx];
    const status = d.isDone || d.isCurrent
      ? getSpeedStatusFromMins(d.estMin, d.actMin)
      : null;
    const tipW = 160, tipH = 92;
    const barTopY = y(Math.max(d.estMin, d.actMin));
    const barCenterX = x(d.idx) + bw / 2;
    // 기본: 막대 위에. 잘릴 위험이면 아래에.
    let tipX = barCenterX - tipW / 2;
    let tipY = barTopY - tipH - 10;
    let arrowDirection = 'down'; // 화살표는 막대 가리키므로 아래
    if (tipY < 0) {
      // 위 공간 부족 → 아래로
      tipY = barTopY + 14;
      arrowDirection = 'up';
    }
    // 좌우 잘림 방지
    tipX = Math.max(4, Math.min(W - tipW - 4, tipX));

    tip = { x: tipX, y: tipY, w: tipW, h: tipH, d, status, arrowDirection, barCenterX, barTopY };
  }

  return (
    <CardLight>
      <CardTitle right={
        <span style={{
          fontSize: 10,
          fontFamily: T.font_.familyMono,
          letterSpacing: '0.06em',
          color: T.color.primary,
        }}>STEP {curIdx + 1} / {items.length}</span>
      }>단계별 시간</CardTitle>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 4, fontSize: 11, color: T.color.textMuted, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 8, background: 'rgba(24,29,25,0.12)', display: 'inline-block', borderRadius: 2 }} />
          예상
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 8, background: T.color.primary, display: 'inline-block', borderRadius: 2 }} />
          실제
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 3, background: '#D43F3F', display: 'inline-block', borderRadius: 2 }} />
          고정 시간
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onClick={handleMove}
        >
          <defs>
            <filter id="tipShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.14)" />
            </filter>
          </defs>

          {/* y축 라벨 */}
          {[0, maxMin / 2, maxMin].map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(24,29,25,0.06)" strokeDasharray="3 4" />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end" fill={T.color.textMuted} fontSize="10" fontFamily={T.font_.familyMono}>{fmtHm(v)}</text>
            </g>
          ))}

          {/* 현재 단계 위치 가이드 (0.2s 부드럽게 이동) */}
          <line
            x1={currentX} x2={currentX}
            y1={padT} y2={padT + innerH}
            stroke={T.color.electricMint}
            strokeOpacity="0.28"
            strokeWidth="2"
            strokeDasharray="3 3"
            style={{ transition: 'all 200ms ease' }}
          />

          {/* 막대 */}
          {data.map((d, i) => {
            const status = d.isDone || d.isCurrent
              ? getSpeedStatusFromMins(d.estMin, d.actMin)
              : null;
            const estTop = y(d.estMin);
            const estBottom = padT + innerH;
            const estH = estBottom - estTop;
            const actTop = d.actMin > 0 ? y(d.actMin) : estBottom;
            const actH = d.actMin > 0 ? estBottom - actTop : 0;
            const isHovered = hover?.idx === i;

            return (
              <g key={i} style={{ transition: 'opacity 200ms ease' }}>
                {/* estimated 배경 막대 */}
                <rect
                  x={x(i)}
                  y={estTop}
                  width={bw}
                  height={estH}
                  rx="3"
                  fill="rgba(24,29,25,0.10)"
                  opacity={isHovered ? 1 : 0.7}
                  style={{ transition: 'opacity 200ms ease' }}
                />
                {/* actual overlay */}
                {actH > 0 && (
                  <rect
                    x={x(i)}
                    y={actTop}
                    width={bw}
                    height={actH}
                    rx="3"
                    fill={actualColor(d, status)}
                    opacity="0.92"
                    style={{ transition: 'fill 200ms ease, height 200ms ease' }}
                  />
                )}
                {/* 고정 시간 마커 (x축 아래 빨간 표시) */}
                {d.isFixed && (
                  <>
                    <line
                      x1={x(i)}
                      x2={x(i) + bw}
                      y1={padT + innerH + 4}
                      y2={padT + innerH + 4}
                      stroke="#D43F3F"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <text
                      x={x(i) + bw / 2}
                      y={padT + innerH + 16}
                      textAnchor="middle"
                      fill="#D43F3F"
                      fontSize="9"
                      fontFamily={T.font_.familyMono}
                      fontWeight="600"
                    >🔒</text>
                  </>
                )}
              </g>
            );
          })}

          {/* x축 라벨 (스텝 번호) */}
          {data.map((d, i) => (
            <text
              key={i}
              x={x(i) + bw / 2}
              y={H - 8}
              textAnchor="middle"
              fill={d.isCurrent ? T.color.primary : T.color.textMuted}
              fontSize="10"
              fontFamily={T.font_.familyMono}
              fontWeight={d.isCurrent ? '600' : '400'}
              style={{ transition: 'fill 200ms ease' }}
            >{i + 1}</text>
          ))}

          {/* 툴팁 */}
          {tip && (
            <g>
              {/* 막대와 툴팁 연결 라인 */}
              <line
                x1={tip.barCenterX}
                y1={tip.arrowDirection === 'down' ? tip.y + tip.h : tip.y}
                x2={tip.barCenterX}
                y2={tip.barTopY}
                stroke="rgba(24,29,25,0.18)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <rect
                x={tip.x} y={tip.y} width={tip.w} height={tip.h}
                rx="8" fill="white" stroke="rgba(24,29,25,0.10)" strokeWidth="1"
                filter="url(#tipShadow)"
              />
              <text x={tip.x + 12} y={tip.y + 18} fill={T.color.textPrimary} fontSize="11" fontWeight="600">
                {tip.d.idx + 1}. {(tip.d.title || '').slice(0, 16)}{(tip.d.title || '').length > 16 ? '…' : ''}
              </text>
              <text x={tip.x + 12} y={tip.y + 36} fill={T.color.textMuted} fontSize="10">예상</text>
              <text x={tip.x + tip.w - 12} y={tip.y + 36} textAnchor="end" fill={T.color.textPrimary} fontSize="10" fontFamily={T.font_.familyMono}>{fmtHm(tip.d.estMin)}</text>
              <text x={tip.x + 12} y={tip.y + 52} fill={T.color.textMuted} fontSize="10">실제</text>
              <text x={tip.x + tip.w - 12} y={tip.y + 52} textAnchor="end" fill={T.color.textPrimary} fontSize="10" fontFamily={T.font_.familyMono}>
                {tip.d.actMin > 0 ? fmtHm(tip.d.actMin) : '—'}
              </text>
              <text x={tip.x + 12} y={tip.y + 70} fill={T.color.primary} fontSize="10">속도</text>
              <text
                x={tip.x + tip.w - 12} y={tip.y + 70} textAnchor="end"
                fill={tip.status?.type === 'slow' ? '#C97A4A' : T.color.primary}
                fontSize="10" fontFamily={T.font_.familyMono} fontWeight="600"
              >
                {tip.status ? `${tip.status.y.toFixed(2)}%` : '—'}
              </text>
              {tip.d.isFixed && (
                <text x={tip.x + 12} y={tip.y + 86} fill="#D43F3F" fontSize="9" fontFamily={T.font_.familyMono} fontWeight="600">
                  🔒 고정 시간
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    </CardLight>
  );
}

function stripPrefix(title) {
  if (!title) return '';
  const idx = title.indexOf(' — ');
  return idx > 0 ? title.slice(idx + 3) : title;
}


/* ─── 2. 라이브 타이머 카드 (with 일시정지) ──────────────────── */
function LiveTimerCard({ plan, elapsedOffsetSec = 0, paused, onTogglePause }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const { items, curIdx, startTimes } = plan;
  const current = items[curIdx];
  if (!current) return null;

  const curStartedAt = startTimes?.[curIdx] || now;
  const elapsedSec = paused ? Math.floor(elapsedOffsetSec) : Math.max(0, Math.floor((now - curStartedAt) / 1000)) + Math.floor(elapsedOffsetSec);
  const elapsedMin = elapsedSec / 60;
  const estMin = current?.estimatedMin || 0;
  const overTime = elapsedMin > estMin;
  const status = getSpeedStatusFromMins(estMin, elapsedMin);

  const bt = BEHAVIOR_TYPES[current?.behaviorType] || BEHAVIOR_TYPES.COGNITIVE;
  const stepTitle = stripPrefix(current?.title);

  return (
    <CardLight style={{
      border: `1px solid ${T.color.primary}`,
      boxShadow: '0 4px 18px rgba(0, 82, 45, 0.10)',
    }}>
      <CardTitle right={
        <span style={{
          fontSize: 10,
          fontFamily: T.font_.familyMono,
          letterSpacing: '0.06em',
          color: paused ? '#C97A4A' : T.color.primary,
          background: paused ? 'rgba(201, 122, 74, 0.10)' : T.color.mintSoft,
          padding: '2px 8px',
          borderRadius: 9999,
        }}>{paused ? 'PAUSED' : 'LIVE'}</span>
      }>현재 세션</CardTitle>

      {/* 세션 라벨 — 진행 중인 세션이 무엇인지 한눈에 식별 */}
      {plan.label && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(232, 244, 237, 0.55)',
          border: '1px solid rgba(0, 82, 45, 0.10)',
          borderRadius: 10,
          marginBottom: 12,
        }}>
          <span aria-hidden style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: T.color.primary,
            flexShrink: 0,
          }} />
          <span style={{
            flex: 1, minWidth: 0,
            fontSize: 12.5,
            fontWeight: T.font_.weight.semibold,
            color: T.color.primary,
            letterSpacing: T.font_.tracking.tight,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{plan.label}</span>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: T.color.textMuted, fontFamily: T.font_.familyMono, letterSpacing: '0.04em', marginBottom: 4 }}>
        STEP {curIdx + 1} / {items.length} · <span style={{ color: bt.color }}>{bt.label}</span>
        {current?.v3?.isFixed && <span style={{ color: '#D43F3F', marginLeft: 6 }}>🔒 고정</span>}
      </div>
      <div style={{
        fontSize: 16,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        marginBottom: 18,
        letterSpacing: T.font_.tracking.tight,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{stepTitle}</div>

      {/* 타이머 */}
      <div style={{
        background: paused ? 'rgba(201, 122, 74, 0.06)' : 'rgba(232, 244, 237, 0.40)',
        borderRadius: 14,
        padding: '20px 16px',
        textAlign: 'center',
        marginBottom: 10,
        transition: 'background 200ms ease',
      }}>
        <div style={{
          fontFamily: T.font_.familyMono,
          fontSize: 44,
          fontWeight: T.font_.weight.bold,
          color: overTime ? '#C97A4A' : T.color.primary,
          lineHeight: 1,
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 2,
          opacity: paused ? 0.55 : 1,
          transition: 'opacity 200ms ease',
        }}>
          <span>{String(Math.floor(elapsedSec / 60)).padStart(2, '0')}</span>
          <span style={{ opacity: 0.6 }}>:</span>
          <span>{String(elapsedSec % 60).padStart(2, '0')}</span>
        </div>
        <div style={{ fontSize: 10, color: T.color.textMuted, marginTop: 6 }}>
          {paused ? '일시 정지됨' : '경과 시간'}
        </div>
      </div>

      {/* 일시정지 / 재개 버튼 */}
      <button
        onClick={onTogglePause}
        style={{
          width: '100%',
          padding: '9px 14px',
          background: paused ? T.color.primary : 'rgba(255, 255, 255, 0.65)',
          color: paused ? 'white' : T.color.textSecondary,
          border: paused ? 'none' : `1px solid ${T.glass.lightBorderStrong}`,
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 12.5,
          fontWeight: T.font_.weight.semibold,
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 12,
          transition: 'background 200ms ease, color 200ms ease',
        }}
      >
        {paused ? (
          <>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2 L9 6 L3 10 Z" /></svg>
            <span>재개</span>
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><rect x="3" y="2" width="2" height="8" rx="0.5" /><rect x="7" y="2" width="2" height="8" rx="0.5" /></svg>
            <span>일시 정지</span>
          </>
        )}
      </button>

      {/* 상태 표시 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: T.color.textMuted }}>
          예상 {formatMin(estMin)}
          {overTime && <span style={{ color: '#C97A4A', marginLeft: 6 }}>· 초과</span>}
        </span>
        <span style={{
          fontSize: 12,
          fontFamily: T.font_.familyMono,
          fontWeight: T.font_.weight.semibold,
          color: !status ? T.color.textMuted
            : status.type === 'fast' ? T.color.primary
            : status.type === 'slow' ? '#C97A4A'
            : T.color.textSecondary,
        }}>{status ? `${status.y}%` : '—'}</span>
      </div>

      {status && (
        <div style={{
          padding: '8px 12px',
          background: status.type === 'fast' ? 'rgba(0, 82, 45, 0.06)'
            : status.type === 'slow' ? 'rgba(201, 122, 74, 0.08)'
            : 'rgba(24, 29, 25, 0.04)',
          border: `1px solid ${
            status.type === 'fast' ? 'rgba(0, 82, 45, 0.12)'
            : status.type === 'slow' ? 'rgba(201, 122, 74, 0.16)'
            : 'rgba(24, 29, 25, 0.08)'
          }`,
          borderRadius: 10,
          fontSize: 11.5,
          color: status.type === 'fast' ? T.color.primary
            : status.type === 'slow' ? '#A8602F'
            : T.color.textSecondary,
          textAlign: 'center',
          fontWeight: T.font_.weight.medium,
        }}>{status.message}</div>
      )}
    </CardLight>
  );
}


/* ─── 3. 고정 시간 활동 모니터 (활동 분포 자리) ─────────────── */
function FixedDeadlineCard({ plan }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const items = plan.items.filter(i => !i.isMarker);
  const curIdx = plan.curIdx ?? 0;

  // 고정 시간이 지정된 단계만
  const fixedSteps = items
    .map((it, i) => ({ ...it, idx: i }))
    .filter(it => it.v3?.isFixed && it.v3?.fixedTime);

  // 각 고정 단계까지 남은 예상 시간 = 현재 단계부터 그 단계 직전까지의 estimated 합 + 현재 단계 잔여
  function minsUntil(targetIdx) {
    if (targetIdx <= curIdx) return 0;
    let s = 0;
    // 현재 단계 잔여
    const cur = items[curIdx];
    const startedAt = plan.startTimes?.[curIdx] || now;
    const elapsedMin = (now - startedAt) / 60000;
    const remaining = Math.max(0, (cur?.estimatedMin || 0) - elapsedMin);
    s += remaining;
    // 다음 단계들
    for (let j = curIdx + 1; j < targetIdx; j++) {
      s += items[j].estimatedMin || 0;
    }
    return s;
  }

  return (
    <CardLight>
      <CardTitle right={fixedSteps.length > 0 && (
        <span style={{ fontSize: 10, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>
          {fixedSteps.length}개 고정
        </span>
      )}>고정 시간 활동</CardTitle>

      {fixedSteps.length === 0 ? (
        <div style={{
          padding: '24px 12px',
          textAlign: 'center',
          color: T.color.textMuted,
          fontSize: 12,
          lineHeight: 1.6,
        }}>
          이 세션엔 고정 시간 활동이 없습니다.
          <br />
          <span style={{ fontSize: 10.5, color: '#9ca39e' }}>입력 단계에서 "고정 시간" 체크 시 표시됩니다</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fixedSteps.map(it => {
            const remainMin = minsUntil(it.idx);
            const isPassed = it.idx < curIdx;
            const isCurrent = it.idx === curIdx;
            const isUrgent = remainMin > 0 && remainMin < 5;

            return (
              <div key={it.id} style={{
                padding: '12px 14px',
                background: isCurrent ? 'rgba(212, 63, 63, 0.06)' : 'rgba(255, 255, 255, 0.45)',
                border: `1px solid ${isCurrent ? 'rgba(212, 63, 63, 0.20)' : 'rgba(0, 82, 45, 0.06)'}`,
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span aria-hidden style={{
                    width: 24, height: 24,
                    borderRadius: 6,
                    background: isPassed ? 'rgba(0, 82, 45, 0.06)' : 'rgba(212, 63, 63, 0.12)',
                    color: isPassed ? T.color.primary : '#D43F3F',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    flexShrink: 0,
                  }}>{isPassed ? '✓' : '🔒'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5,
                      fontWeight: T.font_.weight.semibold,
                      color: isPassed ? T.color.textMuted : T.color.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{stripPrefix(it.title)}</div>
                    <div style={{ fontSize: 10.5, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>
                      STEP {it.idx + 1} · {formatMin(it.estimatedMin)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 14,
                    fontFamily: T.font_.familyMono,
                    fontWeight: T.font_.weight.semibold,
                    color: isPassed ? T.color.textMuted
                      : isCurrent ? '#D43F3F'
                      : isUrgent ? '#C97A4A'
                      : T.color.primary,
                  }}>
                    {isPassed ? '완료' : isCurrent ? '진행 중' : `${formatMin(remainMin)} 남음`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardLight>
  );
}


/* ─── 4. 단계별 평균 수행 시간 (현재 세션) ───────────────────── */
function StepDurationCard({ plan }) {
  const items = plan.items.filter(i => !i.isMarker);
  const curIdx = plan.curIdx ?? 0;
  const completed = items.slice(0, curIdx).map(it => ({
    title: stripPrefix(it.title),
    estMin: it.estimatedMin || 0,
    actMin: it.actualMin || 0,
  }));

  if (completed.length === 0) {
    return (
      <CardLight>
        <CardTitle>완료 단계 페이스</CardTitle>
        <div style={{
          padding: '24px 12px',
          textAlign: 'center',
          color: T.color.textMuted,
          fontSize: 12,
          lineHeight: 1.6,
        }}>
          단계를 완료하면 여기에 페이스가 표시됩니다
        </div>
      </CardLight>
    );
  }

  const totalEst = completed.reduce((s, d) => s + d.estMin, 0);
  const totalAct = completed.reduce((s, d) => s + d.actMin, 0);
  const avgEst = totalEst / completed.length;
  const avgAct = totalAct / completed.length;
  const status = getSpeedStatusFromMins(totalEst, totalAct);

  return (
    <CardLight>
      <CardTitle right={
        <span style={{ fontSize: 10, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>
          {completed.length}개 완료
        </span>
      }>완료 단계 페이스</CardTitle>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 12,
      }}>
        <Mini label="평균 예상" value={fmtHm(avgEst)} />
        <Mini label="평균 실제" value={fmtHm(avgAct)} accent={status?.type === 'fast'} warn={status?.type === 'slow'} />
      </div>

      {status && (
        <div style={{
          padding: '8px 12px',
          background: status.type === 'fast' ? 'rgba(0, 82, 45, 0.06)' : 'rgba(201, 122, 74, 0.08)',
          border: `1px solid ${status.type === 'fast' ? 'rgba(0, 82, 45, 0.12)' : 'rgba(201, 122, 74, 0.16)'}`,
          borderRadius: 10,
          fontSize: 11.5,
          color: status.type === 'fast' ? T.color.primary : '#A8602F',
          textAlign: 'center',
          fontWeight: T.font_.weight.medium,
        }}>{status.message}</div>
      )}
    </CardLight>
  );
}

function Mini({ label, value, accent, warn }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255, 255, 255, 0.45)',
      border: '1px solid rgba(0, 82, 45, 0.06)',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 10.5, color: T.color.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: 18,
        fontWeight: T.font_.weight.semibold,
        color: accent ? T.color.primary : warn ? '#A8602F' : T.color.textPrimary,
        fontFamily: T.font_.familyMono,
        letterSpacing: '0.01em',
      }}>{value}</div>
    </div>
  );
}


/* ─── 5. 다음 할 일 + 단계 완료 버튼 ──────────────────────── */
function NextStepsCard({ plan, onComplete }) {
  const { items, curIdx } = plan;
  const upcoming = items.slice(curIdx + 1).filter(i => !i.isMarker).slice(0, 4);
  const remaining = items.slice(curIdx + 1).filter(i => !i.isMarker);
  const remainingMin = remaining.reduce((s, i) => s + (i.estimatedMin || 0), 0);

  return (
    <CardLight>
      <CardTitle right={
        <span style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>
          {remaining.length}개 · {formatMin(remainingMin)}
        </span>
      }>다음 할 일</CardTitle>

      {upcoming.length === 0 ? (
        <div style={{
          padding: '24px 12px',
          textAlign: 'center',
          color: T.color.textMuted,
          fontSize: 12,
        }}>
          <span aria-hidden style={{ fontSize: 22, display: 'block', marginBottom: 6, opacity: 0.5 }}>🎉</span>
          마지막 단계입니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {upcoming.map((it, i) => {
            const cat = CATEGORIES.find(c => c.key === it.cat) || CATEGORIES[CATEGORIES.length - 1];
            return (
              <div key={it.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                background: i === 0 ? 'rgba(232, 244, 237, 0.35)' : 'transparent',
                border: i === 0 ? '1px solid rgba(0, 82, 45, 0.08)' : '1px solid transparent',
              }}>
                <span style={{
                  width: 22, height: 22,
                  borderRadius: 6,
                  background: `${cat.color}1A`,
                  color: cat.color,
                  fontSize: 11,
                  fontFamily: T.font_.familyMono,
                  fontWeight: T.font_.weight.semibold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>{curIdx + 1 + i + 1}</span>
                <span style={{
                  flex: 1, minWidth: 0,
                  fontSize: 12.5,
                  color: i === 0 ? T.color.textPrimary : T.color.textSecondary,
                  fontWeight: i === 0 ? T.font_.weight.medium : T.font_.weight.regular,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{stripPrefix(it.title)}</span>
                {it.v3?.isFixed && <span style={{ color: '#D43F3F', fontSize: 10, flexShrink: 0 }} title="고정 시간">🔒</span>}
                <span style={{
                  fontSize: 10.5,
                  color: T.color.textMuted,
                  fontFamily: T.font_.familyMono,
                  flexShrink: 0,
                }}>{formatMin(it.estimatedMin)}</span>
              </div>
            );
          })}
          {remaining.length > upcoming.length && (
            <div style={{
              fontSize: 10.5,
              color: T.color.textMuted,
              textAlign: 'center',
              padding: '4px 0',
              fontFamily: T.font_.familyMono,
            }}>
              + {remaining.length - upcoming.length}개 더
            </div>
          )}
        </div>
      )}

      {/* 단계 완료 버튼 — 다음 할 일 박스 아래 별도 배치 */}
      <button
        onClick={onComplete}
        style={{
          width: '100%',
          padding: '12px 18px',
          background: T.color.primary,
          color: 'white',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: T.font_.weight.semibold,
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: '0 4px 12px rgba(0, 82, 45, 0.18)',
          transition: 'background 200ms ease, transform 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#003d22'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = T.color.primary; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <span aria-hidden>✓</span> 단계 완료
      </button>
    </CardLight>
  );
}


/* ─── 6. 세션 진행률 / 페이스 ────────────────────────────── */
function SessionProgressCard({ plan }) {
  const items = plan.items.filter(i => !i.isMarker);
  const curIdx = plan.curIdx ?? 0;
  const done = items.slice(0, curIdx).length;
  const totalEst = items.reduce((s, i) => s + (i.estimatedMin || 0), 0);
  const completedEst = items.slice(0, curIdx).reduce((s, i) => s + (i.estimatedMin || 0), 0);
  const completionPct = totalEst > 0 ? Math.round((completedEst / totalEst) * 100) : 0;

  return (
    <CardLight>
      <CardTitle>세션 진행률</CardTitle>
      <div style={{
        fontSize: 28,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        fontFamily: T.font_.familyDisplay,
        letterSpacing: T.font_.tracking.tightest,
        lineHeight: 1,
        marginBottom: 8,
      }}>{completionPct}%</div>
      <div style={{ height: 5, background: 'rgba(24,29,25,0.06)', borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${completionPct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.electricMint})`,
          borderRadius: 9999,
          transition: 'width 200ms ease',
        }} />
      </div>
      <div style={{ fontSize: 11, color: T.color.textMuted, fontFamily: T.font_.familyMono }}>
        {done} / {items.length} 단계 완료
      </div>
    </CardLight>
  );
}

function SessionPaceCard({ plan, elapsedOffsetSec = 0, paused }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const items = plan.items.filter(i => !i.isMarker);
  const curIdx = plan.curIdx ?? 0;

  // 완료된 단계의 est/act 합 + 현재 단계의 elapsed
  let est = 0, act = 0;
  for (let i = 0; i < curIdx; i++) {
    est += items[i].estimatedMin || 0;
    act += items[i].actualMin || 0;
  }
  const cur = items[curIdx];
  if (cur) {
    est += cur.estimatedMin || 0;
    const startedAt = plan.startTimes?.[curIdx] || now;
    const elapsedMin = paused
      ? elapsedOffsetSec / 60
      : (now - startedAt) / 60000 + elapsedOffsetSec / 60;
    act += elapsedMin;
  }

  const status = getSpeedStatusFromMins(est, act);

  return (
    <CardLight>
      <CardTitle>세션 평균 속도</CardTitle>
      <div style={{
        fontSize: 28,
        fontWeight: T.font_.weight.semibold,
        color: !status ? T.color.textMuted
          : status.type === 'fast' ? T.color.primary
          : status.type === 'slow' ? '#A8602F'
          : T.color.textPrimary,
        fontFamily: T.font_.familyDisplay,
        letterSpacing: T.font_.tracking.tightest,
        lineHeight: 1,
        marginBottom: 8,
      }}>{status ? `${status.y}%` : '—'}</div>
      <div style={{
        fontSize: 11.5,
        color: T.color.textSecondary,
        lineHeight: 1.6,
      }}>{status ? status.message : '진행 중인 데이터를 모으는 중'}</div>
    </CardLight>
  );
}
