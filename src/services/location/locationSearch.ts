import { INDIA_LOCATIONS, type LocationResult } from '../../data/indiaLocations';
import { haversineDistance } from '../../utils/geoUtils';
import type { GeoPoint } from '../../types/issue';

const MAX_RESULTS = 8;

/**
 * Search cities and states from the India location dataset.
 * Supports partial matching against name, state, and search terms.
 */
export function searchLocations(query: string): LocationResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results = INDIA_LOCATIONS.filter((loc) => {
    const name = loc.name.toLowerCase();
    const state = loc.state.toLowerCase();
    const terms = loc.searchTerms.some((t) => t.toLowerCase().includes(trimmed));

    return name.includes(trimmed) || state.includes(trimmed) || terms;
  });

  // Sort: exact name matches first, then name starts-with, then state matches
  return results
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === trimmed ? 0 : 1;
      const bExact = bName === trimmed ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;

      const aStarts = aName.startsWith(trimmed) ? 0 : 1;
      const bStarts = bName.startsWith(trimmed) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;

      return a.name.localeCompare(b.name);
    })
    .slice(0, MAX_RESULTS);
}

/**
 * Get a location by exact name match (used for popular shortcuts).
 */
export function getLocationByName(name: string): LocationResult | undefined {
  const lower = name.toLowerCase();
  return INDIA_LOCATIONS.find((loc) => loc.name.toLowerCase() === lower);
}

/**
 * Return the known India location closest to the given coordinates.
 * Used as a coordinate-based fallback when a reverse-geocoded address
 * does not mention any of the supported cities.
 */
export function getNearestLocation(point: GeoPoint): LocationResult | undefined {
  let nearest: LocationResult | undefined;
  let nearestDistance = Infinity;

  for (const loc of INDIA_LOCATIONS) {
    const distance = haversineDistance(point, { lat: loc.lat, lng: loc.lng });
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = loc;
    }
  }

  return nearest;
}