import { GlassCard } from './GlassCard';
import type { Issue } from '../../types/issue';

interface RecentActivityFeedProps {
  issues: Issue[];
}

export const RecentActivityFeed = ({ issues }: RecentActivityFeedProps) => {
  const sorted = [...issues].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  return (
    <GlassCard className="p-6">
      <h3 className="font-display text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((issue) => (
            <div key={issue.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: issue.severity === 'critical' ? '#8b0000' : 'var(--accent)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {issue.status.replace(/_/g, ' ')} · {new Date(issue.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
