/* TaskInputCard.jsx — 우측 input 모드 작업 입력 (Lenu §4-8)
 * Props: value (task object), onChange, onRemove, removable, index */

import { T, CATEGORIES } from '../constants';

export function TaskInputCard({ index, value, removable, onChange, onRemove }) {
  const update = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });

  return (
    <div style={{
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
      padding: '18px 20px',
      background: T.color.bgCard,
      border: `1px solid ${T.color.border}`,
      borderRadius: T.radius.lg,
      transition: 'border-color 200ms ease, box-shadow 200ms ease',
    }}>
      <span style={{
        flexShrink: 0,
        width: 30, height: 30,
        borderRadius: '50%',
        background: T.color.mint,
        color: T.color.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: T.font_.weight.bold,
        marginTop: 2,
      }}>{index + 1}</span>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <input
          type="text"
          value={value.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="할 일을 입력하세요"
          style={{
            width: '100%',
            padding: 0,
            border: 'none',
            outline: 'none',
            fontSize: T.font_.size.body,
            fontWeight: T.font_.weight.medium,
            fontFamily: 'inherit',
            color: T.color.textPrimary,
            background: 'transparent',
          }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={value.estimatedMin || ''}
            onChange={(e) => update('estimatedMin', e.target.value)}
            placeholder="예상 시간 (분)"
            inputMode="numeric"
            style={metaInputStyle()}
          />
          <select
            value={value.category || ''}
            onChange={(e) => update('category', e.target.value)}
            style={metaInputStyle({ minWidth: 110 })}
          >
            <option value="">카테고리</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {removable && (
        <button
          onClick={onRemove}
          aria-label="이 항목 제거"
          style={{
            flexShrink: 0,
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            color: T.color.textMuted,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
            transition: 'background 200ms ease, color 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.color.errorSoft;
            e.currentTarget.style.color = T.color.error;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T.color.textMuted;
          }}
        >×</button>
      )}
    </div>
  );
}

const metaInputStyle = (extra = {}) => ({
  padding: '6px 12px',
  fontSize: 12,
  fontFamily: 'inherit',
  background: T.color.mintSoft,
  border: `1px solid ${T.color.border}`,
  borderRadius: T.radius.sm,
  color: T.color.textPrimary,
  outline: 'none',
  width: 130,
  ...extra,
});
