/* ═══════════════════════════════════════════════════════════════
   maps.js — Google Maps Places + Distance Matrix 연동 (C안)
   
   기능:
     - searchPlace(query, near) — Places API Text Search
     - getPlaceDetails(placeId) — Place Details (lat/lng 정확)
     - getDistanceMatrix(origins, destinations, mode) — 정확한 이동 시간/거리
     - estimateRouteMin(steps, currentLatLng) — 단계 리스트의 이동 시간 보정
   
   사용자 키: localStorage 'aimo-maps-api-key' 에 저장
   문서: https://developers.google.com/maps/documentation/places/web-service
        https://developers.google.com/maps/documentation/distance-matrix
   ═══════════════════════════════════════════════════════════════ */

import { haversine, estimateTravelMin } from './geo';

const LS_API_KEY = 'aimo-maps-api-key';
const LS_PLACE_CACHE = 'aimo-place-cache';
const PLACE_CACHE_TTL = 7 * 24 * 3600 * 1000; // 7일

export function getMapsApiKey() {
  try { return localStorage.getItem(LS_API_KEY) || null; } catch { return null; }
}
export function setMapsApiKey(key) {
  try {
    if (!key) localStorage.removeItem(LS_API_KEY);
    else localStorage.setItem(LS_API_KEY, key);
  } catch {}
}
export function hasMapsApiKey() {
  return !!getMapsApiKey();
}

/* ─── 캐시 ─── */
function loadPlaceCache() {
  try {
    const raw = localStorage.getItem(LS_PLACE_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function savePlaceCache(c) {
  try { localStorage.setItem(LS_PLACE_CACHE, JSON.stringify(c)); } catch {}
}

/**
 * Places API Text Search — 장소명 → 첫 매칭 결과의 좌표/주소
 * @param {string} query — "스타벅스 강남"
 * @param {{lat,lng}|null} near — 위치 편향 (사용자 현재 위치)
 * @returns {Promise<{name, placeId, lat, lng, address} | null>}
 */
export async function searchPlace(query, near = null) {
  if (!query || typeof query !== 'string') return null;
  const key = getMapsApiKey();
  if (!key) return null;

  // 캐시
  const cache = loadPlaceCache();
  const cacheKey = `${query.toLowerCase()}|${near ? `${near.lat.toFixed(2)},${near.lng.toFixed(2)}` : ''}`;
  const hit = cache[cacheKey];
  if (hit && Date.now() - hit.ts < PLACE_CACHE_TTL) return hit.data;

  const params = new URLSearchParams({
    query,
    key,
    language: 'ko',
  });
  if (near) {
    params.set('location', `${near.lat},${near.lng}`);
    params.set('radius', '20000'); // 20km 반경 편향
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK' || !json.results?.length) {
      console.warn('[maps] searchPlace empty:', json.status);
      return null;
    }
    const first = json.results[0];
    const data = {
      name: first.name,
      placeId: first.place_id,
      lat: first.geometry?.location?.lat,
      lng: first.geometry?.location?.lng,
      address: first.formatted_address,
    };
    cache[cacheKey] = { ts: Date.now(), data };
    savePlaceCache(cache);
    return data;
  } catch (err) {
    console.warn('[maps] searchPlace error:', err);
    return null;
  }
}

/**
 * Distance Matrix API — 정확한 이동 시간/거리
 * @param {{lat,lng}} origin
 * @param {{lat,lng}} dest
 * @param {'driving'|'walking'|'bicycling'|'transit'} mode
 * @returns {Promise<{distanceMeters, durationSec} | null>}
 */
export async function getDistanceMatrix(origin, dest, mode = 'driving') {
  if (!origin || !dest) return null;
  const key = getMapsApiKey();
  if (!key) return null;

  const params = new URLSearchParams({
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${dest.lat},${dest.lng}`,
    mode,
    language: 'ko',
    key,
  });

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`;
    const res = await fetch(url);
    const json = await res.json();
    const elem = json?.rows?.[0]?.elements?.[0];
    if (!elem || elem.status !== 'OK') {
      console.warn('[maps] DistanceMatrix not OK:', elem?.status);
      return null;
    }
    return {
      distanceMeters: elem.distance?.value || 0,
      durationSec: elem.duration?.value || 0,
    };
  } catch (err) {
    console.warn('[maps] DistanceMatrix error:', err);
    return null;
  }
}

/**
 * 단계 리스트에서 이동 단계의 시간 보정
 * - 각 이동 단계의 placeKeyword 로 Places 검색
 * - 직전 위치 (또는 사용자 GPS) 에서 Distance Matrix 호출
 * - estimatedMin 을 distanceMatrix.durationSec / 60 로 갱신
 * 
 * 실패한 단계는 기존 estimatedMin 유지 (graceful)
 * 
 * @param {Array} steps — engine breakdown items (item.isTravel, item.placeKeyword)
 * @param {{lat,lng}} currentLatLng — 사용자 현재 위치
 * @returns {Promise<{updatedSteps, originalTotalMin, newTotalMin}>}
 */
export async function refineTravelTimes(steps, currentLatLng) {
  if (!hasMapsApiKey() || !currentLatLng || !Array.isArray(steps)) {
    return { updatedSteps: steps, originalTotalMin: 0, newTotalMin: 0, refinedCount: 0 };
  }
  const updatedSteps = [...steps];
  let cursor = currentLatLng;
  let originalTotalMin = 0;
  let newTotalMin = 0;
  let refinedCount = 0;

  for (let i = 0; i < updatedSteps.length; i++) {
    const item = updatedSteps[i];
    if (!item || item.isMarker || !item.isTravel || !item.placeKeyword) continue;

    originalTotalMin += item.estimatedMin || 0;

    try {
      const place = await searchPlace(item.placeKeyword, cursor);
      if (!place || !isFinite(place.lat) || !isFinite(place.lng)) {
        newTotalMin += item.estimatedMin || 0;
        continue;
      }
      const dm = await getDistanceMatrix(cursor, { lat: place.lat, lng: place.lng }, 'driving');
      if (!dm || !isFinite(dm.durationSec)) {
        // 폴백: haversine + estimateTravelMin
        const km = haversine(cursor, { lat: place.lat, lng: place.lng });
        const fallback = estimateTravelMin(km, 'auto');
        if (fallback != null) {
          updatedSteps[i] = {
            ...item,
            estimatedMin: fallback,
            placeResolved: place,
            timeSource: 'haversine-fallback',
          };
          newTotalMin += fallback;
          cursor = { lat: place.lat, lng: place.lng };
          refinedCount++;
        } else {
          newTotalMin += item.estimatedMin || 0;
        }
        continue;
      }
      const refinedMin = Math.max(2, Math.min(480, Math.round(dm.durationSec / 60)));
      updatedSteps[i] = {
        ...item,
        estimatedMin: refinedMin,
        placeResolved: place,
        distanceMeters: dm.distanceMeters,
        timeSource: 'distance-matrix',
      };
      newTotalMin += refinedMin;
      cursor = { lat: place.lat, lng: place.lng };
      refinedCount++;
    } catch (err) {
      console.warn('[maps] refineTravelTimes step error:', err);
      newTotalMin += item.estimatedMin || 0;
    }
  }

  return { updatedSteps, originalTotalMin, newTotalMin, refinedCount };
}
