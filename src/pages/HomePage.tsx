import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapShell } from '../components/layout/MapShell';
import { BottomSheet, useBottomSheet } from '../components/layout/BottomSheet';
import { FAB } from '../components/layout/FAB';
import { TopBar } from '../components/layout/TopBar';
import { IssueCard } from '../components/issue/IssueCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { useStore, useIssues } from '../store';
import type { Issue } from '../types/issue';

export const HomePage = () => {
  const navigate = useNavigate();
  const issues = useIssues();
  const { open: openBottomSheet, close: closeBottomSheet } = useBottomSheet();
  const selectIssue = useStore((s) => s.selectIssue);
  const flyTo = useStore((s) => s.flyTo);

  useEffect(() => {
    openBottomSheet('issues_list');
  }, []);

  const handleMarkerClick = (issue: Issue) => {
    selectIssue(issue);
    flyTo(issue.location, 16);
    openBottomSheet('issue_detail');
  };

  const handleMapClick = () => closeBottomSheet();

  const markers = issues.map((issue) => ({
    id: issue.id,
    position: issue.location,
    title: issue.title,
    category: issue.category,
    severity: issue.severity,
    onClick: () => handleMarkerClick(issue),
  }));

  return (
    <div className="relative h-full w-full bg-[var(--bg-page)]">
      {/* Map - always the hero, full bleed */}
      <div className="absolute inset-0">
        <MapShell markers={markers} onMapClick={handleMapClick} className="border-0 h-full" />
      </div>

      {/* Top bar overlay */}
      <TopBar
        title="CityPulse"
        rightAction={
          <button onClick={() => navigate('/localities')} className="text-xs uppercase tracking-wider text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
            Health
          </button>
        }
        className="absolute top-0 left-0 right-0 z-20 bg-[var(--bg-surface)]/90 backdrop-blur-sm border-b border-[var(--border)]"
      />

      <FAB />

      <BottomSheet view="issues_list">
        <div className="pt-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
              Recent Issues
              {issues.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({issues.length})</span>
              )}
            </h2>
            <button onClick={() => navigate('/report')} className="text-xs uppercase tracking-wider text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
              Report New
            </button>
          </div>

          {issues.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="No issues reported yet"
              description="Tap the camera button to report the first issue in your area."
              actionLabel="Report Issue"
              onAction={() => navigate('/report')}
            />
          ) : (
            <StaggerContainer>
              {issues.map((issue) => (
                <StaggerItem key={issue.id}>
                  <IssueCard issue={issue} compact />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};