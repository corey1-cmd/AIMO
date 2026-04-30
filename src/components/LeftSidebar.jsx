/* LeftSidebar.jsx — 3개 페이지(Main, Record, Analysis)가 공통 사용
 * 메인 페이지의 5개 카드를 그대로 묶음.
 *
 * Props: records, onNavigate
 */

import { useMemo } from 'react';
import { TodayOverview } from './TodayOverview.jsx';
import { Top3 } from './Top3.jsx';
import { RecentCompleted } from './RecentCompleted.jsx';
import { QuickEntry } from './QuickEntry.jsx';
import { AIMOInfoCard } from './AIMOInfoCard.jsx';

export function LeftSidebar({ records, onNavigate }) {
  const stats = useMemo(() => {
    const count = records.length;
    if (!count) return { count: 0, avgSpeed: 0, weekCount: 0, weekMin: 0 };
    let totalEst = 0, totalAct = 0;
    for (const r of records) { totalEst += r.totalEstMin; totalAct += r.totalActualMin; }
    const avgSpeed = totalEst > 0 ? Math.round((totalAct / totalEst) * 100) : 100;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const wk = records.filter(r => new Date(r.date).getTime() >= weekAgo);
    const weekMin = wk.reduce((s, r) => s + r.totalActualMin, 0);
    return { count, avgSpeed, weekCount: wk.length, weekMin };
  }, [records]);

  const top3 = useMemo(() => {
    return [...records]
      .filter(r => r.rankLevel === 'fast')
      .sort((a, b) => (a.totalActualMin / a.totalEstMin) - (b.totalActualMin / b.totalEstMin))
      .slice(0, 3);
  }, [records]);

  const recent = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [records]);

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      minWidth: 0,
    }}>
      <TodayOverview stats={stats} />
      <Top3 records={top3} onSelect={(id) => onNavigate(`/record/${id}`)} />
      <RecentCompleted
        records={recent}
        onSelect={(id) => onNavigate(`/record/${id}`)}
        onSeeAll={() => onNavigate('/record')}
      />
      <QuickEntry onNavigate={onNavigate} />
      <AIMOInfoCard onLearnMore={() => onNavigate('/library')} />
    </aside>
  );
}
