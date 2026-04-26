/* ═══════════════════════════════════════════════════════════════
 * src/auth/LoginPage.jsx
 *
 * Hard Gate 로그인 페이지.
 * status === 'unauthenticated' 일 때 App.jsx 가 이 컴포넌트만 렌더합니다.
 *
 * 2026-04-26 patch-v6a-hardgate-v2 → v6a-hardgate-v3 (시각 시스템 교정):
 *   시니어 2 종합 검토에 따라 PALETTE 를 Sprout 디자인 가이드로 전면 교체.
 *   - 색상: 블루-퍼플 (#2828cd) → deep forest (#00522d)
 *   - 폰트: Cormorant Garamond → Plus Jakarta Sans 800 italic
 *   - shadow: 0 8px 30px rgba(40,40,205,0.10) → Sprout ambient
 *   - 배경: 보라빛 화이트 → 민트 화이트 그라디언트
 *
 * 동작 로직은 한 줄도 변경되지 않음. 시각 토큰만 교체.
 *
 * 디자인 원칙 (디자이너 Lenu §5 + product context §7-1 일치):
 *   - 단일 큰 Google 버튼이 시각적 중심
 *   - 브랜딩(détente) 이 위에 배치되어 정체성 노출
 *   - 가치 제안 한 줄
 *   - 버튼 클릭 시 즉시 spinner 로 OAuth 대기시간 부담 완화
 *   - flash 방지: AuthProvider 의 'loading' 상태에서 이 페이지 진입 자체 차단
 * ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { signInWithGoogle } from './supabase.js';
import {
  detectInAppBrowser,
  tryOpenInExternalBrowser,
  getGuidanceMessage,
} from './inAppBrowser.js';

/* Sprout 디자인 가이드 토큰 (constants.js T 와 일치). */
const PALETTE = {
  primary: '#00522d',        // deep forest — 메인 CTA
  primaryHover: '#003d22',
  accent2: '#466557',        // sage green — 보조
  mint: '#c5e8d6',           // secondary container
  bg: '#f6fbf4',             // 메인 배경
  bgCard: '#ffffff',         // 카드 표면
  bgGradientEnd: '#ebefe8',  // 그라디언트 끝점 (subtle)
  text: '#181d19',           // 본문
  textMuted: '#6f7a70',      // 캡션
  border: 'rgba(45, 75, 62, 0.10)',
  shadowAmbient: '0 4px 24px rgba(45, 75, 62, 0.05)',
  shadowRaised: '0 8px 32px rgba(45, 75, 62, 0.12)',
};

const FONT_STACK = "'Plus Jakarta Sans','Noto Sans KR','Pretendard',-apple-system,BlinkMacSystemFont,sans-serif";

