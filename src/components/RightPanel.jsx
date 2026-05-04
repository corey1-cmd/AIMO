/* RightPanel.jsx — 우측 컬럼 mode 컨테이너 (Atelier Cyan v6e — in-page analysis flow)
 *
 * 외부 mode (props.mode):
 *   'input'  → 내부 phase 'input' / 'analyzing' / 'result' 자체 처리
 *   'focus'  → FocusInline (현재 진행 세션)
 *
 * "분석 실행하기" 클릭 시 DistillPage 로 이동하지 않고 이 페이지 내부에서
 * 분석 → 결과 → 포커스 시작 흐름을 모두 처리합니다.
 *
 * Props:
 *   mode, activePlan, onResumeFocus, onCloseFocus, onShowGuide, onBack
 *   onStartPlan(plan) — 결과 확정 시 호출. 부모가 /focus/session 으로 이동.
 *   onAnalyze (legacy, 사용하지 않음 — 호환성 유지)
 */

import { useEffect, useState } from 'react';
import { T2, uid, T, formatMin, CATEGORIES } from '../constants';
import { runAnalysis, BEHAVIOR_TYPES } from '../engine';
import { loadLD } from '../learning';
import { WorkflowHeader } from './WorkflowHeader.jsx';
import { TaskInputCard } from './TaskInputCard.jsx';
import { AddTaskButton } from './AddTaskButton.jsx';
import { AnalyzeCTA } from './AnalyzeCTA.jsx';
import { ParserErrorCard } from './ParserErrorCard.jsx';
import { FocusInline } from './FocusInline.jsx';

const MAX_TASKS = 7;

// 내부 phase
const PH = { INPUT: 'input', ANALYZING: 'analyzing', RESULT: 'result' };

