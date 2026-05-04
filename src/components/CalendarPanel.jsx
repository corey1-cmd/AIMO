/* CalendarPanel.jsx — 좌측 사이드바 캘린더 (Atelier Cyan v6m)
 *
 * 다크 글래스. 헤더: CALENDAR / 새로고침 → (우측 아이콘)
 * - 연결되지 않음: "캘린더 연결" 버튼 → /settings 이동
 * - 연결됨: 오늘/내일/이번 주 이벤트 최대 5개
 *   각 항목: 시각 / 제목 / 시간대 표시
 * - 1분마다 자동 새로고침
 *
 * Props:
 *   onNavigate — 라우팅
 */

import { useEffect, useState } from 'react';
import { T2, T } from '../constants';
import { isSignedIn, listUpcomingEvents, hasGcalClientId } from '../calendar';

export function CalendarPanel({ onNavigate }) {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(() => isSignedIn());
  const [hasId, setHasId] = useState(() => hasGcalClientId());

  useEffect(() => {
    if (!signedIn) return;
    fetchEvents();
    const id = setInterval(fetchEvents, 60_000); // 1분 간격
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  // signedIn 상태 변경 폴링 (다른 탭에서 연결 시 반영)
  useEffect(() => {
    const id = setInterval(() => {
      const cur = isSignedIn();
      const curId = hasGcalClientId();
      if (cur !== signedIn) setSignedIn(cur);
      if (curId !== hasId) setHasId(curId);
    }, 3_000);
    return () => clearInterval(id);
  }, [signedIn, hasId]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const list = await listUpcomingEvents(7);
      setEvents(list || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: T2.font.weightSemibold,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.62)',
          fontFamily: T2.font.familyMono,
        }}>CALENDAR</span>
        {signedIn && (
          <button
            onClick={fetchEvents}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.42)',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: 10,
              fontFamily: T2.font.familyMono,
              padding: 0,
              letterSpacing: '0.04em',
            }}
          >{loading ? '…' : '↻'}</button>
        )}
      </div>

      {!hasId ? (
        <CalendarConnectPrompt onNavigate={onNavigate} message="캘린더 연동을 설정하세요" />
      ) : !signedIn ? (
        <CalendarConnectPrompt onNavigate={onNavigate} message="Google 계정 연결 필요" />
      ) : !events || events.length === 0 ? (
        <div style={{
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.42)',
          padding: '12px 4px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>{loading ? '불러오는 중…' : '예정된 일정이 없어요'}</div>
      ) : (
        <CalendarList events={events.slice(0, 5)} />
      )}
    </section>
  );
}

function CalendarConnectPrompt({ onNavigate, message }) {
  return (
    <div style={{
      padding: '12px 10px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.52)',
        marginBottom: 8,
        lineHeight: 1.5,
      }}>{message}</div>
      <button
        onClick={() => onNavigate?.('/settings')}
        style={{
          padding: '6px 14px',
          background: 'rgba(79, 224, 168, 0.10)',
          color: T2.color.accent,
          border: '1px solid rgba(79, 224, 168, 0.24)',
          borderRadius: 9999,
          cursor: 'pointer',
          fontSize: 11,
          fontFamily: 'inherit',
          fontWeight: T2.font.weightMedium,
          letterSpacing: '0.02em',
        }}
      >설정에서 연결 →</button>
    </div>
  );
}

function CalendarList({ events }) {
  // 오늘/내일/그 외로 그룹
  const groups = groupByDay(events);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {groups.map(g => (
        <div key={g.label}>
          <div style={{
            fontSize: 9.5,
            fontFamily: T2.font.familyMono,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.32)',
            textTransform: 'uppercase',
            marginBottom: 4,
            paddingLeft: 2,
          }}>{g.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {g.items.map(e => <CalendarRow key={e.id} event={e} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarRow({ event }) {
  const start = new Date(event.start);
  const isAllDay = !event.start.includes('T'); // dateTime 인지 date 인지로 판정
  const timeLabel = isAllDay
    ? '종일'
    : `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 9px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 8,
    }} title={event.title}>
      <span style={{
        fontSize: 10.5,
        fontFamily: T2.font.familyMono,
        color: T2.color.accent,
        fontWeight: T2.font.weightSemibold,
        minWidth: 36,
        flexShrink: 0,
      }}>{timeLabel}</span>
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: 11.5,
        color: '#FFFFFF',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{event.title}</span>
    </div>
  );
}

function groupByDay(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const todayItems = [], tomorrowItems = [], laterItems = [];

  for (const e of events) {
    const d = new Date(e.start);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) todayItems.push(e);
    else if (d.getTime() === tomorrow.getTime()) tomorrowItems.push(e);
    else laterItems.push(e);
  }

  const groups = [];
  if (todayItems.length) groups.push({ label: '오늘', items: todayItems });
  if (tomorrowItems.length) groups.push({ label: '내일', items: tomorrowItems });
  if (laterItems.length) groups.push({ label: '이후', items: laterItems });
  return groups;
}
