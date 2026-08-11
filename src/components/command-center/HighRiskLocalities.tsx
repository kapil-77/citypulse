import { GlassCard } from './GlassCard';
import type { Issue } from '../../types/issue';

interface HighRiskLocalitiesProps {
  issues: Issue[];
}

export const HighRiskLocalities = ({ issues }: HighRiskLocalitiesProps) => {
  const byLocality: Record<string, { total: number; critical: number }> = {};
  for (const issue of issues) {
    const key = issue.localityId || 'custom-locality';
    if (!byLocality[key]) byLocality[key] = { total: 0, critical: 0 };
    byLocality[key].total += 1;
    if (issue.severity === 'critical' || issue.severity === 'high') byLocality[key].critical += 1;
  }
  const sorted = Object.entries(byLocality)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.critical - a.critical || b.total - a.total)
    .slice(0, 5);

  return (
    <GlassCard className="p-6">
      <h3 className="font-display text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>High Risk Localities</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No locality data yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)] capitalize">{loc.id.replace(/-/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">{loc.total} issues</span>
                {loc.critical > 0 && (
                  <span className="text-[0.625rem] px-2 py-0.5 rounded-full bg-[#8b0000]/20 text-[#8b0000] font-medium">{loc.critical} critical</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
