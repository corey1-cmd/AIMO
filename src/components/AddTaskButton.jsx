/* AddTaskButton.jsx — 우측 입력 모드 추가 버튼 (Atelier Cyan v6c — image-match)
 * 작은 점선 보더 pill. + 할 일 추가
 * Props: onClick, disabled */

import { T } from '../constants';

export function AddTaskButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 22px',
        background: 'rgba(255, 255, 255, 0.40)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1.5px dashed ${T.color.borderDashed}`,
        borderRadius: T.radius.pill,
        color: T.color.textSecondary,
        fontSize: 13,
        fontWeight: T.font_.weight.medium,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        letterSpacing: T.font_.tracking.tight,
        transition: 'border-color 200ms ease, color 200ms ease, background 200ms ease',
        opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = T.color.primary;
        e.currentTarget.style.color = T.color.primary;
        e.currentTarget.style.background = 'rgba(232, 244, 237, 0.55)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = T.color.borderDashed;
        e.currentTarget.style.color = T.color.textSecondary;
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.40)';
      }}
    >
      <span aria-hidden style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span>
      <span>할 일 추가</span>
    </button>
  );
}
