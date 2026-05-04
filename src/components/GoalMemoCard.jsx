/* GoalMemoCard.jsx — 좌측 사이드바 목표 메모 (Atelier Cyan v6m)
 *
 * 다크 글래스. 헤더: GOAL / 편집 → (우측 아이콘)
 * - 메모 70자 제한
 * - 빈 상태: "목표를 적어보세요" + 입력 영역
 * - 작성 상태: 내용 표시. 사이드바 공간 초과 시 클릭 → 팝업 (전체 보기/편집)
 * - localStorage 'aimo-goal-memo' 저장
 */

import { useState, useEffect, useRef } from 'react';
import { T2, T } from '../constants';

const LS_KEY = 'aimo-goal-memo';
const MAX_LEN = 70;

// 사이드바에서 잘림 없이 보이는 안전 길이 (대략)
const SIDEBAR_SAFE_LEN = 38;

export function GoalMemoCard() {
  const [memo, setMemo] = useState(() => {
    try { return localStorage.getItem(LS_KEY) || ''; } catch { return ''; }
  });
  const [editing, setEditing] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, memo); } catch {}
  }, [memo]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const isOverflow = memo.length > SIDEBAR_SAFE_LEN;

  function handleStartEdit() {
    setEditing(true);
  }
  function handleSave() {
    setEditing(false);
  }
  function handleCancel(prev) {
    setMemo(prev);
    setEditing(false);
  }
  function handleClick() {
    if (memo && !editing) setPopupOpen(true);
  }

  return (
    <>
      <section style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: T2.font.weightSemibold,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.62)',
            fontFamily: T2.font.familyMono,
          }}>GOAL</span>
          {!editing && (
            <button
              onClick={handleStartEdit}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.42)',
                cursor: 'pointer',
                fontSize: 10.5,
                fontFamily: T2.font.familyMono,
                padding: 0,
                letterSpacing: '0.04em',
              }}
            >{memo ? '편집' : '+ 추가'}</button>
          )}
        </div>

        {editing ? (
          <MemoEditor
            initial={memo}
            onSave={(v) => { setMemo(v); handleSave(); }}
            onCancel={() => setEditing(false)}
            inputRef={inputRef}
          />
        ) : memo ? (
          <button
            onClick={handleClick}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              cursor: isOverflow ? 'pointer' : 'default',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (isOverflow) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
            }}
            onMouseLeave={(e) => {
              if (isOverflow) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            title={isOverflow ? '클릭하여 전체 보기' : ''}
          >
            <div style={{
              fontSize: 12.5,
              color: '#FFFFFF',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}>{memo}</div>
            {isOverflow && (
              <div style={{
                marginTop: 6,
                fontSize: 10,
                color: T2.color.accent,
                letterSpacing: '0.04em',
                fontFamily: T2.font.familyMono,
              }}>전체 보기 →</div>
            )}
          </button>
        ) : (
          <button
            onClick={handleStartEdit}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255,255,255,0.10)',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11.5,
              color: 'rgba(255,255,255,0.42)',
              textAlign: 'center',
              lineHeight: 1.5,
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(79, 224, 168, 0.30)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
          >
            목표를 적어보세요<br/>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)' }}>최대 {MAX_LEN}자</span>
          </button>
        )}
      </section>

      {popupOpen && (
        <GoalPopup
          memo={memo}
          onSave={(v) => { setMemo(v); setPopupOpen(false); }}
          onClose={() => setPopupOpen(false)}
          onClear={() => { setMemo(''); setPopupOpen(false); }}
        />
      )}
    </>
  );
}

