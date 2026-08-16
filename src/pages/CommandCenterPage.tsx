import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { GlassCard } from '../components/command-center/GlassCard';
import { SkeletonLoader } from '../components/command-center/SkeletonLoader';
import { QuickActions } from '../components/command-center/QuickActions';
import { AskAssistant } from '../components/command-center/AskAssistant';
import { useIssues, useStore, useSelectedLocation } from '../store';
import { isIssueInLocation } from '../utils/locationMatch';
import { computeCityHealth } from '../features/health/cityHealthScore';
import { useCityAnalyst, buildCityAssistantContext } from '../hooks/useCityAnalyst';

const statLabel = 'text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]';
const sectionTitle = 'font-display text-2xl mb-4';

/**
 * AI Command Center — a dedicated AI analyst for the selected city.
 * Uses AI with the city's real issue data; falls back to a statistical
 * summary derived only from real data when the API key is missing.
 */
export const CommandCenterPage = () => {
  const navigate = useNavigate();
  const issues = useIssues();
  const verifications = useStore((s) => s.verifications);
  const selectedLocation = useSelectedLocation();

  const cityName = selectedLocation
    ? selectedLocation.name + ', ' + selectedLocation.state
    : 'All India';

  const cityIssues = useMemo(
    () => (selectedLocation ? issues.filter((i) => isIssueInLocation(i, selectedLocation)) : issues),
    [issues, selectedLocation]
  );

  const report = useMemo(
    () => computeCityHealth(cityIssues, verifications),
    [cityIssues, verifications]
  );

  const assistantContext = useMemo(
    () => buildCityAssistantContext(cityName, cityIssues, report),
    [cityName, cityIssues, report]
  );

  const { loading, report: analyst, ask } = useCityAnalyst(cityName, cityIssues, assistantContext);

  const renderList = (items: string[] | undefined, empty: string) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-[var(--text-secondary)]">{empty}</p>;
    }
    return (
      <ul className="space-y-2">
        {items.map((t, idx) => (
          <li key={idx} className="flex gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent)] shrink-0">▸</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-full bg-[var(--bg-page)]">
      <TopBar
        title="CityPulse AI"
        showBack
        rightAction={
          <button
            onClick={() => navigate('/')}
            className="text-xs uppercase tracking-[0.08em] text-white/80 hover:text-white font-medium"
          >
            Home
          </button>
        }
      />

      <main className="container py-8 md:py-12 space-y-8">
        {/* Header + real snapshot */}
        <GlassCard className="p-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-2" style={{ color: 'var(--text-primary)' }}>
            AI Analyst
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Civic intelligence for <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cityName}</span>
          </p>

          {report ? (
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{report.score}</p>
                <p className={statLabel}>Health Score</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{report.totalCount}</p>
                <p className={statLabel}>Total</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl" style={{ color: 'var(--accent)' }}>{report.activeCount}</p>
                <p className={statLabel}>Active</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl" style={{ color: 'var(--status-green)' }}>{report.resolvedCount}</p>
                <p className={statLabel}>Resolved</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl" style={{ color: '#8b0000' }}>{report.criticalCount}</p>
                <p className={statLabel}>Critical</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Insufficient data for {cityName}.</p>
          )}
        </GlassCard>

        {/* AI Verdict */}
        <GlassCard className="p-6">
          <h3 className={sectionTitle} style={{ color: 'var(--text-primary)' }}>AI Verdict</h3>
          {loading ? (
            <div className="h-4 rounded bg-white/40 animate-pulse w-3/4" />
          ) : analyst ? (
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{analyst.verdict}</p>
          ) : null}
        </GlassCard>

        {/* Analysis grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <h3 className={sectionTitle} style={{ color: 'var(--text-primary)' }}>Top Civic Problems</h3>
            {loading ? <SkeletonLoader /> : renderList(analyst?.topProblems, 'No data yet.')}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className={sectionTitle} style={{ color: 'var(--text-primary)' }}>Priority Issues</h3>
            {loading ? <SkeletonLoader /> : renderList(analyst?.priorityIssues, 'No priorities detected.')}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className={sectionTitle} style={{ color: 'var(--text-primary)' }}>Trends</h3>
            {loading ? <SkeletonLoader /> : renderList(analyst?.trends, 'No trends detected.')}
          </GlassCard>
        </div>

        {/* Recommendations */}
        <GlassCard className="p-6">
          <h3 className={sectionTitle} style={{ color: 'var(--text-primary)' }}>Recommendations</h3>
          {loading ? <SkeletonLoader /> : renderList(analyst?.recommendations, 'No recommendations yet.')}
        </GlassCard>

        {/* Ask CityPulse AI */}
        <AskAssistant cityName={cityName} context={assistantContext} ask={ask} />

        <QuickActions />
      </main>
    </div>
  );
};
