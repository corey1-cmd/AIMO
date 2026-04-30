/* ParserErrorCard.jsx — 우측 input 모드 파서 실패 안내 (Lenu §4-12)
 * Props: message (string or array), onRetry (옵셔널), onClose (옵셔널) */

import { T } from '../constants';

function deriveText(message) {
  if (!message) return null;
  if (Array.isArray(message)) {
    if (message.length === 0) return null;
    return {
      title: `${message.length}개 항목을 정확히 인식하지 못했어요`,
      hint: '더 구체적으로 표현해 보세요. 예: "회의" → "팀 주간 회의 30분"',
    };
  }
  if (typeof message === 'object' && message !== null) {
    return {
      title: message.title || '인식할 수 없는 항목이 있어요',
      hint: message.hint || '입력을 더 구체적으로 작성해 보세요',
    };
  }
  return {
    title: String(message),
    hint: null,
  };
}

export function ParserErrorCard({ message, onRetry, onClose }) {
  const text = deriveText(message);
  if (!text) return null;

  return (
    <div role="alert" style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '14px 16px',
      background: T.color.warningSoft,
      border: `1px solid ${T.color.warning}`,
      borderRadius: T.radius.md,
      marginBottom: 16,
    }}>
      <span style={{
        flexShrink: 0,
        width: 20, height: 20,
        borderRadius: '50%',
        background: T.color.warning,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: T.font_.weight.bold,
        marginTop: 2,
      }} aria-hidden="true">!</span>

      <div style={{
        flex: 1,
        fontSize: T.font_.size.caption,
        color: T.color.textPrimary,
        lineHeight: T.font_.leading.relaxed,
      }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>{text.title}</strong>
        {text.hint && (
          <span style={{ color: T.color.textSecondary }}>{text.hint}</span>
        )}

        {(onRetry || onClose) && (
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 10,
          }}>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: T.font_.weight.semibold,
                  fontFamily: 'inherit',
                  background: T.color.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: T.radius.pill,
                  cursor: 'pointer',
                }}
              >다시 시도</button>
            )}
          </div>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            color: T.color.textMuted,
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 4,
          }}
        >×</button>
      )}
    </div>
  );
}