function MemoEditor({ initial, onSave, onCancel, inputRef }) {
  const [v, setV] = useState(initial);
  const remaining = MAX_LEN - v.length;

  function handleChange(e) {
    const next = e.target.value;
    if (next.length > MAX_LEN) {
      setV(next.slice(0, MAX_LEN));
    } else {
      setV(next);
    }
  }
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(v.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }

  return (
    <div>
      <textarea
        ref={inputRef}
        value={v}
        onChange={handleChange}
        onKeyDown={handleKey}
        rows={3}
        placeholder="이번 주 목표는…"
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(79, 224, 168, 0.28)',
          borderRadius: 10,
          color: '#FFFFFF',
          fontSize: 12.5,
          fontFamily: 'inherit',
          lineHeight: 1.5,
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
      }}>
        <span style={{
          fontSize: 10,
          color: remaining < 10 ? '#C97A4A' : 'rgba(255,255,255,0.32)',
          fontFamily: T2.font.familyMono,
        }}>{v.length} / {MAX_LEN}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '4px 10px',
              fontSize: 10.5,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.52)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >취소</button>
          <button
            onClick={() => onSave(v.trim())}
            style={{
              padding: '4px 12px',
              fontSize: 10.5,
              background: T2.color.accent,
              border: 'none',
              borderRadius: 6,
              color: '#0E1614',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: T2.font.weightSemibold,
            }}
          >저장</button>
        </div>
      </div>
    </div>
  );
}

function GoalPopup({ memo, onSave, onClose, onClear }) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(14, 22, 20, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 18,
          padding: '28px 30px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 32, 18, 0.30)',
        }}
      >
        <div style={{
          fontSize: 11,
          fontFamily: T2.font.familyMono,
          letterSpacing: '0.18em',
          color: T2.color.primary,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>● Goal</div>
        <h2 style={{
          margin: 0,
          marginBottom: 16,
          fontSize: 20,
          fontWeight: T2.font.weightSemibold,
          color: T2.color.text,
          letterSpacing: T2.font.tracking.tight,
        }}>나의 목표</h2>

        {editing ? (
          <PopupEditor
            initial={memo}
            onSave={(v) => { onSave(v); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div style={{
              padding: '18px 20px',
              background: 'rgba(232, 244, 237, 0.40)',
              border: '1px solid rgba(0, 82, 45, 0.10)',
              borderRadius: 12,
              fontSize: 15,
              lineHeight: 1.7,
              color: T2.color.text,
              wordBreak: 'break-word',
              minHeight: 64,
              marginBottom: 16,
            }}>{memo}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button
                onClick={onClear}
                style={{
                  padding: '8px 14px',
                  fontSize: 12.5,
                  fontWeight: T2.font.weightMedium,
                  background: 'transparent',
                  color: '#C44949',
                  border: '1px solid rgba(196, 73, 73, 0.20)',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >삭제</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: T2.font.weightMedium,
                    background: 'rgba(255, 255, 255, 0.65)',
                    color: T2.color.textSecondary,
                    border: '1px solid rgba(0, 82, 45, 0.14)',
                    borderRadius: 9999,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >닫기</button>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: T2.font.weightSemibold,
                    background: T2.color.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: 9999,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >편집</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PopupEditor({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial);
  const remaining = MAX_LEN - v.length;
  return (
    <div>
      <textarea
        autoFocus
        value={v}
        onChange={(e) => {
          const next = e.target.value;
          setV(next.length > MAX_LEN ? next.slice(0, MAX_LEN) : next);
        }}
        rows={4}
        placeholder="이번 주 목표는…"
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'white',
          border: '1px solid rgba(0, 82, 45, 0.18)',
          borderRadius: 12,
          fontSize: 15,
          lineHeight: 1.6,
          color: T2.color.text,
          fontFamily: 'inherit',
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
      }}>
        <span style={{
          fontSize: 11.5,
          color: remaining < 10 ? '#C97A4A' : T2.color.textMuted,
          fontFamily: T2.font.familyMono,
        }}>{v.length} / {MAX_LEN}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              fontSize: 12.5,
              background: 'rgba(255, 255, 255, 0.65)',
              color: T2.color.textSecondary,
              border: '1px solid rgba(0, 82, 45, 0.14)',
              borderRadius: 9999,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >취소</button>
          <button
            onClick={() => onSave(v.trim())}
            style={{
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: T2.font.weightSemibold,
              background: T2.color.primary,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >저장</button>
        </div>
      </div>
    </div>
  );
}
