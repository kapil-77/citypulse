import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Card, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HealthScoreGauge } from '../components/locality/HealthScoreGauge';
import { CategoryBreakdown } from '../components/locality/CategoryBreakdown';
import { useIssues } from '../store';
import { computeHealthInputFromIssues, calculateHealthScore } from '../features/health/scoreEngine';

export const LocalityPage = () => {
  const navigate = useNavigate();
  const issues = useIssues();

  const healthResult = useMemo(() => calculateHealthScore(computeHealthInputFromIssues(issues)), [issues]);

  const stats = useMemo(() => {
    const total = issues.length;
    const unresolved = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length;
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved').length;
    return { total, unresolved, criticalCount, resolved };
  }, [issues]);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-page)]">
      <TopBar title="City Health" showBack />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding)] py-6 space-y-6">
          {/* Overall Score */}
          <Card variant="editorial" padding="lg" className="text-center">
            <p className="label mb-4">City Health</p>
            <HealthScoreGauge score={healthResult.overall} trend={healthResult.trend} size="lg" />
            <p className="text-xs text-[var(--text-muted)] mt-4">Based on {stats.total} reported issue{stats.total !== 1 ? 's' : ''}</p>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card padding="md" className="text-center">
              <div className="text-xl font-serif font-bold text-[var(--text-primary)]">{stats.unresolved}</div>
              <div className="label text-[0.625rem] mt-1">Open Issues</div>
            </Card>
            <Card padding="md" className="text-center">
              <div className="text-xl font-serif font-bold text-[var(--status-red)]">{stats.criticalCount}</div>
              <div className="label text-[0.625rem] mt-1">Critical</div>
            </Card>
            <Card padding="md" className="text-center">
              <div className="text-xl font-serif font-bold text-[var(--status-green)]">{stats.resolved}</div>
              <div className="label text-[0.625rem] mt-1">Resolved</div>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-3">Category Breakdown</h2>
            <CategoryBreakdown categories={healthResult.categories} />
          </div>

          {/* Explanation */}
          <Card padding="lg" className="text-center">
            <CardTitle className="mb-2">How is this calculated?</CardTitle>
            <CardDescription>
              Health scores are calculated based on unresolved issues, severity, community confirmations, and resolution speed.
            </CardDescription>
          </Card>

          <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>Back to Map</Button>
        </div>
      </div>
    </div>
  );
};