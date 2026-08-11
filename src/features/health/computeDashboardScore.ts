import type { Issue } from '../../types/issue';
import type { VerificationStats } from '../../types/verification';

/**
 * Compute a health score (0-100) derived from the dashboard's live metrics:
 * - Resolution rate (resolved / total) — 55 points
 * - Active ratio health (fewer active = better) — 25 points
 * - Severity share penalty (high+critical / total) — up to -15
 * - Community verification bonus — up to +10
 * - Floor of 10 so a city with issues never reads 0
 */
export function computeDashboardScore(
  issues: Issue[],
  verifications: Record<string, VerificationStats> = {}
): number {
  const total = issues.length;
  if (total === 0) return 100;

  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved').length;
  const active = total - resolved;
  const resolutionRate = resolved / total;
  const activeRatio = active / total;

  // 1. Resolution rate — 55 points
  let score = resolutionRate * 55;

  // 2. Active ratio health — 25 points (fewer active issues = better)
  score += (1 - activeRatio) * 25;

  // 3. Severity share penalty — max -15 (relative, not cumulative)
  const severe = issues.filter((i) => i.severity === 'high' || i.severity === 'critical').length;
  score -= Math.min((severe / total) * 15, 15);

  // 4. Community verification bonus — max +10
  const verificationCount = Object.values(verifications).reduce(
    (sum, v) => sum + (v.confirmsExisting || 0) + (v.marksFixed || 0),
    0
  );
  score += Math.min(verificationCount, 10);

  // Floor of 10 so it never reads 0 for a city with issues
  return Math.max(10, Math.min(100, Math.round(score)));
}
