import type { CommunityUpdate } from '../../types/issue';

interface CommunityFeedProps {
  updates: CommunityUpdate[];
  className?: string;
}

const updateStyles: Record<CommunityUpdate['type'], { label: string; border: string }> = {
  confirm: { label: 'Confirmed still exists', border: 'border-l-[var(--status-green)]' },
  mark_fixed: { label: 'Marked as fixed', border: 'border-l-[var(--status-green)]' },
  photo: { label: 'Added a photo', border: 'border-l-[var(--accent)]' },
  comment: { label: 'Left a comment', border: 'border-l-[var(--status-blue)]' },
};

const formatRelativeTime = (ts: string) => {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const CommunityFeed = ({ updates, className = '' }: CommunityFeedProps) => {
  if (updates.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-serif font-semibold text-[var(--text-primary)] mb-3">Community Activity</h3>
      {updates.map((update) => {
        const { label, border } = updateStyles[update.type];
        return (
          <div key={update.id} className={`border-l-2 ${border} pl-4 py-2`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
              <span className="label text-[0.625rem]">{formatRelativeTime(update.timestamp)}</span>
            </div>
            {typeof update.content === 'string' && update.type === 'comment' && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">{update.content}</p>
            )}
            {typeof update.content !== 'string' && update.type === 'photo' && update.content && (
              <img
                src={(update.content as any).thumbnailUrl || (update.content as any).url}
                alt="Community photo"
                className="mt-2 w-16 h-16 object-cover border border-[var(--border)]"
                style={{ borderRadius: 'var(--radius-sm)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};