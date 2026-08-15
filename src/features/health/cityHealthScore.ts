import type { Issue } from '../../types/issue';
import type { VerificationStats } from '../../types/verification';

export interface CityHealthReport {
  score: number;
  activeCount: number;
  resolvedCount: number;
  criticalCount: number;
  totalCount: number;
  avgActiveAgeDays: number;
  communityConfirmations: number;
  summary: string;
  hasEnoughData: boolean;
}

const SEVERITY_WEIGHT: Record<Issue['severity'], number> = {
  low: 1,
  medium: 2,
  high: 4,
  critical: 8,
};

/**
 * Compute a city's health score (0-100) from its REAL issue dataset.
 *
 * Factors:
 * - severity-weighted burden of active issues
 * - extra penalty per critical issue
 * - age of unresolved issues (older = worse)
 * - resolution-rate credit
 * - community verification bonus (confirms + marks-fixed)
 *
 * Returns null when there are no issues for the city -> UI shows "Insufficient data"
 * rather than fabricating a score.
 */
export function computeCityHealth(
  issues: Issue[],
  verifications: Record<string, VerificationStats> = {}
): CityHealthReport | null {
  const total = issues.length;
  if (total === 0) return null;

  const active = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved');
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved');
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;

  const now = Date.now();
  const ages = active
    .map((i) => (now - new Date(i.reportedAt).getTime()) / (1000 * 60 * 60 * 24))
    .filter((d) => Number.isFinite(d) && d >= 0);
  const avgActiveAgeDays = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

  let score = 100;
  score -= active.reduce((sum, i) => sum + SEVERITY_WEIGHT[i.severity], 0);
  score -= criticalCount * 4;
  score -= Math.min(avgActiveAgeDays / 7, 15);
  score += (resolved.length / total) * 10;
  const verificationCount = Object.values(verifications).reduce(
    (sum, v) => sum + (v.confirmsExisting || 0) + (v.marksFixed || 0),
    0
  );
  score += Math.min(verificationCount, 10);

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  const summary = [
    `${active.length} active${criticalCount > 0 ? ` (${criticalCount} critical)` : ''}`,
    `${resolved.length} resolved`,
    avgActiveAgeDays >= 1 ? `avg age ${Math.round(avgActiveAgeDays)}d` : 'no pending backlog',
  ].join(' · ');

  return {
    score: clamped,
    activeCount: active.length,
    resolvedCount: resolved.length,
    criticalCount,
    totalCount: total,
    avgActiveAgeDays,
    communityConfirmations: verificationCount,
    summary,
    hasEnoughData: true,
  };
}
