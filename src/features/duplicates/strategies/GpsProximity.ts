import type { DuplicateStrategy } from '../duplicateEngine';
import type { NewIssue, Issue } from '../../../types/issue';

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * GPS Proximity Strategy
 * Scores based on geographic distance between issues.
 * Issues within 50m get high similarity scores.
 */
export const GpsProximityStrategy: DuplicateStrategy = {
  name: 'GPS Proximity',
  weight: 0.35,

  check(input: NewIssue, existing: Issue): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(existing.location.lat - input.location.lat);
    const dLon = toRad(existing.location.lng - input.location.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(input.location.lat)) *
        Math.cos(toRad(existing.location.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Score: 1.0 at 0m, 0.0 at 200m+
    return Math.max(0, 1 - distance / 200);
  },
};
