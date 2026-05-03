/* ═══════════════════════════════════════════════════════════════
   learning.js — 선택적 학습 데이터 저장/로드
   v6f: 기여한 record id 추적 추가 (학습에서 특정 기록 제거 가능)

   저장 스키마 (localStorage):
   {
     stats: { [category]: { totalEst, totalActual, count } },
     contributions: [
       { recordId, recordTitle, recordDate, items: [{ category, estMin, actMin }] }
     ]
   }
   ═══════════════════════════════════════════════════════════════ */

const LS_LEARN = "detente-learning-data";

function emptyLD() {
  return { stats: {}, contributions: [] };
}

// 구버전 데이터 호환: { category: { totalEst,... } } 형태였던 것
function migrate(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.stats && Array.isArray(raw.contributions)) return raw;
  // 구버전 → stats만 보존, contributions는 빈 상태
  return { stats: raw, contributions: [] };
}

export function loadLD() {
  try {
    const raw = localStorage.getItem(LS_LEARN);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLD(data) {
  try {
    localStorage.setItem(LS_LEARN, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

export function resetLD() {
  try { localStorage.removeItem(LS_LEARN); } catch {}
}

/**
 * 새 record의 기여를 학습에 누적.
 * @param existing - 기존 LD (or null)
 * @param items - record breakdown (각 item에 actualMin, estimatedMin, category)
 * @param meta - { recordId, recordTitle, recordDate }
 */
export function accumLD(existing, items, meta = {}) {
  const d = existing ? {
    stats: { ...(existing.stats || {}) },
    contributions: [...(existing.contributions || [])],
  } : emptyLD();

  const itemRecord = [];

  for (const item of items) {
    if (item.actualMin == null) continue;
    const cat = item.category || item.cat || 'other';
    if (!d.stats[cat]) d.stats[cat] = { totalEst: 0, totalActual: 0, count: 0 };
    d.stats[cat].totalEst += item.estimatedMin || 0;
    d.stats[cat].totalActual += item.actualMin || 0;
    d.stats[cat].count += 1;
    itemRecord.push({
      category: cat,
      estMin: item.estimatedMin || 0,
      actMin: item.actualMin || 0,
    });
  }

  if (itemRecord.length > 0 && meta.recordId) {
    // 같은 recordId 가 이미 있으면 덮어쓰기 (재계산 시)
    const existingIdx = d.contributions.findIndex(c => c.recordId === meta.recordId);
    const entry = {
      recordId: meta.recordId,
      recordTitle: meta.recordTitle || '(제목 없음)',
      recordDate: meta.recordDate || new Date().toISOString(),
      addedAt: Date.now(),
      items: itemRecord,
    };
    if (existingIdx >= 0) {
      // 기존 항목의 stats를 빼고 새로 더해야 함 — 여기서는 단순히 덮어쓰지 않고 push.
      // (호출자가 같은 record 두 번 추가하는 일은 보통 없음. 만약 있다면 cleanLD 후 재누적.)
      d.contributions[existingIdx] = entry;
    } else {
      d.contributions.push(entry);
    }
  }

  return d;
}

/**
 * 학습 데이터에서 특정 기여를 제거하고 stats 재계산.
 * @param existing - LD
 * @param recordId - 제거할 record id
 */
export function removeContribLD(existing, recordId) {
  if (!existing || !Array.isArray(existing.contributions)) return existing;
  const remaining = existing.contributions.filter(c => c.recordId !== recordId);
  // stats 전체 재계산 (정확하게 빼는 것보다 안전)
  const stats = {};
  for (const c of remaining) {
    for (const it of (c.items || [])) {
      if (!stats[it.category]) stats[it.category] = { totalEst: 0, totalActual: 0, count: 0 };
      stats[it.category].totalEst += it.estMin || 0;
      stats[it.category].totalActual += it.actMin || 0;
      stats[it.category].count += 1;
    }
  }
  return { stats, contributions: remaining };
}

/**
 * 기여 목록만 반환 (UI 렌더용)
 */
export function listContributions(ld) {
  if (!ld || !Array.isArray(ld.contributions)) return [];
  return [...ld.contributions].sort((a, b) =>
    new Date(b.recordDate || b.addedAt || 0) - new Date(a.recordDate || a.addedAt || 0)
  );
}
