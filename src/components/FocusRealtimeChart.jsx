/* FocusRealtimeChart.jsx — Focus 모드 실시간 차트
 *
 * 매초 갱신. X축 = 경과 시간 (초). Y축 = 누적 분(min).
 *
 * 예상선:
 *   - 처음부터 plan 끝까지 미리 그어져 있는 직선
 *   - 기울기 = (총 예상시간 분) / (총 예상시간 분 * 60초) = 1/60 (분당 1)
 *
 * 실제선:
 *   - 시간이 흐르면 1초마다 1픽셀씩 진행
 *   - 사용자 페이스가 그대로 반영됨 (리얼타임)
 *   - 예상선보다 아래면 빠른 페이스, 위면 느린 페이스
 *
 * Props:
 *   plan: { items, curIdx, startedAt, startTimes? }
 *   currentItem: 현재 진행 중인 항목
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { T, formatMin } from '../constants';

export function FocusRealtimeChart({ plan, currentItem }) {
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef(null);

  useEffect(() => {
    tickRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  const { totalEstMin, expectedNow, actualNow, elapsedSec, isAhead, gapMin } = useMemo(() => {
    const items = plan?.items || [];
    const totalEstMin = items.reduce((s, i) => s + (i.estimatedMin || 0), 0);
    if (!plan?.startedAt || totalEstMin === 0) {
      return { totalEstMin: 0, expectedNow: 0, actualNow: 0, elapsedSec: 0, isAhead: true, gapMin: 0 };
    }
    const elapsedMs = Math.max(0, now - plan.startedAt);
    const elapsedSec = Math.floor(elapsedMs / 1000);

    const expectedNow = elapsedMs / 60000; // 1분당 1, elapsed가 분 단위로 환산
    // 실제 누적 = 완료 항목 actualMin 합 + (현재 항목 진행 분)
    let completedActual = 0;
    for (let i = 0; i < (plan.curIdx || 0); i++) {
      completedActual += items[i]?.actualMin || items[i]?.estimatedMin || 0;
    }
    // 현재 항목의 진행 분
    const curStartTime = plan.startTimes?.[plan.curIdx] ?? plan.startedAt;
    const curElapsedMin = Math.max(0, (now - curStartTime) / 60000);
    const actualNow = completedActual + curElapsedMin;

    const gapMin = actualNow - expectedNow;
    const isAhead = gapMin <= 0;

    return { totalEstMin, expectedNow, actualNow, elapsedSec, isAhead, gapMin: Math.abs(gapMin) };
  }, [plan, now]);

  if (!plan?.startedAt || totalEstMin === 0) {
    return (
      <div style={cardStyle()}>
        <div style={titleStyle()}>실시간 페이스</div>
        <div style={{
          fontSize: 13,
          color: T.color.textMuted,
          padding: '40px 20px',
          textAlign: 'center',
        }}>세션이 시작되면 실시간 페이스를 보여드릴게요</div>
      </div>
    );
  }

  return (
    <div style={cardStyle()}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 4,
      }}>
        <div>
          <div style={titleStyle()}>실시간 페이스</div>
          <div style={{
            fontSize: 12,
            color: T.color.textMuted,
            marginTop: 4,
          }}>
            {currentItem?.title || '진행 중'} · 경과 {formatElapsed(elapsedSec)}
          </div>
        </div>
        <PaceBadge isAhead={isAhead} gapMin={gapMin} />
      </div>

      <Chart
        totalEstMin={totalEstMin}
        elapsedSec={elapsedSec}
        actualNow={actualNow}
        expectedNow={expectedNow}
      />

      <Legend />
    </div>
  );
}

function PaceBadge({ isAhead, gapMin }) {
  if (gapMin < 0.1) {
    return (
      <span style={{
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: T.font_.weight.semibold,
        background: T.color.mintSoft,
        color: T.color.primary,
        borderRadius: T.radius.pill,
        whiteSpace: 'nowrap',
      }}>예상 페이스</span>
    );
  }
  return (
    <span style={{
      padding: '6px 12px',
      fontSize: 12,
      fontWeight: T.font_.weight.semibold,
      background: isAhead ? T.color.successSoft : T.color.warningSoft,
      color: isAhead ? T.color.success : T.color.warning,
      borderRadius: T.radius.pill,
      whiteSpace: 'nowrap',
    }}>
      {isAhead ? '↗' : '↘'} {Math.round(gapMin)}분 {isAhead ? '빠름' : '느림'}
    </span>
  );
}

function Chart({ totalEstMin, elapsedSec, actualNow, expectedNow }) {
  const W = 600;
  const H = 200;
  const padX = 36;
  const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  // 차트 X축 길이: 예상 총 시간의 1.2배 (or 경과 시간이 더 크면 그 길이)
  const xMaxSec = Math.max(totalEstMin * 60 * 1.2, elapsedSec, 60);
  const yMaxMin = Math.max(totalEstMin * 1.2, actualNow * 1.2, 5);

  const xScale = (sec) => padX + (sec / xMaxSec) * innerW;
  const yScale = (min) => padY + innerH - (min / yMaxMin) * innerH;

  // 예상선: (0, 0) → (totalEstMin*60, totalEstMin)
  const expectedEnd = { x: xScale(totalEstMin * 60), y: yScale(totalEstMin) };

  // 실제선: (0,0) → (elapsedSec, actualNow)
  // 매초 실제 진행도가 변하므로 실제로는 곡선이지만 단순 직선으로 표시
  // 다만 현재까지 일직선보다 비례 곡선이 의미가 있도록, 가속/감속 구간을 표현하기 위해
  // 각 1/4 구간의 평균 페이스로 4개 점을 찍어 polyline 그림
  const N_SEGMENTS = 4;
  const actualPath = [];
  for (let i = 0; i <= N_SEGMENTS; i++) {
    const t = (i / N_SEGMENTS) * elapsedSec;
    const m = (i / N_SEGMENTS) * actualNow;
    actualPath.push({ x: xScale(t), y: yScale(m) });
  }

  // y축 grid (3 lines)
  const yTicks = [];
  for (let i = 0; i <= 3; i++) {
    const v = (yMaxMin / 3) * i;
    yTicks.push({ y: yScale(v), label: `${Math.round(v)}분` });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', marginTop: 16 }}>
      {/* y축 grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padX} x2={W - padX} y1={t.y} y2={t.y} stroke={T.color.divider} strokeWidth="1" />
          <text
            x={padX - 6}
            y={t.y + 3}
            fontSize="10"
            fill={T.color.textMuted}
            textAnchor="end"
            fontFamily="ui-monospace, monospace"
          >{t.label}</text>
        </g>
      ))}

      {/* 예상선 (실선) */}
      <line
        x1={xScale(0)}
        y1={yScale(0)}
        x2={expectedEnd.x}
        y2={expectedEnd.y}
        stroke={T.color.primary}
        strokeWidth="2"
        opacity={0.9}
      />
      {/* 예상 종점 마크 */}
      <circle cx={expectedEnd.x} cy={expectedEnd.y} r="4" fill={T.color.primary} />

      {/* 실제선 (점선) */}
      <polyline
        points={actualPath.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={T.color.textPrimary}
        strokeWidth="2.5"
        strokeDasharray="5 4"
        strokeLinecap="round"
      />

      {/* 현재 점 (실시간 강조) */}
      {actualPath.length > 0 && (
        <>
          <circle
            cx={actualPath[actualPath.length - 1].x}
            cy={actualPath[actualPath.length - 1].y}
            r="8"
            fill={T.color.primary}
            opacity="0.18"
          >
            <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={actualPath[actualPath.length - 1].x}
            cy={actualPath[actualPath.length - 1].y}
            r="4"
            fill={T.color.primary}
          />
        </>
      )}

      {/* X축 라벨 */}
      <text
        x={padX}
        y={H - 2}
        fontSize="10"
        fill={T.color.textMuted}
        fontFamily="ui-monospace, monospace"
      >0:00</text>
      <text
        x={W - padX}
        y={H - 2}
        fontSize="10"
        fill={T.color.textMuted}
        fontFamily="ui-monospace, monospace"
        textAnchor="end"
      >{formatElapsed(Math.round(xMaxSec))}</text>
    </svg>
  );
}

function Legend() {
  return (
    <div style={{
      display: 'flex',
      gap: 16,
      fontSize: 12,
      marginTop: 12,
      paddingTop: 12,
      borderTop: `1px solid ${T.color.divider}`,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 14, height: 2, background: T.color.primary, display: 'inline-block' }} />
        <span style={{ color: T.color.textSecondary }}>예상 페이스</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 14, height: 2, display: 'inline-block',
          backgroundImage: `linear-gradient(to right, ${T.color.textPrimary} 60%, transparent 60%)`,
          backgroundSize: '4px 2px',
        }} />
        <span style={{ color: T.color.textSecondary }}>실제 진행</span>
      </span>
    </div>
  );
}

function formatElapsed(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

const cardStyle = () => ({
  background: T.color.bgCard,
  borderRadius: T.radius.lg,
  padding: 20,
  boxShadow: T.shadow.ambient,
  border: `1px solid ${T.color.border}`,
});

const titleStyle = () => ({
  fontSize: T.font_.size.title,
  fontWeight: T.font_.weight.semibold,
  color: T.color.textPrimary,
});
