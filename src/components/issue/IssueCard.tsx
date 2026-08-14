import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import type { Issue } from '../../types/issue';

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
}

export const IssueCard = memo(function IssueCard({ issue, compact = false }: IssueCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    if (h < 48) return 'yesterday';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleClick = () => navigate(`/issue/${issue.id}`);

  if (compact) {
    return (
      <div onClick={handleClick} className="flex items-center gap-5 py-5 border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer">
        <div className="flex-shrink-0 w-20 h-20 border border-[var(--black)] bg-[var(--bg-muted)] overflow-hidden">
          {issue.photos[0] ? (
            <img src={issue.photos[0].thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">No photo</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-[var(--text-primary)] truncate">{issue.title}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] truncate mb-2">{issue.address}</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={issue.status} />
            <span className="label text-[0.625rem]">{formatDate(issue.reportedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card variant="interactive" padding="md" onClick={handleClick}>
      {issue.photos[0] && (
        <div className="relative -mx-7 -mt-7 mb-5 overflow-hidden border-b border-[var(--black)]" style={{ maxHeight: '240px' }}>
          <img src={issue.photos[0].url} alt={issue.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 mb-2">
        <CardTitle className="text-lg">{issue.title}</CardTitle>
      </div>
      <CardDescription className="line-clamp-2 mb-3">{issue.description}</CardDescription>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] truncate max-w-[200px]">{issue.address}</span>
        <span className="label">{formatDate(issue.reportedAt)}</span>
      </div>
    </Card>
  );
});

export default IssueCard;