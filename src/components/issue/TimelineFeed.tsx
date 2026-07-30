import { useMemo } from 'react';
import type { TimelineEvent } from '../../types/issue';

interface TimelineFeedProps {
  events: TimelineEvent[];
  className?: string;
}

const eventColors: Record<TimelineEvent['type'], string> = {
  reported: 'bg-[var(--status-blue)]',
  work_started: 'bg-[var(--status-yellow)]',
  photo_update: 'bg-[var(--accent)]',
  status_change: 'bg-[var(--status-yellow)]',
  resolved: 'bg-[var(--status-green)]',
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

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    reported: 'Issue Reported',
    under_review: 'Under Review',
    work_started: 'Work Started',
    in_progress: 'In Progress',
    resolved: 'Issue Resolved',
    verified_resolved: 'Verified Resolved',
  };
  return labels[status] || status;
};

export const TimelineFeed = ({ events, className = '' }: TimelineFeedProps) => {
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
      const date = new Date(event.timestamp);
      const dateKey = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime());
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[var(--text-muted)]">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {groupedEvents.map(([date, dateEvents]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[var(--border-light)]" />
            <span className="label">{date}</span>
            <div className="h-px flex-1 bg-[var(--border-light)]" />
          </div>

          <div className="space-y-0">
            {dateEvents.map((event, idx) => {
              const isLast = idx === dateEvents.length - 1;
              return (
                <div key={event.id} className="flex gap-4 pb-6 relative">
                  {!isLast && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--border-light)]" />
                  )}
                  <div className={`relative z-10 flex-shrink-0 w-7 h-7 ${eventColors[event.type]} flex items-center justify-center`} style={{ borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-white text-[10px] font-bold uppercase">
                      {event.type === 'reported' ? 'R' : event.type === 'work_started' ? 'W' : event.type === 'photo_update' ? 'P' : event.type === 'resolved' ? '✓' : '→'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {event.type === 'status_change' ? getStatusLabel(event.status) : {
                          reported: 'Issue Reported',
                          work_started: 'Work Started',
                          photo_update: 'Photo Added',
                          resolved: 'Issue Resolved',
                        }[event.type] || event.type}
                      </p>
                      <span className="label text-[0.625rem]">{formatRelativeTime(event.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-muted)]">{event.user.name}</span>
                      {'department' in event.user && event.user.department && (
                        <span className="text-xs text-[var(--text-muted)]">· {event.user.department}</span>
                      )}
                    </div>
                    {event.notes && (
                      <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed border-l-2 border-[var(--border)] pl-3">
                        {event.notes}
                      </p>
                    )}
                    {event.photo && (
                      <img src={event.photo.thumbnailUrl} alt="Event photo" className="mt-2 w-20 h-20 object-cover border border-[var(--border)]" style={{ borderRadius: 'var(--radius-sm)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};