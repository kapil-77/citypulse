import type { IssueCategory, IssueSeverity, IssueStatus } from '../../types/issue';
import { ISSUE_CATEGORY_LABELS } from '../../types/issue';

interface BadgeProps {
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
  className?: string;
}

const colorStyles = {
  green: 'border-[var(--status-green)] text-[var(--status-green)]',
  yellow: 'border-[var(--status-yellow)] text-[var(--status-yellow)]',
  red: 'border-[var(--status-red)] text-[var(--status-red)]',
  blue: 'border-[var(--status-blue)] text-[var(--status-blue)]',
  gray: 'border-[var(--border-dark)] text-[var(--text-secondary)]',
};

export const Badge = ({ color = 'blue', children, className = '' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider border ${colorStyles[color]} ${className}`}
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      {children}
    </span>
  );
};

export const CategoryBadge = ({ category }: { category: IssueCategory }) => {
  const colorMap: Record<IssueCategory, BadgeProps['color']> = {
    roads: 'yellow',
    garbage: 'red',
    water_leakage: 'blue',
    street_lights: 'blue',
    sewage: 'red',
    encroachment: 'yellow',
    parks: 'green',
    public_safety: 'red',
    other: 'gray',
  };

  return (
    <Badge color={colorMap[category]}>
      {ISSUE_CATEGORY_LABELS[category]}
    </Badge>
  );
};

export const SeverityBadge = ({ severity }: { severity: IssueSeverity }) => {
  const colorMap: Record<IssueSeverity, BadgeProps['color']> = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
    critical: 'red',
  };

  const labels: Record<IssueSeverity, string> = {
    low: 'Low',
    medium: 'Med',
    high: 'High',
    critical: 'Crit',
  };

  return (
    <Badge color={colorMap[severity]}>
      {labels[severity]}
    </Badge>
  );
};

export const StatusBadge = ({ status }: { status: IssueStatus }) => {
  const colorMap: Record<IssueStatus, BadgeProps['color']> = {
    reported: 'blue',
    under_review: 'yellow',
    work_started: 'blue',
    in_progress: 'yellow',
    resolved: 'green',
    verified_resolved: 'green',
  };

  const labels: Record<IssueStatus, string> = {
    reported: 'Reported',
    under_review: 'Review',
    work_started: 'Working',
    in_progress: 'In Prog.',
    resolved: 'Resolved',
    verified_resolved: 'Verified',
  };

  return (
    <Badge color={colorMap[status]}>
      {labels[status]}
    </Badge>
  );
};