export function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [inApp, setInApp] = useState(null);

  // 페이지 진입 시 인앱 브라우저 감지 (1회)
  useEffect(() => {
    const detected = detectInAppBrowser();
    if (detected) setInApp(detected);
  }, []);

  const handleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setBusy(false);
      setError(e?.message || '알 수 없는 오류가 발생했습니다');
    }
  };

  const handleOpenExternal = () => {
    tryOpenInExternalBrowser();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
        @keyframes detente-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes detente-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={styles.brandBlock}>
            <h1 style={styles.brand}>détente</h1>
            <p style={styles.tagline}>당신의 작은 데탕트.</p>
          </div>

          {inApp ? (
            <InAppBrowserNotice browser={inApp} onOpenExternal={handleOpenExternal} />
          ) : (
            <NormalLoginBlock
              busy={busy}
              error={error}
              onSignIn={handleSignIn}
            />
          )}

          <div style={styles.footer}>
            <span>© détente</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── 정상 로그인 블록 (인앱 브라우저 아닐 때) ──────────────── */

function NormalLoginBlock({ busy, error, onSignIn }) {
  return (
    <div style={styles.actionBlock}>
      <button
        onClick={onSignIn}
        disabled={busy}
        style={{
          ...styles.googleBtn,
          opacity: busy ? 0.65 : 1,
          cursor: busy ? 'wait' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (busy) return;
          e.currentTarget.style.boxShadow = PALETTE.shadowRaised;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
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
  );
}

/* ─── 인앱 브라우저 안내 블록 ────────────────────────────────── */

function InAppBrowserNotice({ browser, onOpenExternal }) {
  const guide = getGuidanceMessage(browser);

  return (
    <div style={styles.actionBlock}>
      <div style={styles.warnIcon} aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={PALETTE.accent2} strokeWidth="2" />
          <path d="M12 7v6" stroke={PALETTE.accent2} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.2" fill={PALETTE.accent2} />
        </svg>
      </div>

      <h2 style={styles.guideTitle}>{guide.title}</h2>
      <p style={styles.guideBody}>{guide.body}</p>

      {guide.autoFix && guide.primaryAction && (
        <button
          onClick={onOpenExternal}
          style={styles.primaryBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = PALETTE.primaryHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = PALETTE.primary; }}
        >
          {guide.primaryAction}
        </button>
      )}

      {!guide.autoFix && (
        <div style={styles.urlBox}>
          <div style={styles.urlBoxLabel}>또는 아래 주소를 직접 복사해서 브라우저에 붙여넣으세요</div>
          <code style={styles.urlBoxCode}>
            {typeof window !== 'undefined' ? window.location.origin : 'https://aimo-seven.vercel.app'}
          </code>
        </div>
      )}
    </div>
  );
}

/* ─── 작은 컴포넌트들 ─────────────────────────────────────────── */

function GoogleLogo() {
  // Google 공식 G 로고 SVG (Google Brand Resource Center 기준 — 변경 금지)
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

/* ─── inline styles (Sprout 토큰 적용) ─────────────────────── */

const styles = {
  shell: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${PALETTE.bg} 0%, ${PALETTE.bgGradientEnd} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: FONT_STACK,
    color: PALETTE.text,
  },
  card: {
    background: PALETTE.bgCard,
    borderRadius: 24,
    padding: '48px 36px 32px',
    width: '100%',
    maxWidth: 420,
    boxShadow: PALETTE.shadowAmbient,
    border: `1px solid ${PALETTE.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
    animation: 'detente-fade-in 380ms ease-out both',
  },
  brandBlock: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  brand: {
    // Sprout 가이드 일관: Plus Jakarta Sans 800 italic + deep forest
    // 메인 페이지의 .nav-logo (22px 800 detente) 와 동일 톤, 크기만 hero 사이즈
    fontSize: 42,
    fontWeight: 800,
    fontStyle: 'italic',
    letterSpacing: '-0.025em',
    margin: 0,
    color: PALETTE.primary,
    fontFamily: FONT_STACK,
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: 14,
    color: PALETTE.textMuted,
    margin: 0,
    letterSpacing: '0.02em',
    fontWeight: 500,
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
    fontWeight: 600,
    background: PALETTE.bgCard,
    color: '#3c4043',
    border: '1px solid #dadce0',
    borderRadius: 9999,  // Sprout pill CTA
    cursor: 'pointer',
    transition: 'box-shadow 200ms, transform 200ms, border-color 200ms',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontFamily: FONT_STACK,
    letterSpacing: '0.01em',
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
    borderRadius: 12,
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
  warnIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: 700,
    margin: 0,
    color: PALETTE.text,
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: '-0.005em',
  },
  guideBody: {
    fontSize: 14,
    color: PALETTE.textMuted,
    margin: 0,
    lineHeight: 1.6,
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px 18px',
    fontSize: 15,
    fontWeight: 700,
    background: PALETTE.primary,
    color: 'white',
    border: 'none',
    borderRadius: 9999,
    cursor: 'pointer',
    transition: 'background 200ms, transform 200ms',
    fontFamily: FONT_STACK,
    boxShadow: '0 4px 24px rgba(45, 75, 62, 0.18)',
    letterSpacing: '0.01em',
  },
  urlBox: {
    width: '100%',
    padding: '12px 14px',
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  urlBoxLabel: {
    fontSize: 12,
    color: PALETTE.textMuted,
    lineHeight: 1.5,
  },
  urlBoxCode: {
    fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    color: PALETTE.text,
    wordBreak: 'break-all',
    background: 'transparent',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: PALETTE.textMuted,
    opacity: 0.6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
};
