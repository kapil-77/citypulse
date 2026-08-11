import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { GlassCard } from '../components/command-center/GlassCard';
import { HealthScoreRing } from '../components/command-center/HealthScoreRing';
import { AiInsightsCard } from '../components/command-center/AiInsightsCard';
import { TrendingCategories } from '../components/command-center/TrendingCategories';
import { HighRiskLocalities } from '../components/command-center/HighRiskLocalities';
import { RecentActivityFeed } from '../components/command-center/RecentActivityFeed';
import { QuickActions } from '../components/command-center/QuickActions';
import { LiveMetrics } from '../components/command-center/LiveMetrics';
import { useIssues, useStore } from '../store';
import { computeDashboardScore } from '../features/health/computeDashboardScore';
import { useEffect } from 'react';

export const CommandCenterPage = () => {
  const navigate = useNavigate();
  const issues = useIssues();
  const fetchHealthScore = useStore((s) => s.fetchHealthScore);
  const isLoadingHealth = useStore((s) => s.isLoading);

  useEffect(() => {
    void fetchHealthScore('ALL');
  }, [fetchHealthScore]);

  const totalIssues = issues.length;
  const unresolved = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length;
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const verifications = useStore((s) => s.verifications);
  const dashboardScore = computeDashboardScore(issues, verifications);

  return (
    <div className="min-h-full bg-[var(--bg-page)]">
      <TopBar title="AI Command Center" showBack rightAction={
        <button onClick={() => navigate('/')} className="text-xs uppercase tracking-[0.08em] text-white/80 hover:text-white font-medium">Home</button>
      } />

      <main className="container py-8 md:py-12">
        {/* Header */}
        <GlassCard className="p-8 mb-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-2" style={{ color: 'var(--text-primary)' }}>
            AI Command Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">City health intelligence at a glance</p>
          <div className="flex justify-center gap-6 mt-6 flex-wrap">
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{totalIssues}</p>
              <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Total Issues</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: 'var(--accent)' }}>{unresolved}</p>
              <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Unresolved</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: '#8b0000' }}>{criticalCount}</p>
              <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Critical</p>
            </div>
          </div>
        </GlassCard>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Score */}
          <GlassCard className="p-6 flex flex-col items-center justify-center">
            <HealthScoreRing score={dashboardScore} label="City Health" />
            {isLoadingHealth && <p className="text-xs text-[var(--text-muted)] mt-2 animate-pulse">Loading...</p>}
          </GlassCard>

          {/* Quick Actions */}
          <QuickActions />

          {/* AI Insights - spans 2 cols */}
          <AiInsightsCard issues={issues} />

          {/* Live Metrics */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>Live Metrics</h3>
            <LiveMetrics issues={issues} verifications={useStore.getState().verifications} healthScore={dashboardScore} />
          </div>

          {/* Trending Categories */}
          <TrendingCategories issues={issues} />

          {/* High Risk Localities */}
          <HighRiskLocalities issues={issues} />

          {/* Recent Activity */}
          <RecentActivityFeed issues={issues} />

          {/* Weather / AQI Placeholders */}
          <GlassCard className="p-6">
            <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Weather</h3>
            <div className="h-24 rounded-xl border-2 border-dashed border-white/60 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Coming soon
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Air Quality</h3>
            <div className="h-24 rounded-xl border-2 border-dashed border-white/60 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Coming soon
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
