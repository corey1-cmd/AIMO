/* ParserErrorCard.jsx — 우측 input 모드 파서 실패 안내 (Lenu §4-12)
 * Props: unrecognized (array of items), onClose */

import { T } from '../constants';

export function ParserErrorCard({ unrecognized, onClose }) {
  if (!unrecognized || (Array.isArray(unrecognized) && unrecognized.length === 0)) return null;

  const count = Array.isArray(unrecognized) ? unrecognized.length : 1;

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
        width: 20,
        height: 20,
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
        <strong style={{ display: 'block', marginBottom: 4 }}>
          {count}개 항목을 정확히 인식하지 못했어요
        </strong>
        <span style={{ color: T.color.textSecondary }}>
          더 구체적으로 표현해 보세요. 예: "회의" → "팀 주간 회의 30분"
        </span>
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
