import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { CategoryBadge, StatusBadge, SeverityBadge } from '../ui/Badge';
import type { Issue } from '../../types/issue';

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
}

export const IssueCard = ({ issue, compact = false }: IssueCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'yesterday';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleClick = () => navigate(`/issue/${issue.id}`);

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3 py-3 border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
      >
        <div className="flex-shrink-0 w-10 h-10 border border-[var(--border)] bg-[var(--bg-muted)] flex items-center justify-center text-sm overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
          {issue.photos[0] ? (
            <img src={issue.photos[0].thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--text-muted)]">
              <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 003 4.5v3.879a1.5 1.5 0 004.485 1.22l.432-.432.432.432a1.5 1.5 0 004.486-1.22V6.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5v.621a.75.75 0 01-1.5 0v-.5a.75.75 0 00-.75-.75H6.5a.75.75 0 000 1.5v.621a.75.75 0 01-1.5 0V6.5a.75.75 0 00-.75-.75h-1.5A.75.75 0 002 6.5v.75a.75.75 0 001.5 0V6.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{issue.title}</span>
            <span className="label text-[0.625rem]">{formatDate(issue.reportedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] truncate">{issue.address}</span>
            <StatusBadge status={issue.status} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card variant="interactive" padding="md" onClick={handleClick}>
      {issue.photos[0] && (
        <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden" style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}>
          <img src={issue.photos[0].url} alt={issue.title} className="w-full h-40 object-cover" />
          <div className="absolute top-2 left-2">
            <CategoryBadge category={issue.category} />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <CardTitle className="text-base">{issue.title}</CardTitle>
        <SeverityBadge severity={issue.severity} />
      </div>

      <CardDescription className="line-clamp-2 mb-4">{issue.description}</CardDescription>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <span className="truncate max-w-[180px]">{issue.address}</span>
        </div>
        <span className="label">{formatDate(issue.reportedAt)}</span>
      </div>
    </Card>
  );
};