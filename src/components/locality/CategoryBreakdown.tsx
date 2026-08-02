import { Card } from '../ui/Card';
import type { CategoryHealth } from '../../types/locality';
import type { IssueCategory } from '../../types/issue';
import { ISSUE_CATEGORY_LABELS } from '../../types/issue';

interface CategoryBreakdownProps {
  categories: Partial<Record<IssueCategory, CategoryHealth>>;
  className?: string;
}

const colorClasses = {
  green: { dot: 'bg-[var(--status-green)]', bar: 'bg-[var(--status-green)]', text: 'text-[var(--status-green)]' },
  yellow: { dot: 'bg-[var(--black)]', bar: 'bg-[var(--black)]', text: 'text-[var(--text-primary)]' },
  red: { dot: 'bg-[var(--status-red)]', bar: 'bg-[var(--status-red)]', text: 'text-[var(--status-red)]' },
};

export const CategoryBreakdown = ({ categories, className = '' }: CategoryBreakdownProps) => {
  const entries = Object.entries(categories) as [IssueCategory, CategoryHealth][];

  if (entries.length === 0) {
    return <div className={`text-center py-6 ${className}`}><p className="text-sm text-[var(--text-muted)]">No category data available</p></div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {entries.map(([category, health]) => {
        const colors = colorClasses[health.color];
        return (
          <Card key={category} padding="md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${colors.dot}`} />
                <span className="text-sm font-medium text-[var(--text-primary)]">{ISSUE_CATEGORY_LABELS[category] || category}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold ${colors.text}`}>{health.score}</span>
                <span className="label text-[0.625rem]">/ 100</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[var(--border-light)]">
              <div className={`h-full transition-all duration-700 ease-out ${colors.bar}`} style={{ width: `${health.score}%` }} />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="label text-[0.625rem]">{health.unresolvedCount} unresolved</span>
              {health.avgResolutionTime > 0 && <span className="label text-[0.625rem]">~{Math.round(health.avgResolutionTime)}h avg</span>}
              {health.communityConfirmed > 0 && <span className="label text-[0.625rem]">{health.communityConfirmed} confirmed</span>}
            </div>
          </Card>
        );
      })}
    </div>
  );
};