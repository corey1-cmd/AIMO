/* ═══════════════════════════════════════════════════════════════
 * src/auth/AuthButton.jsx
 *
 * NavBar 우측에 표시되는 인증 상태 버튼.
 * AuthProvider 의 status 를 보고 적절한 UI 렌더.
 *
 * 2026-04-26 patch-v6a-hardgate-v3 (시각 시스템 교정):
 *   시니어 2 종합 검토에 따라 색상 토큰을 Sprout 디자인 가이드로 교체.
 *   - var(--brand-primary, #2828cd) → Sprout deep forest (#00522d)
 *   - 로그아웃 버튼: 보더 있는 ghost → 작은 텍스트 + hover 시 부드럽게 강조
 *     (NavBar 시각 무게 감소, "로그아웃 하라" 가 아니라 "필요하면 누르라")
 *   - 로그인 버튼: pill CTA + Sprout primary
 *
 * Hard Gate 환경에서는 비로그인 사용자가 NavBar 자체에 도달하지 못하므로
 * '로그인' 분기는 fallback safety 용입니다 (Hard Gate 미적용 상태로 회귀할 때).
 *
 * loading 상태에서는 빈 placeholder (너비만 확보) 를 반환하여 flash 방지.
 * ═══════════════════════════════════════════════════════════════ */

import { useAuth } from './AuthProvider.jsx';
import { signInWithGoogle, signOut } from './supabase.js';
import { useState } from 'react';

/* Sprout 디자인 가이드 토큰 — LoginPage 와 동일 값 유지 */
const PALETTE = {
  primary: '#00522d',
  primaryHover: '#003d22',
  text: '#181d19',
  textMuted: '#6f7a70',
  border: 'rgba(45, 75, 62, 0.18)',
  borderHover: 'rgba(45, 75, 62, 0.35)',
};

export function AuthButton() {
  const { status, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);

  // Flash 방지: loading 중에는 자리만 잡아두고 텍스트는 표시 안 함.
  if (status === 'loading') {
    return (
      <div
        aria-hidden="true"
        style={{
          display: 'inline-block',
          minWidth: 80,
          height: 32,
        }}
      />
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
    if (!confirm('로그아웃하시겠어요? 오프라인 기록은 다음 로그인까지 유지됩니다.')) {
      return;
    }
    setBusy(true);
    try {
      await signOut();
    } catch (e) {
      alert('로그아웃에 실패했습니다: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  /* ─── 로그인 상태: 작은 텍스트 버튼 (NavBar 시각 무게 최소화) ─── */
  if (status === 'authenticated' && user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={busy}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
          background: hover ? 'rgba(45, 75, 62, 0.06)' : 'transparent',
          border: `1px solid ${hover ? PALETTE.borderHover : PALETTE.border}`,
          color: PALETTE.text,
          borderRadius: 9999,    // pill — Sprout 가이드 일관
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.5 : 1,
          transition: 'background 200ms, border-color 200ms',
          letterSpacing: '0.01em',
          fontFamily: 'inherit',  // NavBar 폰트 상속 (Plus Jakarta Sans)
        }}
        title={user.email}
        aria-label={`로그아웃 (${user.email})`}
      >
        {busy ? '...' : '로그아웃'}
      </button>
    );
  }

  /* ─── 비로그인 상태: Hard Gate 하에서 보통 도달 안 함 (fallback) ─── */
  return (
    <button
      onClick={handleSignIn}
      disabled={busy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 700,
        background: hover ? PALETTE.primaryHover : PALETTE.primary,
        color: 'white',
        border: 'none',
        borderRadius: 9999,
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.7 : 1,
        transition: 'background 200ms',
        letterSpacing: '0.01em',
        fontFamily: 'inherit',
        boxShadow: '0 4px 16px rgba(45, 75, 62, 0.18)',
      }}
    >
      {busy ? '로그인 중...' : 'Google 로그인'}
    </button>
  );
}
