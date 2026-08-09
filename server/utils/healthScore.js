/**
 * Health Score Engine — Server-side port of src/features/health/scoreEngine.ts
 * Keeps backend and frontend scoring consistent.
 */

const SEVERITY_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 4,
  critical: 8,
};

export function getCategoryColor(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

function calculateCategoryScore(unresolvedCount, severityDistribution, communityConfirmations, avgResolutionTime) {
  let score = 100;
  const severityPenalty = Object.entries(severityDistribution || {}).reduce((total, [severity, count]) => {
    const weight = SEVERITY_WEIGHTS[severity] || 1;
    return total + count * weight * 3;
  }, 0);
  score -= severityPenalty;
  score += Math.min((communityConfirmations || 0) * 3, 15);
  if (avgResolutionTime > 0) {
    score -= Math.min((avgResolutionTime / 24) * 2, 25);
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function determineTrend(current, previous) {
  if (previous === undefined) return 'stable';
  const diff = current - previous;
  if (diff >= 5) return 'improving';
  if (diff <= -5) return 'declining';
  return 'stable';
}

/**
 * Compute health score input from a list of issues.
 */
export function computeHealthInputFromIssues(issues, previousOverall) {
  const unresolved = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved');
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved');

  const severityDistribution = {};
  for (const issue of unresolved) {
    severityDistribution[issue.severity] = (severityDistribution[issue.severity] || 0) + 1;
  }

  const totalResolutionTimes = resolved.reduce((sum, issue) => {
    if (issue.resolvedAt) {
      const reported = new Date(issue.reportedAt).getTime();
      const resolvedDate = new Date(issue.resolvedAt).getTime();
      return sum + (resolvedDate - reported) / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  const avgResolutionTime = resolved.length > 0 ? totalResolutionTimes / resolved.length : 0;

  const communityConfirmations = issues.reduce(
    (sum, issue) => sum + (issue.verification?.confirmsExisting || 0),
    0
  );

  const categoryInputs = {};
  const categories = [...new Set(issues.map((i) => i.category))];
  for (const cat of categories) {
    const catIssues = issues.filter((i) => i.category === cat);
    const catUnresolved = catIssues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved');
    const catResolved = catIssues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved');

    const catSeverityDist = {};
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

/**
 * Calculate overall health score.
 */
export function calculateHealthScore(input) {
  const {
    severityDistribution,
    communityConfirmations,
    avgResolutionTime,
    previousOverall,
    categoryInputs,
  } = input;

  let baseScore = 100;
  const severityPenalty = Object.entries(severityDistribution || {}).reduce((total, [severity, count]) => {
    const weight = SEVERITY_WEIGHTS[severity] || 1;
    return total + count * weight * 2;
  }, 0);
  baseScore -= severityPenalty;

  const communityBonus = Math.min((communityConfirmations || 0) * 2, 10);
  baseScore += communityBonus;

  const resolutionPenalty = avgResolutionTime > 0 ? Math.min(avgResolutionTime / 24, 20) : 0;
  baseScore -= resolutionPenalty;

  const overall = Math.max(0, Math.min(100, Math.round(baseScore)));

  const categories = {};
  if (categoryInputs) {
    for (const [category, catInput] of Object.entries(categoryInputs)) {
      const catScore = calculateCategoryScore(
        catInput.unresolvedCount,
        catInput.severityDistribution,
        catInput.communityConfirmations,
        catInput.avgResolutionTime
      );
      categories[category] = {
        score: catScore,
        unresolvedCount: catInput.unresolvedCount,
        avgResolutionTime: catInput.avgResolutionTime,
        communityConfirmed: catInput.communityConfirmations,
        color: getCategoryColor(catScore),
      };
    }
  }

  const trend = determineTrend(overall, previousOverall);

  return {
    overall,
    categories,
    trend,
    updatedAt: new Date().toISOString(),
  };
}