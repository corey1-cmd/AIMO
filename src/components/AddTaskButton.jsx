/* AddTaskButton.jsx — 우측 input 모드 추가 버튼 (Lenu §4-9)
 * 점선 보더 + + 할 일 추가
 * Props: onClick, disabled */

import { T } from '../constants';

export function AddTaskButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '14px',
        width: '100%',
        background: 'transparent',
        border: `2px dashed ${T.color.borderDashed}`,
        borderRadius: T.radius.lg,
        color: T.color.textMuted,
        fontSize: T.font_.size.caption,
        fontWeight: T.font_.weight.medium,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 200ms ease, color 200ms ease, background 200ms ease',
        opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = T.color.primary;
        e.currentTarget.style.color = T.color.primary;
        e.currentTarget.style.background = T.color.mintSoft;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = T.color.borderDashed;
        e.currentTarget.style.color = T.color.textMuted;
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span aria-hidden="true">+</span>
      <span>할 일 추가</span>
    </button>
  );
}
