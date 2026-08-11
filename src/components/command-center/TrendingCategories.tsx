import { GlassCard } from './GlassCard';
import type { Issue } from '../../types/issue';
import { ISSUE_CATEGORY_LABELS } from '../../types/issue';

interface TrendingCategoriesProps {
  issues: Issue[];
}

export const TrendingCategories = ({ issues }: TrendingCategoriesProps) => {
  const counts: Record<string, number> = {};
  for (const issue of issues) {
    counts[issue.category] = (counts[issue.category] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <GlassCard className="p-6">
      <h3 className="font-display text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>Trending Categories</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No issues reported yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(([cat, count]) => (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">{ISSUE_CATEGORY_LABELS[cat as keyof typeof ISSUE_CATEGORY_LABELS] || cat}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(count / max) * 100}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
