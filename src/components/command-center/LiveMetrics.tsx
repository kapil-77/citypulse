import { KpiCard } from './KpiCard';
import type { Issue } from '../../types/issue';
import type { VerificationStats } from '../../types/verification';

interface LiveMetricsProps {
  issues: Issue[];
  verifications?: Record<string, VerificationStats>;
  healthScore?: number;
}

export const LiveMetrics = ({ issues, verifications = {}, healthScore = 0 }: LiveMetricsProps) => {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved').length;
  const active = total - resolved;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const communityVerifications = Object.values(verifications).reduce(
    (sum, v) => sum + (v.confirmsExisting || 0) + (v.marksFixed || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <KpiCard label="Total Issues" value={total} trend={total > 0 ? 'up' : 'neutral'} delay={0} />
      <KpiCard label="Active Issues" value={active} trend={active > 0 ? 'down' : 'up'} trendLabel={active > 0 ? 'Still open' : 'All resolved'} delay={0.05} />
      <KpiCard label="Resolved Issues" value={resolved} trend={resolved > 0 ? 'up' : 'neutral'} delay={0.1} />
      <KpiCard label="Resolution Rate" value={resolutionRate} suffix="%" trend={resolutionRate >= 50 ? 'up' : 'down'} progress={resolutionRate} delay={0.15} />
      <KpiCard label="Community Verifications" value={communityVerifications} trend={communityVerifications > 0 ? 'up' : 'neutral'} delay={0.2} />
      <KpiCard label="AI Health Score" value={Math.round(healthScore)} suffix="/100" trend={healthScore >= 70 ? 'up' : healthScore >= 40 ? 'neutral' : 'down'} progress={healthScore} delay={0.25} />
    </div>
  );
};