export function RightPanel({ mode, activePlan, onResumeFocus, onCloseFocus, onShowGuide, onBack, onStartPlan }) {
  const [tasks, setTasks] = useState([{ id: uid(), title: '', fixedTime: false, freePlace: false }]);
  const [phase, setPhase] = useState(PH.INPUT);
  const [aStep, setAStep] = useState(0); // 분석 진행 단계 0~3
  const [error, setError] = useState(null);
  const [learnData, setLearnData] = useState(null);

  // 분석 결과
  const [breakdown, setBreakdown] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [totalEst, setTotalEst] = useState(0);

  const [renderedMode, setRenderedMode] = useState(mode);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => { setLearnData(loadLD()); }, []);

  useEffect(() => {
    if (mode === renderedMode) return;
    setOpacity(0);
    const t = setTimeout(() => {
      setRenderedMode(mode);
      setOpacity(1);
    }, 320);
    return () => clearTimeout(t);
  }, [mode, renderedMode]);

  const addTask = () => {
    if (tasks.length >= MAX_TASKS) return;
    setTasks([...tasks, { id: uid(), title: '', fixedTime: false, freePlace: false }]);
  };
  const removeTask = (id) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter(t => t.id !== id));
  };
  const updateTask = (next) => {
    setTasks(tasks.map(t => t.id === next.id ? next : t));
  };
  const resetToInput = () => {
    setPhase(PH.INPUT);
    setBreakdown([]); setAnalyses([]); setTotalEst(0);
    setError(null);
  };

  const validCount = tasks.filter(t => t.title.trim()).length;

  const handleAnalyze = () => {
    const valid = tasks.filter(t => t.title.trim());
    if (valid.length === 0) return;
    setError(null);
    setPhase(PH.ANALYZING);
    setAStep(0);

    // 단계별 진행 시뮬레이션 (실제 분석은 즉시 실행되지만 사용자에게 진행감 제공)
    setTimeout(() => setAStep(1), 350);
    setTimeout(() => setAStep(2), 900);
    setTimeout(() => {
      setAStep(3);
      try {
        // runAnalysis는 { title, hasFixed?, fixedTime? } 를 받음.
        // 우리 task 모델을 매핑.
        const mapped = valid.map(t => ({
          title: t.title.trim(),
          hasFixed: false,         // 향후 시간 입력 UI 추가 시 채우면 됨
          fixedTime: '',
        }));
        const r = runAnalysis(mapped, learnData?.stats || learnData);
        if (!r.breakdown || r.breakdown.length === 0) {
          setError([{ title: '분해 결과가 비어있어요. 더 구체적인 표현으로 다시 시도해보세요.' }]);
          setPhase(PH.INPUT);
          return;
        }
        setBreakdown(r.breakdown);
        setAnalyses(r.analyses || []);
        setTotalEst(r.totalEstMin || 0);
        setTimeout(() => setPhase(PH.RESULT), 400);
      } catch (e) {
        console.error('[RightPanel] analyze error:', e);
        setError([{ title: '분석 중 오류가 발생했어요: ' + (e?.message || 'unknown') }]);
        setPhase(PH.INPUT);
      }
    }, 1500);
  };

  const handleStartFocus = () => {
    if (!breakdown || breakdown.length === 0) return;
    const items = breakdown
      .filter(b => !b.isMarker)
      .map(b => ({ ...b, actualMin: null, status: 'pending' }));
    const sourceTitles = tasks.filter(t => t.title.trim()).map(t => t.title);
    onStartPlan?.({
      items,
      curIdx: 0,
      startTimes: { 0: Date.now() },
      startedAt: Date.now(),
      sourceTasks: sourceTitles,
    });
  };

  return (
    <section style={{
      width: '100%',
      transition: 'opacity 320ms ease',
      opacity,
    }}>
      {renderedMode === 'focus' ? (
        <FocusInline
          plan={activePlan}
          onResume={onResumeFocus}
          onClose={onCloseFocus}
        />
      ) : phase === PH.INPUT ? (
        <>
          <WorkflowHeader onBack={onBack} onShowGuide={onShowGuide} />

          {error && (
            <ParserErrorCard
              unrecognized={error}
              onClose={() => setError(null)}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {tasks.map((task, i) => (
              <TaskInputCard
                key={task.id}
                index={i}
                task={task}
                canRemove={tasks.length > 1}
                onChange={updateTask}
                onRemove={() => removeTask(task.id)}
              />
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginTop: 8,
          }}>
            <AddTaskButton
              onClick={addTask}
              disabled={tasks.length >= MAX_TASKS}
            />
            <AnalyzeCTA
              onClick={handleAnalyze}
              disabled={validCount === 0}
              count={validCount}
            />
          </div>
        </>
      ) : phase === PH.ANALYZING ? (
        <AnalyzingView aStep={aStep} hasLearn={!!learnData} />
      ) : (
        <ResultView
          breakdown={breakdown}
          analyses={analyses}
          totalEst={totalEst}
          onBack={resetToInput}
          onStart={handleStartFocus}
        />
      )}
    </section>
  );
}


/* ─── ANALYZING view ─────────────────────────────────────── */

function AnalyzingView({ aStep, hasLearn }) {
  const steps = [
    { l: '키워드 분석 · 행동유형 분류', s: 1 },
    { l: 'Skinner 분해 · Simon 청킹',  s: 2 },
    { l: 'Quick-Win 최적 순서 배치',   s: 3 },
  ];
  return (
    <div style={{
      padding: '60px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      minHeight: 480,
      justifyContent: 'center',
    }}>
      {/* 펄싱 원형 spinner */}
      <div style={{
        position: 'relative',
        width: 88, height: 88,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div aria-hidden style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px solid rgba(0, 82, 45, 0.10)`,
          borderTopColor: T2.color.primary,
          animation: 'spin 1.1s linear infinite',
        }} />
        <div aria-hidden style={{
          position: 'absolute',
          inset: 14,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 224, 168, 0.18) 0%, transparent 70%)',
          animation: 'cyanPulse 2.4s ease-in-out infinite',
        }} />
        <div style={{
          width: 14, height: 14,
          borderRadius: '50%',
          background: T2.color.accent,
          boxShadow: `0 0 16px ${T2.color.accent}`,
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 18,
          fontWeight: T2.font.weightSemibold,
          color: T2.color.text,
          letterSpacing: T2.font.tracking.tight,
          marginBottom: 6,
        }}>분석 엔진 처리 중{hasLearn ? ' · 학습 데이터 반영' : ''}</div>
        <div style={{ fontSize: 12, color: T2.color.textMuted }}>
          행동유형 분류 → 단계 분해 → 시간 배치를 자동으로 산정합니다
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 280 }}>
        {steps.map(({ l, s }) => {
          const done = aStep > s;
          const active = aStep === s;
          return (
            <div key={s} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: active ? 'rgba(232, 244, 237, 0.50)' : 'transparent',
              border: `1px solid ${active ? 'rgba(0, 82, 45, 0.10)' : 'transparent'}`,
              borderRadius: 10,
              transition: 'all 240ms ease',
            }}>
              <span aria-hidden style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: done ? T2.color.primary : (active ? T2.color.accent : 'rgba(24, 29, 25, 0.18)'),
                boxShadow: active ? `0 0 6px ${T2.color.accent}` : 'none',
                flexShrink: 0,
                transition: 'all 240ms ease',
              }} />
              <span style={{
                fontSize: 12.5,
                color: done ? T2.color.text : (active ? T2.color.text : T2.color.textMuted),
                fontWeight: active ? T2.font.weightMedium : T2.font.weightRegular,
              }}>{l}</span>
              {done && <span style={{ marginLeft: 'auto', color: T2.color.primary, fontSize: 12 }}>✓</span>}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}


/* ─── RESULT view ────────────────────────────────────────── */

function ResultView({ breakdown, analyses, totalEst, onBack, onStart }) {
  const items = breakdown.filter(b => !b.isMarker);

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: T2.font.weightMedium,
            color: T2.color.textSecondary,
            background: 'rgba(255, 255, 255, 0.65)',
            border: `1px solid ${'rgba(47, 36, 30, 0.14)'}`,
            borderRadius: 9999,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span aria-hidden>←</span>
          <span>다시 입력</span>
        </button>
        <h1 style={{
          margin: 0,
          fontFamily: T2.font.familyDisplay,
          fontSize: 32,
          fontWeight: T2.font.weightSemibold,
          letterSpacing: T2.font.tracking.tightest,
          color: T2.color.text,
        }}>분석 결과</h1>
        <span style={{
          padding: '4px 11px',
          fontSize: 11,
          fontFamily: T2.font.familyMono,
          color: T2.color.primary,
          background: T2.color.accent,
          borderRadius: 9999,
          letterSpacing: '0.04em',
        }}>Step 2</span>
      </div>

      {/* 요약 메트릭 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        <SummaryStat label="총 단계" value={items.length} suffix="개" />
        <SummaryStat label="예상 시간" value={formatMin(totalEst).replace(/\s+/g, '')} mono />
        <SummaryStat label="작업 유형" value={uniqueTypes(analyses)} suffix="종" accent />
      </div>

      {/* 행동 유형 미리보기 */}
      {analyses.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 20,
        }}>
          {analyses.slice(0, 6).map((a, i) => {
            const bt = BEHAVIOR_TYPES[a.type] || BEHAVIOR_TYPES.COGNITIVE;
            return (
              <span key={i} style={{
                fontSize: 11,
                padding: '5px 10px',
                background: 'white',
                border: `1px solid ${bt.color}24`,
                color: bt.color,
                borderRadius: 9999,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span aria-hidden style={{
                  width: 6, height: 6, borderRadius: '50%', background: bt.color,
                }} />
                {bt.label} · {a.title.length > 12 ? a.title.slice(0, 12) + '…' : a.title}
              </span>
            );
          })}
        </div>
      )}

      {/* 실행 순서 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.55)',
        border: '1px solid rgba(0, 82, 45, 0.06)',
        borderRadius: 18,
        padding: '20px 22px',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0, 32, 18, 0.04)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: T2.font.weightSemibold,
            color: T2.color.text,
          }}>실행 순서</span>
          <span style={{ fontSize: 11, color: T2.color.textMuted, fontFamily: T2.font.familyMono }}>
            {items.length} steps
          </span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {breakdown.map((b, i) => {
            if (b.isMarker) {
              return (
                <li key={b.id || i} style={{
                  padding: '8px 14px',
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: T2.font.weightSemibold,
                  color: T2.color.primary,
                  background: T2.color.surfaceSoft,
                  borderRadius: 8,
                  margin: '4px 0',
                }}>{b.shortTitle}</li>
              );
            }
            const cat = CATEGORIES.find(c => c.key === b.cat) || CATEGORIES[CATEGORIES.length - 1];
            const bt = BEHAVIOR_TYPES[b.behaviorType] || BEHAVIOR_TYPES.COGNITIVE;
            return (
              <li key={b.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: 'white',
                border: '1px solid rgba(0, 82, 45, 0.06)',
                borderRadius: 12,
              }}>
                <span style={{
                  width: 26, height: 26,
                  borderRadius: 8,
                  background: `${bt.color}1A`,
                  color: bt.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: T2.font.weightSemibold,
                  fontFamily: T2.font.familyMono,
                  flexShrink: 0,
                }}>{indexOfNonMarker(breakdown, i) + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: T2.font.weightMedium, color: T2.color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.v3?.isFixed && <span style={{ marginRight: 4 }}>🔒</span>}
                    {b.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: T2.color.textMuted, marginTop: 2 }}>
                    <span style={{ color: cat.color }}>● </span>{cat.label} · {bt.label}
                  </div>
                </div>
                <span style={{
                  fontSize: 12,
                  fontFamily: T2.font.familyMono,
                  color: T2.color.textSecondary,
                  flexShrink: 0,
                }}>{formatMin(b.estimatedMin)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 포커스 시작 CTA */}
      <button
        onClick={onStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          width: '100%',
          padding: '20px 28px',
          background: 'rgba(28, 26, 24, 0.92)',
          backdropFilter: '20px',
          WebkitBackdropFilter: '20px',
          border: `1px solid ${'rgba(255,255,255,0.06)'}`,
          borderRadius: 18,
          color: '#FFFFFF',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 16,
          fontWeight: T2.font.weightSemibold,
          letterSpacing: T2.font.tracking.tight,
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.20)',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 16px 44px rgba(0, 82, 45, 0.20), 0 1px 0 rgba(255,255,255,0.06) inset';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.20)';
        }}
      >
        포커스 모드 시작 <span aria-hidden style={{ marginLeft: 4 }}>→</span>
      </button>
    </div>
  );
}

function indexOfNonMarker(arr, idx) {
  let n = 0;
  for (let i = 0; i < idx; i++) if (!arr[i]?.isMarker) n++;
  return n;
}

function uniqueTypes(analyses) {
  const s = new Set();
  for (const a of analyses) s.add(a.type);
  return s.size;
}

function SummaryStat({ label, value, suffix, mono, accent }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255, 255, 255, 0.55)',
      border: '1px solid rgba(0, 82, 45, 0.06)',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span style={{ fontSize: 11, color: T2.color.textMuted, letterSpacing: '0.02em' }}>{label}</span>
      <span style={{
        fontSize: 22,
        fontWeight: T2.font.weightSemibold,
        color: accent ? T2.color.primary : T2.color.text,
        fontFamily: mono ? T2.font.familyMono : T2.font.familyDisplay,
        letterSpacing: T2.font.tracking.tightest,
        lineHeight: 1.1,
      }}>
        {value}{suffix && <span style={{ fontSize: 12, fontWeight: T2.font.weightRegular, color: T2.color.textMuted, marginLeft: 3 }}>{suffix}</span>}
      </span>
    </div>
  );
}
