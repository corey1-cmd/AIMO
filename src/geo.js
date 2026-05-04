/* ═══════════════════════════════════════════════════════════════
   geo.js — GPS 기반 위치 및 거리 계산 유틸 (외부 API 호출 0)
   
   기능:
     - getCurrentPosition() — 브라우저 Geolocation API
     - haversine(a, b) — 두 좌표 간 직선 거리 (km)
     - estimateTravelMin(km, mode) — 거리 → 이동 시간 추정
     - extractPlaceFromTitle(title) — 단계 제목에서 장소 키워드 추출
     - addTravelTime(steps, currentLatLng) — 이동 단계 자동 삽입
   
   외부 의존성: 없음. 브라우저 위치 권한만 필요.
   ═══════════════════════════════════════════════════════════════ */

const LS_LOCATION = 'aimo-last-location';

/**
 * 사용자 현재 위치 가져오기
 * @returns Promise<{lat, lng, accuracy} | null>
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    const opts = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60_000, // 1분 캐시
      ...options,
    };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: Date.now(),
        };
        try { localStorage.setItem(LS_LOCATION, JSON.stringify(result)); } catch {}
        resolve(result);
      },
      (err) => {
        console.warn('[geo] getCurrentPosition failed:', err.code, err.message);
        // 실패 시 캐시된 위치 반환 (있으면)
        try {
          const cached = localStorage.getItem(LS_LOCATION);
          if (cached) {
            const obj = JSON.parse(cached);
            // 24시간 이내면 사용
            if (obj && Date.now() - obj.ts < 24 * 3600 * 1000) {
              resolve({ ...obj, fromCache: true });
              return;
            }
          }
        } catch {}
        resolve(null);
      },
      opts
    );
  });
}

/**
 * 두 좌표 간 직선 거리 (km) — Haversine 공식
 */
export function haversine(a, b) {
  if (!a || !b) return null;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function toRad(deg) { return (deg * Math.PI) / 180; }

/**
 * 거리(km) → 이동 시간(분) 추정
 * @param mode: 'walk' (4 km/h), 'transit' (20 km/h), 'drive' (40 km/h, 도시), 'auto' (거리 따라 자동)
 *   직선 거리이므로 실제 경로보다 짧음 → 1.3배 보정 (도시 가정)
 */
export function estimateTravelMin(km, mode = 'auto') {
  if (km == null || !isFinite(km) || km < 0) return null;
  const adjusted = km * 1.3; // 직선 → 실제 경로 보정
  let speedKmh;
  if (mode === 'auto') {
    if (adjusted < 0.8) speedKmh = 4;        // 800m 미만 → 도보
    else if (adjusted < 5) speedKmh = 18;    // 5km 미만 → 대중교통/자전거
    else speedKmh = 35;                      // 그 이상 → 자동차/대중교통 평균
  } else if (mode === 'walk')    speedKmh = 4;
  else if (mode === 'transit')   speedKmh = 20;
  else if (mode === 'drive')     speedKmh = 40;
  else speedKmh = 20;

  const minutes = (adjusted / speedKmh) * 60;
  // 최소 2분, 최대 480분 (8시간) 클램프
  return Math.max(2, Math.min(480, Math.round(minutes)));
}

/**
 * 단계 제목에서 장소 키워드 추출 (한·영 동시)
 * 매우 단순한 휴리스틱 — 알려진 장소 명사 사전 기반.
 * @returns 매칭된 장소 키워드 또는 null
 */
const PLACE_KEYWORDS = [
  // 한국어
  '도서관', '역', '지하철', '버스', '카페', '스타벅스', '커피', '학교',
  '병원', '약국', '마트', '편의점', '백화점', '쇼핑몰', '서점', '식당',
  '카페', '극장', '영화관', '체육관', '헬스장', '공원', '집', '회사', '학원',
  '교회', '성당', '미용실', '주유소', '은행', '우체국', '공항', '터미널',
  '연구실', '강의실', '강당', '회의실', '사무실',
  // 영어
  'library', 'station', 'subway', 'bus', 'cafe', 'starbucks', 'coffee', 'school',
  'hospital', 'pharmacy', 'mart', 'store', 'mall', 'shop', 'restaurant',
  'cinema', 'gym', 'park', 'home', 'office', 'work', 'church',
  'salon', 'gas', 'bank', 'post', 'airport', 'terminal',
  'lab', 'classroom', 'meeting room',
];

export function extractPlaceFromTitle(title) {
  if (!title || typeof title !== 'string') return null;
  const lower = title.toLowerCase();
  for (const kw of PLACE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return kw;
  }
  return null;
}

/**
 * 단계 제목이 이동 행동인지 판정
 * "X 가기", "X 들르기", "X 도착" 등의 패턴
 */
const TRAVEL_VERBS_KO = ['가기', '가다', '들르기', '들르다', '도착', '이동', '향하다', '오기', '오다'];
const TRAVEL_VERBS_EN = ['go to', 'visit', 'travel to', 'commute to', 'drive to', 'walk to'];

export function isTravelStep(title) {
  if (!title || typeof title !== 'string') return false;
  const lower = title.toLowerCase();
  if (TRAVEL_VERBS_KO.some(v => title.includes(v))) return true;
  if (TRAVEL_VERBS_EN.some(v => lower.includes(v))) return true;
  // 장소 키워드 + 이동 의도
  const place = extractPlaceFromTitle(title);
  if (place && /(까지|에서|으로|로|에)/.test(title)) return true;
  return false;
}

/**
 * 권한 상태 확인 (UI 노출용)
 * @returns 'granted' | 'denied' | 'prompt' | 'unsupported'
 */
export async function getLocationPermissionState() {
  if (typeof navigator === 'undefined' || !navigator.permissions) return 'unsupported';
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'unsupported';
  }
}

/**
 * 캐시된 마지막 위치 조회 (UI 상태 표시용)
 */
export function getCachedLocation() {
  try {
    const raw = localStorage.getItem(LS_LOCATION);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.lat !== 'number') return null;
    return obj;
  } catch {
    return null;
  }
}
