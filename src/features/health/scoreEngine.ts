/**
 * Health Score Engine — Phase 8 Implementation
 *
 * Pure function, no side effects, testable in isolation.
 * Calculates a locality's health score based on multiple factors.
 * Supports per-category scoring and trend detection.
 */

import type { IssueCategory, IssueSeverity } from '../../types/issue';
import type { HealthScoreResult, HealthScoreInput } from '../../types/health';
import type { CategoryHealth } from '../../types/locality';

const SEVERITY_WEIGHTS: Record<IssueSeverity, number> = {
  low: 1,
  medium: 2,
  high: 4,
  critical: 8,
};

export function getCategoryColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

/**
 * Calculate per-category health score
 */
function calculateCategoryScore(
  severityDistribution: Record<string, number>,
  communityConfirmations: number,
  avgResolutionTime: number
): number {
  let score = 100;

  // Severity-weighted penalty
  const severityPenalty = Object.entries(severityDistribution).reduce((total, [severity, count]) => {
    const weight = SEVERITY_WEIGHTS[severity as IssueSeverity] || 1;
    return total + count * weight * 3;
  }, 0);
  score -= severityPenalty;

  // Community engagement bonus
  score += Math.min(communityConfirmations * 3, 15);

  // Resolution time penalty
  if (avgResolutionTime > 0) {
    score -= Math.min(avgResolutionTime / 24 * 2, 25);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determine trend by comparing current score with a previous score
 */
function determineTrend(current: number, previous?: number): 'improving' | 'stable' | 'declining' {
  if (previous === undefined) return 'stable';
  const diff = current - previous;
  if (diff >= 5) return 'improving';
  if (diff <= -5) return 'declining';
  return 'stable';
}

/**
 * Calculate overall health score for a locality
 */
export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const {
    severityDistribution,
    communityConfirmations,
    avgResolutionTime,
    previousOverall,
    categoryInputs,
  } = input;

  // Base score starts at 100
  let baseScore = 100;

  // Deduct for unresolved issues (weighted by severity)
  const severityPenalty = Object.entries(severityDistribution).reduce((total, [severity, count]) => {
    const weight = SEVERITY_WEIGHTS[severity as IssueSeverity] || 1;
    return total + count * weight * 2;
  }, 0);
  baseScore -= severityPenalty;

  // Bonus for community engagement
  const communityBonus = Math.min(communityConfirmations * 2, 10);
  baseScore += communityBonus;

  // Penalty for slow resolution
  const resolutionPenalty = avgResolutionTime > 0 ? Math.min(avgResolutionTime / 24, 20) : 0;
  baseScore -= resolutionPenalty;

  // Normalize to 0-100
  const overall = Math.max(0, Math.min(100, Math.round(baseScore)));

  // Build per-category breakdown
  const categories: Partial<Record<IssueCategory, CategoryHealth>> = {};

  if (categoryInputs) {
    for (const [category, catInput] of Object.entries(categoryInputs)) {
      const catScore = calculateCategoryScore(
        catInput.severityDistribution,
        catInput.communityConfirmations,
        catInput.avgResolutionTime
      );
      categories[category as IssueCategory] = {
        score: catScore,
        unresolvedCount: catInput.unresolvedCount,
        avgResolutionTime: catInput.avgResolutionTime,
        communityConfirmed: catInput.communityConfirmations,
        color: getCategoryColor(catScore),
      };
    }
  }

  // Determine trend
  const trend = determineTrend(overall, previousOverall);

  return {
    overall,
    categories,
    trend,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Compute health score input from a list of issues
 */
export function computeHealthInputFromIssues(
  issues: Array<{
    severity: IssueSeverity;
    status: string;
    category: IssueCategory;
    resolvedAt: string | null;
    reportedAt: string;
    verification?: { confirmsExisting: number };
  }>,
  previousOverall?: number
): HealthScoreInput {
  const unresolved = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved');
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved');

  const severityDistribution: Record<string, number> = {};
  for (const issue of unresolved) {
    severityDistribution[issue.severity] = (severityDistribution[issue.severity] || 0) + 1;
  }

  const totalResolutionTimes = resolved.reduce((sum, issue) => {
    if (issue.resolvedAt) {
      const reported = new Date(issue.reportedAt).getTime();
      const resolvedDate = new Date(issue.resolvedAt).getTime();
      return sum + (resolvedDate - reported) / (1000 * 60 * 60); // hours
    }
    return sum;
  }, 0);

  const avgResolutionTime = resolved.length > 0 ? totalResolutionTimes / resolved.length : 0;

  const communityConfirmations = issues.reduce(
    (sum, issue) => sum + (issue.verification?.confirmsExisting || 0),
    0
  );

  // Per-category inputs
  const categoryInputs: Record<string, {
    unresolvedCount: number;
    severityDistribution: Record<string, number>;
    communityConfirmations: number;
    avgResolutionTime: number;
  }> = {};

  const categories = [...new Set(issues.map((i) => i.category))];
  for (const cat of categories) {
    const catIssues = issues.filter((i) => i.category === cat);
    const catUnresolved = catIssues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved');
    const catResolved = catIssues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved');

    const catSeverityDist: Record<string, number> = {};
    for (const issue of catUnresolved) {
      catSeverityDist[issue.severity] = (catSeverityDist[issue.severity] || 0) + 1;
    }

    const catTotalResTime = catResolved.reduce((sum, issue) => {
      if (issue.resolvedAt) {
        const reported = new Date(issue.reportedAt).getTime();
        const resolvedDate = new Date(issue.resolvedAt).getTime();
        return sum + (resolvedDate - reported) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    categoryInputs[cat] = {
      unresolvedCount: catUnresolved.length,
      severityDistribution: catSeverityDist,
      communityConfirmations: catIssues.reduce((s, i) => s + (i.verification?.confirmsExisting || 0), 0),
      avgResolutionTime: catResolved.length > 0 ? catTotalResTime / catResolved.length : 0,
    };
  }

  return {
    unresolvedCount: unresolved.length,
    severityDistribution,
    communityConfirmations,
    avgResolutionTime,
    totalIssues: issues.length,
    previousOverall,
    categoryInputs,
  };
}