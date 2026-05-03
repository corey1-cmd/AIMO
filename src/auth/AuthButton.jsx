/* AuthButton.jsx — NavBar 우측 아바타 + 드롭다운 메뉴 (Atelier Cyan v6f)
 *
 * loading: 빈 placeholder (flash 방지)
 * unauthenticated: 로그인 pill 버튼
 * authenticated: 아바타(이니셜)+caret → 클릭 시 드롭다운
 *   드롭다운 항목: 학습 데이터 관리 / 로그아웃
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { signInWithGoogle, signOut } from './supabase.js';

const PRIMARY = '#00522d';
const PRIMARY_HOVER = '#003d22';
const MINT_TINT = 'rgba(0, 82, 45, 0.06)';
const TEXT_PRIMARY = '#181D19';
const TEXT_MUTED = '#6f7a70';
const CTA_SHADOW = '0 4px 24px rgba(45, 75, 62, 0.18)';

export function AuthButton({ onNavigate }) {
  const { status, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  // 외부 클릭으로 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (status === 'loading') {
    return (
      <div aria-hidden="true" style={{ display: 'inline-block', minWidth: 40, height: 40 }} />
    );
  }

  const handleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      alert('로그인에 실패했습니다: ' + e.message);
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (busy) return;
    setBusy(true);
    setMenuOpen(false);
    try {
      await signOut();
    } catch (e) {
      alert('로그아웃 실패: ' + e.message);
      setBusy(false);
    }
  };

  if (status === 'authenticated' && user) {
    const initial = (user.email || 'A').trim().charAt(0).toUpperCase();
    return (
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          disabled={busy}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px 4px 4px',
            background: hovered || menuOpen ? MINT_TINT : 'transparent',
            border: 'none',
            borderRadius: 9999,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.5 : 1,
            fontFamily: 'inherit',
            transition: 'background 200ms ease',
          }}
          title={user.email}
        >
          <span aria-hidden style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#181D19',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>{busy ? '…' : initial}</span>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden style={{
            transform: menuOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
          }}>
            <path d="M3 4.5 L6 7.5 L9 4.5" stroke={TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              minWidth: 220,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(0, 82, 45, 0.08)',
              borderRadius: 14,
              boxShadow: '0 12px 36px rgba(0, 32, 18, 0.12), 0 1px 0 rgba(255,255,255,0.65) inset',
              padding: 6,
              zIndex: 200,
            }}
          >
            {/* 사용자 정보 헤더 */}
            <div style={{
              padding: '10px 12px 12px',
              borderBottom: '1px solid rgba(0, 82, 45, 0.06)',
              marginBottom: 4,
            }}>
              <div style={{
                fontSize: 12,
                color: TEXT_MUTED,
                marginBottom: 2,
              }}>로그인됨</div>
              <div style={{
                fontSize: 13,
                color: TEXT_PRIMARY,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{user.email}</div>
            </div>

            <MenuItem
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6.25C9 4 4 4 4 4 v13 s5 0 8 2.25" />
                  <path d="M12 6.25 C 15 4, 20 4, 20 4 v13 s-5 0-8 2.25" />
                </svg>
              }
              label="학습 데이터 관리"
              onClick={() => {
                setMenuOpen(false);
                onNavigate?.('/learning');
              }}
            />
            <MenuItem
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
              label="설정"
              onClick={() => {
                setMenuOpen(false);
                onNavigate?.('/settings');
              }}
            />
            <MenuItem
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21 H5 a2 2 0 0 1-2-2 V5 a2 2 0 0 1 2-2 h4" />
                  <path d="M16 17 L21 12 L16 7" />
                  <path d="M21 12 H9" />
                </svg>
              }
              label="로그아웃"
              onClick={handleSignOut}
              danger
            />
          </div>
        )}
      </div>
    );
  }

  // unauthenticated
  return (
    <button
      onClick={handleSignIn}
      disabled={busy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 18px',
        fontSize: 13,
        fontFamily: 'inherit',
        fontWeight: 600,
        background: hovered ? PRIMARY_HOVER : PRIMARY,
        color: 'white',
        border: 'none',
        borderRadius: 9999,
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.6 : 1,
        boxShadow: CTA_SHADOW,
        transition: 'background 200ms ease',
        letterSpacing: '0.02em',
      }}
    >
      {busy ? '...' : 'Google 로그인'}
    </button>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  const baseColor = danger ? '#C44949' : TEXT_PRIMARY;
  const hoverBg = danger ? 'rgba(196, 73, 73, 0.06)' : MINT_TINT;
  return (
    <button
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 12px',
        background: hovered ? hoverBg : 'transparent',
        border: 'none',
        borderRadius: 8,
        color: baseColor,
        fontSize: 13,
        fontFamily: 'inherit',
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 150ms ease',
      }}
    >
      <span aria-hidden style={{ color: hovered ? baseColor : TEXT_MUTED, transition: 'color 150ms ease', display: 'inline-flex' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
