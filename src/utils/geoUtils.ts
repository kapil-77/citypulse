import type { GeoPoint } from '../types/issue';

/**
 * Calculate distance between two points in meters using the Haversine formula.
 */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aVal =
    sinDLat * sinDLat +
    sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Get address from coordinates using reverse geocoding (Nominatim).
 */
export async function reverseGeocode(point: GeoPoint): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    const data = await response.json();
    return data.display_name || `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
  } catch {
    return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
  }
}

/**
 * Format a GeoPoint to a display string.
 */
export function formatGeoPoint(point: GeoPoint): string {
  return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
}