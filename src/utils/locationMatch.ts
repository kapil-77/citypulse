import type { Issue } from '../types/issue';
import { INDIA_LOCATIONS, type LocationResult } from '../data/indiaLocations';
import { haversineDistance } from './geoUtils';

// Radius (km) within which an issue's coordinates are considered part of the area
// when its address is unrecognizable (e.g. stored as raw coordinates).
const CITY_RADIUS_KM = 60;
const REGION_RADIUS_KM = 250;

// Every known name, state, and search alias across all locations. Used to detect
// whether an address is attributable to a known place (so we don't over-match
// nearby cities via the coordinate fallback in dense metro clusters).
const ALL_KNOWN_TOKENS: string[] = (() => {
  const set = new Set<string>();
  for (const loc of INDIA_LOCATIONS) {
    for (const t of [loc.name, loc.state, ...loc.searchTerms]) {
      const s = t.trim().toLowerCase();
      if (s) set.add(s);
    }
  }
  return Array.from(set);
})();

/**
 * Decide whether an issue belongs to a selected location.
 * - Prefers an exact address match (canonical name, state, and aliases) to preserve
 *   existing behaviour.
 * - If the address is attributable to some other known location, it is excluded
 *   (prevents nearby cities bleeding into each other, e.g. Delhi / Gurugram).
 * - Only for addresses that match no known location (e.g. raw coordinates) do we
 *   fall back to geographic proximity against the issue's GPS coordinates.
 */
export function isIssueInLocation(
  issue: Issue,
  location: LocationResult | null,
): boolean {
  if (!location) return true; // no selection -> all issues

  const address = (issue.address || '').toLowerCase();

  // 1) Own-token address match -> definitely in this location
  const own = [location.name, location.state, ...location.searchTerms]
    .map((s) => s.toLowerCase())
    .filter((s) => s.length > 0);
  if (own.some((n) => address.includes(n))) return true;

  // 2) Address is attributable to another known location -> NOT this one
  if (ALL_KNOWN_TOKENS.some((t) => address.includes(t))) return false;

  // 3) Unrecognizable address -> fall back to proximity using issue coordinates
  const pt = issue.location;
  if (pt && Number.isFinite(pt.lat) && Number.isFinite(pt.lng)) {
    const distanceM = haversineDistance(pt, { lat: location.lat, lng: location.lng });
    const radiusKm = location.type === 'city' ? CITY_RADIUS_KM : REGION_RADIUS_KM;
    if (distanceM <= radiusKm * 1000) return true;
  }

  return false;
}
