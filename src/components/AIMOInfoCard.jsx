/* AIMOInfoCard.jsx — 좌측 사이드바 마지막 카드 (Atelier Cyan v6c — image-match)
 * 다크 글래스. 좌측 텍스트("AIMO는 자체 V3 분류 체계로 작동합니다." / 1,366 단계 · 회귀 0 / 자세히 보기 ›)
 * 우측 큐브 SVG. 우상단 × 닫기 버튼.
 * Props: onLearnMore */

import { useState } from 'react';
import { T } from '../constants';

export function AIMOInfoCard({ onLearnMore }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <section style={{
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* 우측 옅은 글로우 */}
      <div aria-hidden style={{
        position: 'absolute',
        right: -40,
        bottom: -40,
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 224, 168, 0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 좌측 콘텐츠 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
        <span style={{
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.62)',
          lineHeight: 1.4,
          paddingRight: 12,
        }}>AIMO는 자체 V3 분류 체계로 작동합니다.</span>

        <div style={{
          fontSize: 18,
          color: T.color.textOnDark,
          fontWeight: T.font_.weight.semibold,
          letterSpacing: T.font_.tracking.tight,
          fontFamily: T.font_.familyDisplay,
        }}>
          1,366 <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', fontWeight: T.font_.weight.regular }}>단계</span>
          <span style={{ color: 'rgba(255,255,255,0.30)', margin: '0 8px', fontSize: 14 }}>·</span>
          회귀 <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', fontWeight: T.font_.weight.regular }}>0</span>
        </div>

        <button
          onClick={onLearnMore}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.62)',
            fontSize: 11,
            fontFamily: T.font_.familyMono,
            cursor: 'pointer',
            padding: '2px 0',
            letterSpacing: '0.04em',
            textAlign: 'left',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            transition: 'color 200ms ease',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = T.color.electricMint; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.62)'; }}
        >자세히 보기 <span aria-hidden>›</span></button>
      </div>

      {/* 우측 큐브 */}
      <Cube />

      {/* 우상단 닫기 */}
      <button
        onClick={() => setClosed(true)}
        aria-label="이 카드 숨기기"
        style={{
          position: 'absolute',
          right: -4,
          top: -4,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          lineHeight: 1,
          transition: 'background 200ms ease, color 200ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.78)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
        }}
      >×</button>
    </section>
  );
}

function Cube() {
  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="cubeStroke2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(79, 224, 168, 0.85)" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#cubeStroke2)" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M24 6 L40 14 L40 32 L24 40 L8 32 L8 14 Z" />
          <path d="M24 6 L24 24 L40 14" />
          <path d="M24 24 L8 14" />
          <path d="M24 24 L24 40" />
        </g>
        <circle cx="24" cy="24" r="2.2" fill={T.color.electricMint} opacity="0.85" />
      </svg>
    </div>
  );
}
