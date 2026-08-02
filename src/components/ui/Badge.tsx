import type { IssueCategory, IssueSeverity, IssueStatus } from '../../types/issue';
import { ISSUE_CATEGORY_LABELS } from '../../types/issue';

interface BadgeProps {
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
  className?: string;
}

const colorStyles = {
  green: 'bg-[var(--black)] text-[var(--status-green)]',
  yellow: 'bg-[var(--black)] text-[var(--status-red)]',
  red: 'bg-[var(--black)] text-[var(--status-red)]',
  blue: 'bg-[var(--black)] text-white',
  gray: 'bg-[var(--black)] text-[var(--text-muted)]',
};

export const Badge = ({ color = 'blue', children, className = '' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] border border-[var(--black)] ${colorStyles[color]} ${className}`}>
      {children}
    </span>
  );
};

export const CategoryBadge = ({ category }: { category: IssueCategory }) => {
  const colorMap: Record<IssueCategory, BadgeProps['color']> = {
    roads: 'blue',
    garbage: 'red',
    water_leakage: 'blue',
    street_lights: 'blue',
    sewage: 'red',
    encroachment: 'yellow',
    parks: 'green',
    public_safety: 'red',
    other: 'gray',
  };
  return <Badge color={colorMap[category]}>{ISSUE_CATEGORY_LABELS[category]}</Badge>;
};

export const SeverityBadge = ({ severity }: { severity: IssueSeverity }) => {
  const colorMap: Record<IssueSeverity, BadgeProps['color']> = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
    critical: 'red',
  };
  const labels: Record<IssueSeverity, string> = {
    low: 'Low', medium: 'Med', high: 'High', critical: 'Crit',
  };
  return <Badge color={colorMap[severity]}>{labels[severity]}</Badge>;
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
    reported: 'Reported', under_review: 'Review', work_started: 'Working',
    in_progress: 'In Prog.', resolved: 'Resolved', verified_resolved: 'Verified',
  };
  return <Badge color={colorMap[status]}>{labels[status]}</Badge>;
};