/* TaskInputCard.jsx — 우측 입력 카드 (Atelier Cyan v6c — image-match)
 * 라이트 글래스. 번호 / 입력 placeholder / 두 체크박스 / 우측 ... 메뉴
 *   체크박스: 고정 시간  |  자유 배치 (AI가 순서 · 시간 결정)
 * Props: index, task, canRemove, onChange, onRemove */

import { useState } from 'react';
import { T2, T } from '../constants';

export function TaskInputCard({ index, task, canRemove, onChange, onRemove }) {
  const update = (field, value) => onChange({ ...task, [field]: value });
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isActive = focused || hovered;

  const fixed = !!task.fixedTime;
  const freePlace = !!task.freePlace; // 둘 다 독립적, 기본 unchecked

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: 18,
        alignItems: 'flex-start',
        padding: '20px 22px',
        background: isActive ? 'rgba(232, 244, 237, 0.55)' : 'rgba(255, 255, 255, 0.50)',
        border: `1px solid ${isActive ? 'rgba(0, 82, 45, 0.14)' : 'rgba(0, 82, 45, 0.06)'}`,
        borderRadius: 18,
        boxShadow: isActive ? '0 4px 12px rgba(0, 32, 18, 0.06)' : '0 2px 6px rgba(0, 32, 18, 0.03)',
        transition: 'border-color 220ms ease, box-shadow 220ms ease, background 220ms ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 좌측 액센트 라인 (focus 시 점등) */}
      <div aria-hidden style={{
        position: 'absolute',
        left: 0, top: 12, bottom: 12,
        width: 3,
        borderRadius: '0 2px 2px 0',
        background: focused ? `linear-gradient(180deg, ${T2.color.primary}, ${T2.color.accent})` : 'transparent',
        transition: 'background 240ms ease',
        pointerEvents: 'none',
      }} />

      <span style={numberCircle()}>{index + 1}</span>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <input
          type="text"
          value={task.title}
          onChange={(e) => update('title', e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="예: 샤워, 이메일 확인, 논문 작성"
          style={{
            width: '100%',
            padding: 0,
            border: 'none',
            outline: 'none',
            fontSize: 15,
            fontWeight: T2.font.weightMedium,
            fontFamily: 'inherit',
            color: T2.color.text,
            background: 'transparent',
            letterSpacing: T2.font.tracking.tight,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Checkbox
            checked={fixed}
            onChange={(v) => update('fixedTime', v)}
            label="고정 시간"
            accent={T2.color.primary}
          />
          <Divider />
          <Checkbox
            checked={freePlace}
            onChange={(v) => update('freePlace', v)}
            label="자유 배치 (AI가 순서 · 시간 결정)"
            accent={T2.color.accent}
            soft
          />
        </div>
      </div>

      {/* 우측 ··· 메뉴 (제거 동작) */}
      {canRemove && (
        <button
          onClick={onRemove}
          aria-label="이 항목 제거"
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            color: T2.color.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
            transition: 'background 200ms ease, color 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 82, 45, 0.06)';
            e.currentTarget.style.color = T2.color.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T2.color.textMuted;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, label, accent, soft }) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      userSelect: 'none',
    }}>
      <span style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: checked ? `1.5px solid ${accent}` : `1.5px solid rgba(24, 29, 25, 0.20)`,
        background: checked ? accent : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: checked && !soft ? `0 0 0 3px ${T2.color.surfaceSoft}` : 'none',
        transition: 'all 180ms ease',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 6 L5 8.5 L9.5 3.5" stroke={soft ? '#0E1614' : 'white'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{
        fontSize: 13,
        color: checked ? T2.color.text : T2.color.textSecondary,
        fontWeight: checked ? T2.font.weightMedium : T2.font.weightRegular,
      }}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          position: 'absolute',
          width: 1, height: 1, padding: 0, margin: -1,
          overflow: 'hidden', clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap', border: 0,
        }}
      />
    </label>
  );
}

function Divider() {
  return (
    <span aria-hidden style={{
      display: 'inline-block',
      width: 1, height: 14,
      background: 'rgba(24, 29, 25, 0.10)',
    }} />
  );
}

const numberCircle = () => ({
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'rgba(232, 244, 237, 0.65)',
  border: '1px solid rgba(0, 82, 45, 0.08)',
  color: T2.color.textSecondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: T2.font.weightSemibold,
  fontFamily: T2.font.familyMono,
  marginTop: 1,
});
