/* RecordPage.jsx — Tasks Record 페이지 (사용자 시안 1 기준)
 *
 * 구성:
 *   - 헤더: Tasks Record h1 + sub + sine wave 데코
 *   - 카테고리 칩 필터 (전체 + 8개 카테고리)
 *   - 우측 상단: 정렬 드롭다운 + 리스트/그리드 뷰 토글
 *   - 테이블: 작업이름 / 카테고리 / 할 일 / 예상 / 실제 / 속도 / 날짜 / 상태 / 메뉴
 *
 * Props: records, savedIds, onToggleSave, onNavigate
 */

import { useState, useMemo } from 'react';
import { T, CATEGORIES, formatMin, formatDate } from '../constants';

const SORT_OPTIONS = [
  { key: 'recent', label: '최신순' },
  { key: 'fast',   label: '빠른 순' },
  { key: 'slow',   label: '느린 순' },
  { key: 'old',    label: '오래된 순' },
];

export function RecordPage({ records, savedIds, onToggleSave, onNavigate }) {
  const [filterCat, setFilterCat] = useState('all');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('list'); // 'list' | 'grid'

  const filtered = useMemo(() => {
    let arr = [...records];
    if (filterCat !== 'all') {
      arr = arr.filter(r => (r.categories || []).includes(filterCat));
    }
    switch (sort) {
      case 'fast':
        arr.sort((a, b) => (a.totalActualMin / a.totalEstMin) - (b.totalActualMin / b.totalEstMin));
        break;
      case 'slow':
        arr.sort((a, b) => (b.totalActualMin / b.totalEstMin) - (a.totalActualMin / a.totalEstMin));
        break;
      case 'old':
        arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      default:
        arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return arr;
  }, [records, filterCat, sort]);

  return (
    <section style={{ position: 'relative' }}>
      <Header />

      {/* 칩 필터 + 정렬 + 뷰 토글 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 24,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <Chips active={filterCat} onChange={setFilterCat} />
        <div style={{ flex: 1 }} />
        <SortDropdown value={sort} onChange={setSort} />
        <ViewToggle value={view} onChange={setView} />
      </div>

      {/* 테이블 또는 그리드 */}
      {filtered.length === 0 ? (
        <Empty />
      ) : view === 'list' ? (
        <Table records={filtered} savedIds={savedIds} onToggleSave={onToggleSave} onNavigate={onNavigate} />
      ) : (
        <Grid records={filtered} savedIds={savedIds} onToggleSave={onToggleSave} onNavigate={onNavigate} />
      )}
    </section>
  );
}

/* ─── 헤더 ───────────────────────────────────────────────────── */

function Header() {
  return (
    <header style={{ position: 'relative' }}>
      <h1 style={{
        margin: 0,
        fontFamily: T.font_.familyDisplay,
        fontSize: 44,
        fontWeight: T.font_.weight.bold,
        letterSpacing: T.font_.tracking.tight,
        lineHeight: T.font_.leading.tight,
        color: T.color.textPrimary,
      }}>
        Tasks Record
      </h1>
      <p style={{
        margin: '8px 0 0',
        fontSize: T.font_.size.body,
        color: T.color.textSecondary,
        lineHeight: T.font_.leading.relaxed,
      }}>
        작업 기록을 통해 나의 집중력과 속도 변화를 확인해보세요.
      </p>

      {/* 우측 상단 sine wave 데코 */}
      <svg
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 380,
          height: 80,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rec-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={T.color.primary} stopOpacity="0" />
            <stop offset="60%" stopColor={T.color.primary} stopOpacity="0.35" />
            <stop offset="100%" stopColor={T.color.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 40 Q 75 10 150 40 T 300 40 T 450 40 T 600 40"
          fill="none"
          stroke="url(#rec-wave)"
          strokeWidth="1.5"
        />
        {/* 작은 점들 */}
        {Array.from({ length: 18 }, (_, i) => {
          const x = 30 + i * 32;
          const y = 40 + Math.sin(i * 0.5) * 24;
          return <circle key={i} cx={x} cy={y} r="1.5" fill={T.color.primary} opacity={0.25} />;
        })}
      </svg>
    </header>
  );
}

/* ─── 칩 필터 ─────────────────────────────────────────────────── */

function Chips({ active, onChange }) {
  const items = [{ key: 'all', label: '전체' }, ...CATEGORIES.map(c => ({ key: c.key, label: c.label }))];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(c => {
        const on = active === c.key;
        return (
          <button
            key={c.key}
            onClick={() => onChange(c.key)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: T.font_.weight.medium,
              fontFamily: 'inherit',
              background: on ? T.color.primary : 'transparent',
              color: on ? 'white' : T.color.textSecondary,
              border: on ? 'none' : `1px solid ${T.color.borderStrong}`,
              borderRadius: T.radius.pill,
              cursor: 'pointer',
              transition: 'background 200ms ease, color 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (on) return;
              e.currentTarget.style.background = T.color.mintSoft;
              e.currentTarget.style.color = T.color.primary;
            }}
            onMouseLeave={(e) => {
              if (on) return;
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = T.color.textSecondary;
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── 정렬 드롭다운 ───────────────────────────────────────────── */

function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: T.font_.weight.medium,
        fontFamily: 'inherit',
        color: T.color.textPrimary,
        background: T.color.bgCard,
        border: `1px solid ${T.color.borderStrong}`,
        borderRadius: T.radius.md,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {SORT_OPTIONS.map(o => (
        <option key={o.key} value={o.key}>{o.label}</option>
      ))}
    </select>
  );
}

/* ─── 뷰 토글 ─────────────────────────────────────────────────── */

function ViewToggle({ value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: T.color.bgCard,
      border: `1px solid ${T.color.borderStrong}`,
      borderRadius: T.radius.md,
      padding: 2,
    }}>
      <ToggleBtn icon={<ListIcon />} on={value === 'list'} onClick={() => onChange('list')} />
      <ToggleBtn icon={<GridIcon />} on={value === 'grid'} onClick={() => onChange('grid')} />
    </div>
  );
}

function ToggleBtn({ icon, on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        background: on ? T.color.mintSoft : 'transparent',
        color: on ? T.color.primary : T.color.textMuted,
        border: 'none',
        borderRadius: T.radius.sm,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 200ms ease, color 200ms ease',
      }}
    >
      {icon}
    </button>
  );
}

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

/* ─── 테이블 (list view) ──────────────────────────────────────── */

function Table({ records, savedIds, onToggleSave, onNavigate }) {
  return (
    <div style={{
      background: T.color.bgCard,
      borderRadius: T.radius.lg,
      boxShadow: T.shadow.ambient,
      border: `1px solid ${T.color.border}`,
      overflow: 'hidden',
    }}>
      <TableHeader />
      <div>
        {records.map(r => (
          <Row
            key={r.id}
            record={r}
            saved={savedIds.includes(r.id)}
            onToggleSave={() => onToggleSave(r.id)}
            onClick={() => onNavigate(`/record/${r.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function TableHeader() {
  const colStyle = {
    fontSize: 12,
    fontWeight: T.font_.weight.semibold,
    color: T.color.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.6fr 0.9fr 0.7fr 0.8fr 0.8fr 1.1fr 0.9fr 0.8fr 40px',
      gap: 16,
      alignItems: 'center',
      padding: '14px 24px',
      borderBottom: `1px solid ${T.color.divider}`,
      background: T.color.bgPage,
    }}>
      <span style={colStyle}>작업 이름</span>
      <span style={colStyle}>할 일</span>
      <span style={colStyle}>소요 시간 ›</span>
      <span style={{ ...colStyle, textAlign: 'right' }}>예상</span>
      <span style={{ ...colStyle, textAlign: 'right' }}>실제</span>
      <span style={colStyle}>속도 (실제/예상)</span>
      <span style={colStyle}>날짜</span>
      <span style={colStyle}>상태</span>
      <span />
    </div>
  );
}

function Row({ record, saved, onToggleSave, onClick }) {
  const ratio = record.totalEstMin > 0
    ? Math.round((record.totalActualMin / record.totalEstMin) * 100)
    : 0;
  const fast = ratio <= 100;
  const cat = (record.categories && record.categories[0]) || null;
  const catMeta = CATEGORIES.find(c => c.key === cat);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 0.9fr 0.7fr 0.8fr 0.8fr 1.1fr 0.9fr 0.8fr 40px',
        gap: 16,
        alignItems: 'center',
        padding: '18px 24px',
        borderBottom: `1px solid ${T.color.divider}`,
        cursor: 'pointer',
        transition: 'background 180ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.color.mintSoft; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
      }}>
        <span style={{
          fontSize: T.font_.size.body,
          fontWeight: T.font_.weight.semibold,
          color: T.color.textPrimary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {record.title}
        </span>
      </div>

      <div>
        {catMeta && (
          <span style={{
            fontSize: 11,
            fontWeight: T.font_.weight.medium,
            color: T.color.textSecondary,
            background: T.color.mintSoft,
            padding: '4px 10px',
            borderRadius: T.radius.pill,
            whiteSpace: 'nowrap',
          }}>
            {catMeta.label}
          </span>
        )}
      </div>

      <span style={{ fontSize: 13, color: T.color.textSecondary }}>
        {record.taskCount || (record.tasks?.length ?? 0)}개 할 일
      </span>

      <span style={{
        fontSize: 13,
        color: T.color.textSecondary,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatMin(record.totalEstMin)}
      </span>

      <span style={{
        fontSize: 13,
        color: T.color.textPrimary,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: T.font_.weight.medium,
      }}>
        {formatMin(record.totalActualMin)}
      </span>

      <SpeedBar ratio={ratio} fast={fast} />

      <span style={{
        fontSize: 12,
        color: T.color.textSecondary,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatDate(record.date)}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        style={{
          fontSize: 11,
          fontWeight: T.font_.weight.medium,
          color: saved ? T.color.primary : T.color.textMuted,
          background: saved ? T.color.mintSoft : 'transparent',
          border: saved ? 'none' : `1px solid ${T.color.borderStrong}`,
          padding: '4px 12px',
          borderRadius: T.radius.pill,
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        {saved ? '저장됨' : '저장'}
      </button>

      <button
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 32,
          height: 32,
          background: 'transparent',
          border: 'none',
          color: T.color.textMuted,
          cursor: 'pointer',
          borderRadius: '50%',
          fontSize: 16,
        }}
        aria-label="더보기"
      >
        ⋯
      </button>
    </div>
  );
}

function SpeedBar({ ratio, fast }) {
  const width = Math.min(140, Math.max(10, ratio));
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        flex: 1,
        maxWidth: 100,
        height: 4,
        background: T.color.divider,
        borderRadius: T.radius.pill,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${width}%`,
          height: '100%',
          background: fast ? T.color.primary : T.color.warning,
        }} />
      </div>
      <span style={{
        fontSize: 13,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        {ratio}%
      </span>
    </div>
  );
}

/* ─── 그리드 뷰 ───────────────────────────────────────────────── */

function Grid({ records, savedIds, onToggleSave, onNavigate }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
    }}>
      {records.map(r => {
        const ratio = r.totalEstMin > 0
          ? Math.round((r.totalActualMin / r.totalEstMin) * 100)
          : 0;
        const fast = ratio <= 100;
        const cat = (r.categories && r.categories[0]) || null;
        const catMeta = CATEGORIES.find(c => c.key === cat);
        const saved = savedIds.includes(r.id);

        return (
          <div
            key={r.id}
            onClick={() => onNavigate(`/record/${r.id}`)}
            style={{
              background: T.color.bgCard,
              borderRadius: T.radius.lg,
              padding: 20,
              boxShadow: T.shadow.ambient,
              border: `1px solid ${T.color.border}`,
              cursor: 'pointer',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = T.shadow.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = T.shadow.ambient;
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{
                fontSize: T.font_.size.body,
                fontWeight: T.font_.weight.semibold,
                color: T.color.textPrimary,
                lineHeight: T.font_.leading.normal,
              }}>{r.title}</span>
              {catMeta && (
                <span style={{
                  fontSize: 11,
                  fontWeight: T.font_.weight.medium,
                  color: T.color.textSecondary,
                  background: T.color.mintSoft,
                  padding: '3px 9px',
                  borderRadius: T.radius.pill,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>{catMeta.label}</span>
              )}
            </div>

            <SpeedBar ratio={ratio} fast={fast} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: T.color.textMuted,
              fontVariantNumeric: 'tabular-nums',
              paddingTop: 12,
              borderTop: `1px solid ${T.color.divider}`,
            }}>
              <span>{formatDate(r.date)} · {formatMin(r.totalActualMin)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSave(r.id); }}
                style={{
                  fontSize: 11,
                  fontWeight: T.font_.weight.medium,
                  color: saved ? T.color.primary : T.color.textMuted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >{saved ? '★ 저장됨' : '☆ 저장'}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────── */

function Empty() {
  return (
    <div style={{
      background: T.color.bgCard,
      borderRadius: T.radius.lg,
      padding: '64px 24px',
      boxShadow: T.shadow.ambient,
      border: `1px solid ${T.color.border}`,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 32,
        marginBottom: 12,
      }} aria-hidden="true">📭</div>
      <div style={{
        fontSize: T.font_.size.title,
        fontWeight: T.font_.weight.semibold,
        color: T.color.textPrimary,
        marginBottom: 6,
      }}>아직 기록이 없어요</div>
      <div style={{
        fontSize: T.font_.size.caption,
        color: T.color.textMuted,
      }}>분석을 마친 기록이 여기에 모입니다.</div>
    </div>
  );
}
