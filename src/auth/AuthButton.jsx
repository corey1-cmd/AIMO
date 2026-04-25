/* ═══════════════════════════════════════════════════════════════
 * src/auth/AuthButton.jsx
 *
 * Nav 에 사용할 로그인/로그아웃 버튼.
 * AuthProvider 의 status 를 보고 적절한 UI 렌더.
 *
 * loading 상태에서는 빈 placeholder (너비만 확보) 를 반환합니다.
 * 이것이 로그인 여부 확정 전에 "로그인" 또는 "로그아웃" 버튼이
 * 잠깐 번쩍 뜨는 flash 를 막는 핵심 부분입니다.
 * ═══════════════════════════════════════════════════════════════ */

import { useAuth } from './AuthProvider.jsx';
import { signInWithGoogle, signOut } from './supabase.js';
import { useState } from 'react';

export function AuthButton() {
  const { status, user } = useAuth();
  const [busy, setBusy] = useState(false);

  // Flash 방지: loading 중에는 자리만 잡아두고 텍스트는 표시 안 함.
  // width 를 명시하여 레이아웃 점프를 최소화.
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
      // OAuth 리디렉션이 발생하므로 여기 이후 코드는 보통 실행되지 않음
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

  if (status === 'authenticated' && user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={busy}
        style={{
          padding: '6px 12px',
          fontSize: 14,
          background: 'transparent',
          border: '1px solid var(--brand-primary, #2828cd)',
          color: 'var(--brand-primary, #2828cd)',
          borderRadius: 6,
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.5 : 1,
        }}
        title={user.email}
      >
        {busy ? '...' : '로그아웃'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={busy}
      style={{
        padding: '6px 12px',
        fontSize: 14,
        background: 'var(--brand-primary, #2828cd)',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy ? '로그인 중...' : 'Google 로그인'}
    </button>
  );
}
