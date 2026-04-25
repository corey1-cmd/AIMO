/* ═══════════════════════════════════════════════════════════════
 * src/auth/LoginPage.jsx
 *
 * Hard Gate 로그인 페이지.
 * status === 'unauthenticated' 일 때 App.jsx 가 이 컴포넌트만 렌더합니다.
 *
 * 디자인 원칙:
 *   - 단일 큰 Google 버튼이 시각적 중심
 *   - 브랜딩(détente, "당신의 작은 데탕트")이 위에 배치되어 정체성 노출
 *   - 가치 제안 한 줄("기록은 안전하게 보관되며 여러 기기에서 이어서 쓸 수 있어요")
 *   - 버튼 클릭 시 즉시 spinner + "Google 로그인 진행 중..." 메시지로 OAuth 대기시간 부담 완화
 *
 * 시니어 2가 patch-v6a 에서 우려한 flash 현상은 AuthProvider 의 'loading' 상태 차단으로
 * 이 페이지에 진입하기 전에 이미 처리되어 있습니다.
 * ═══════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { signInWithGoogle } from './supabase.js';

const PALETTE = {
  primary: '#2828cd',
  primaryHover: '#1e1ea3',
  bg: '#fafaff',
  text: '#1a1a2e',
  textMuted: '#6b6b8a',
  border: 'rgba(120, 120, 225, 0.18)',
};

export function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      // OAuth 리디렉션이 발생하므로 여기 이후는 보통 실행되지 않음
      // 만약 redirect 가 안 되고 fail 도 throw 되지 않으면 다시 활성화
    } catch (e) {
      setBusy(false);
      setError(e?.message || '알 수 없는 오류가 발생했습니다');
    }
  };

  return (
    <>
      <style>{`
        @keyframes detente-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.brandBlock}>
          <h1 style={styles.brand}>détente</h1>
          <p style={styles.tagline}>당신의 작은 데탕트.</p>
        </div>

        <div style={styles.actionBlock}>
          <button
            onClick={handleSignIn}
            disabled={busy}
            style={{
              ...styles.googleBtn,
              opacity: busy ? 0.65 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
            aria-label="Google 계정으로 로그인"
          >
            {busy ? (
              <span style={styles.btnContent}>
                <Spinner />
                <span>Google 로그인 진행 중...</span>
              </span>
            ) : (
              <span style={styles.btnContent}>
                <GoogleLogo />
                <span>Google로 시작하기</span>
              </span>
            )}
          </button>

          {error && (
            <div role="alert" style={styles.errorBox}>
              로그인에 실패했습니다: {error}
            </div>
          )}

          <p style={styles.note}>
            기록은 안전하게 보관되며,
            <br />
            여러 기기에서 이어서 쓸 수 있어요.
          </p>
        </div>

        <div style={styles.footer}>
          <span>© détente</span>
        </div>
      </div>
    </div>
    </>
  );
}

/* ─── 작은 컴포넌트들 ─────────────────────────────────────────── */

function GoogleLogo() {
  // Google 공식 G 로고 SVG (Google Brand Resource Center 기준)
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      style={{ animation: 'detente-spin 0.9s linear infinite' }}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="20"
        opacity="0.85"
      />
    </svg>
  );
}

/* ─── inline styles (style 객체 분리로 빌드 검증 시 가독성↑) ─── */

const styles = {
  shell: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${PALETTE.bg} 0%, #f0f0ff 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", sans-serif',
    color: PALETTE.text,
  },
  card: {
    background: 'white',
    borderRadius: 20,
    padding: '48px 36px 32px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 30px rgba(40, 40, 205, 0.10)',
    border: `1px solid ${PALETTE.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
  },
  brandBlock: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  brand: {
    fontSize: 38,
    fontWeight: 600,
    letterSpacing: '-0.5px',
    margin: 0,
    color: PALETTE.primary,
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontStyle: 'italic',
  },
  tagline: {
    fontSize: 14,
    color: PALETTE.textMuted,
    margin: 0,
    letterSpacing: '0.2px',
  },
  actionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  googleBtn: {
    width: '100%',
    padding: '14px 18px',
    fontSize: 15,
    fontWeight: 500,
    background: 'white',
    color: '#3c4043',
    border: '1px solid #dadce0',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorBox: {
    width: '100%',
    padding: '10px 14px',
    background: '#fff5f5',
    border: '1px solid #ffd0d0',
    borderRadius: 8,
    color: '#c92a2a',
    fontSize: 13,
    lineHeight: 1.5,
  },
  note: {
    fontSize: 13,
    color: PALETTE.textMuted,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.55,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: PALETTE.textMuted,
    opacity: 0.6,
  },
};
