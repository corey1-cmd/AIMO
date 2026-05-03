/* ═══════════════════════════════════════════════════════════════
   calendar.js — Google Calendar 연동 (C안: 읽기 + 쓰기)
   
   OAuth 2.0 implicit flow (클라이언트 only).
   사용자 키: localStorage 'aimo-gcal-client-id', 'aimo-gcal-token'
   
   기능:
     - signIn() / signOut() — OAuth 토큰 획득/제거
     - listUpcomingEvents(days) — 향후 N일 이벤트 fetch
     - createEvent({title, start, end, description}) — 이벤트 등록
     - getDeadlinesAsFixed() — Focus 의 고정 시간 카드용 변환
   
   문서: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
        https://developers.google.com/calendar/api/v3/reference/events
   ═══════════════════════════════════════════════════════════════ */

const LS_CLIENT_ID = 'aimo-gcal-client-id';
const LS_TOKEN = 'aimo-gcal-token';
const LS_TOKEN_EXP = 'aimo-gcal-token-exp';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

export function getGcalClientId() {
  try { return localStorage.getItem(LS_CLIENT_ID) || null; } catch { return null; }
}
export function setGcalClientId(id) {
  try {
    if (!id) localStorage.removeItem(LS_CLIENT_ID);
    else localStorage.setItem(LS_CLIENT_ID, id);
  } catch {}
}
export function hasGcalClientId() {
  return !!getGcalClientId();
}

function getToken() {
  try {
    const t = localStorage.getItem(LS_TOKEN);
    const exp = parseInt(localStorage.getItem(LS_TOKEN_EXP) || '0', 10);
    if (!t || !exp || Date.now() > exp) return null;
    return t;
  } catch { return null; }
}
function setToken(token, expiresIn) {
  try {
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_TOKEN_EXP, String(Date.now() + (expiresIn - 60) * 1000));
  } catch {}
}
function clearToken() {
  try {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_TOKEN_EXP);
  } catch {}
}

export function isSignedIn() {
  return !!getToken();
}

/**
 * OAuth implicit flow — popup 을 띄워 토큰 획득
 * @returns {Promise<boolean>} 성공 여부
 */
export function signIn() {
  return new Promise((resolve, reject) => {
    const clientId = getGcalClientId();
    if (!clientId) {
      reject(new Error('Google Calendar 클라이언트 ID 가 설정되지 않았습니다. /settings 에서 입력해주세요.'));
      return;
    }

    // OAuth 콜백을 위한 redirect_uri — 현재 origin 사용
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const state = Math.random().toString(36).slice(2);

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('state', state);
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('prompt', 'consent');

    // 팝업 열기
    const w = 500, h = 600;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;
    const popup = window.open(
      url.toString(),
      'aimo-gcal-oauth',
      `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'));
      return;
    }

    // 팝업의 URL hash 변화를 폴링
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error('팝업이 닫혔습니다.'));
          return;
        }
        const popupUrl = popup.location.href;
        if (popupUrl.includes('access_token=')) {
          const hash = popup.location.hash.slice(1);
          const params = new URLSearchParams(hash);
          const token = params.get('access_token');
          const expiresIn = parseInt(params.get('expires_in') || '3600', 10);
          const returnedState = params.get('state');
          popup.close();
          clearInterval(interval);
          if (returnedState !== state) {
            reject(new Error('state 불일치 (CSRF 의심)'));
            return;
          }
          if (!token) {
            reject(new Error('토큰 누락'));
            return;
          }
          setToken(token, expiresIn);
          resolve(true);
        }
      } catch (e) {
        // cross-origin 동안에는 location 읽기 실패 — 무시
      }
    }, 400);

    // 안전 타임아웃 5분
    setTimeout(() => {
      clearInterval(interval);
      if (!popup.closed) popup.close();
      reject(new Error('OAuth 타임아웃'));
    }, 5 * 60 * 1000);
  });
}

export function signOut() {
  const token = getToken();
  if (token) {
    // 토큰 폐기 (best effort, 실패해도 로컬은 클리어)
    fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST' })
      .catch(() => {});
  }
  clearToken();
}

/**
 * 향후 N일 이벤트 fetch
 */
export async function listUpcomingEvents(days = 7) {
  const token = getToken();
  if (!token) return null;

  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 3600 * 1000);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 401) {
      clearToken();
      return null;
    }
    const json = await res.json();
    const items = (json.items || [])
      .filter(e => e.start && (e.start.dateTime || e.start.date))
      .map(e => ({
        id: e.id,
        title: e.summary || '(제목 없음)',
        start: e.start.dateTime || e.start.date,
        end: e.end?.dateTime || e.end?.date || null,
        location: e.location || '',
        description: e.description || '',
      }));
    return items;
  } catch (err) {
    console.warn('[calendar] listUpcomingEvents error:', err);
    return null;
  }
}

/**
 * 이벤트 등록 (분석 결과를 캘린더로 보내기)
 */
export async function createEvent({ title, start, end, description = '' }) {
  const token = getToken();
  if (!token) return null;

  const body = {
    summary: title,
    description,
    start: { dateTime: new Date(start).toISOString() },
    end: { dateTime: new Date(end).toISOString() },
  };

  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (res.status === 401) {
      clearToken();
      return null;
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[calendar] createEvent failed:', res.status, txt);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('[calendar] createEvent error:', err);
    return null;
  }
}

/**
 * 이벤트 → Focus 의 고정 시간 카드용 형태로 변환
 */
export function eventsToFixedItems(events, plan) {
  if (!Array.isArray(events) || !plan) return [];
  const planStart = plan.startedAt || Date.now();
  return events.map(e => {
    const startMs = new Date(e.start).getTime();
    const endMs = e.end ? new Date(e.end).getTime() : startMs + 30 * 60 * 1000;
    return {
      id: `gcal-${e.id}`,
      title: e.title,
      isFixed: true,
      isExternal: true,
      source: 'gcal',
      v3: { isFixed: true, fixedTime: e.start },
      startMs,
      endMs,
      estimatedMin: Math.max(5, Math.round((endMs - startMs) / 60000)),
      location: e.location,
    };
  });
}

/**
 * 분석 결과 plan 을 캘린더에 일괄 등록
 * @returns {Promise<{success, failed}>}
 */
export async function exportPlanToCalendar(plan, baseTime = Date.now()) {
  if (!plan || !Array.isArray(plan.items)) return { success: 0, failed: 0 };
  let cursor = baseTime;
  let success = 0, failed = 0;

  for (const item of plan.items) {
    if (!item || item.isMarker) continue;
    const durationMin = Math.max(5, item.estimatedMin || 10);
    const start = new Date(cursor);
    const end = new Date(cursor + durationMin * 60000);
    const result = await createEvent({
      title: `[AIMO] ${stripPrefix(item.title)}`,
      start: start.toISOString(),
      end: end.toISOString(),
      description: `AIMO 분석 결과로 자동 생성된 이벤트입니다.\n행동유형: ${item.behaviorType || '-'}`,
    });
    if (result) success++; else failed++;
    cursor = end.getTime();
  }
  return { success, failed };
}

function stripPrefix(title) {
  if (!title) return '';
  const idx = title.indexOf(' — ');
  return idx > 0 ? title.slice(idx + 3) : title;
}
