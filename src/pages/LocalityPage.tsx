import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Card, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HealthScoreGauge } from '../components/locality/HealthScoreGauge';
import { CategoryBreakdown } from '../components/locality/CategoryBreakdown';
import { useIssues, useSelectedLocation } from '../store';
import { computeHealthInputFromIssues, calculateHealthScore } from '../features/health/scoreEngine';

export const LocalityPage = () => {
  const navigate = useNavigate();
  const issues = useIssues();
  const selectedLocation = useSelectedLocation();

  // Filter issues by the selected city/state (match city/state name in issue address)
  const locationIssues = useMemo(() => {
    if (!selectedLocation) return issues;
    const name = selectedLocation.name.toLowerCase();
    const state = selectedLocation.state.toLowerCase();

    return issues.filter((issue) => {
      const address = issue.address.toLowerCase();
      return address.includes(name) || address.includes(state);
    });
  }, [issues, selectedLocation]);

  const healthResult = useMemo(() => calculateHealthScore(computeHealthInputFromIssues(locationIssues)), [locationIssues]);
  const stats = useMemo(() => {
    const total = locationIssues.length;
    const unresolved = locationIssues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length;
    const criticalCount = locationIssues.filter((i) => i.severity === 'critical').length;
    const resolved = locationIssues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved').length;
    return { total, unresolved, criticalCount, resolved };
  }, [locationIssues]);

  const locationLabel = selectedLocation
    ? `${selectedLocation.name.toUpperCase()}, ${selectedLocation.state.toUpperCase()}`
    : 'ALL INDIA';

  return (
    <div className="h-full flex flex-col bg-[var(--bg-page)]">
      <TopBar title="City Health" showBack />

      <div className="flex-1 overflow-y-auto">
        <div className="container py-8 space-y-8">
          <Card padding="lg" className="text-center">
            <p className="label mb-2">City Health</p>
            <h2 className="font-serif text-xl md:text-2xl font-bold mb-6">{locationLabel}</h2>
            <HealthScoreGauge score={healthResult.overall} trend={healthResult.trend} size="lg" />
            <p className="text-xs text-[var(--text-muted)] mt-4">Based on {stats.total} reported issue{stats.total !== 1 ? 's' : ''} in {locationLabel}</p>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card padding="md" className="text-center">
              <div className="text-xl font-serif font-bold">{stats.unresolved}</div>
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

          <div>
            <h2 className="font-serif text-lg font-bold mb-4">Category Breakdown</h2>
            <CategoryBreakdown categories={healthResult.categories} />
          </div>

          <Card padding="lg" className="text-center">
            <CardTitle className="mb-2">How is this calculated?</CardTitle>
            <CardDescription>Health scores are calculated based on unresolved issues, severity, community confirmations, and resolution speed for {locationLabel}.</CardDescription>
          </Card>

          <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
};