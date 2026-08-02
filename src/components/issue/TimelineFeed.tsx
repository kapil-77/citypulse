import { useMemo } from 'react';
import type { TimelineEvent } from '../../types/issue';

interface TimelineFeedProps {
  events: TimelineEvent[];
  className?: string;
}

const eventStyles: Record<TimelineEvent['type'], { label: string }> = {
  reported: { label: 'Issue Reported' },
  work_started: { label: 'Work Started' },
  photo_update: { label: 'Photo Added' },
  status_change: { label: 'Status Change' },
  resolved: { label: 'Issue Resolved' },
};

const formatRelativeTime = (ts: string) => {
  const date = new Date(ts);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    reported: 'Issue Reported', under_review: 'Under Review', work_started: 'Work Started',
    in_progress: 'In Progress', resolved: 'Issue Resolved', verified_resolved: 'Verified Resolved',
  };
  return labels[status] || status;
};

export const TimelineFeed = ({ events, className = '' }: TimelineFeedProps) => {
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
      const key = new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime());
  }, [events]);

  if (events.length === 0) return <div className="text-center py-8"><p className="text-sm text-[var(--text-muted)]">No timeline events yet</p></div>;

  return (
    <div className={className}>
      {groupedEvents.map(([date, dateEvents]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[var(--border-light)]" />
            <span className="label">{date}</span>
            <div className="h-px flex-1 bg-[var(--border-light)]" />
          </div>

          <div>
            {dateEvents.map((event, idx) => {
              const isLast = idx === dateEvents.length - 1;
              return (
                <div key={event.id} className="flex gap-4 pb-6 relative">
                  {!isLast && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--border-light)]" />}
                  <div className="relative z-10 flex-shrink-0 w-7 h-7 bg-[var(--black)] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase">
                      {event.type === 'reported' ? 'R' : event.type === 'work_started' ? 'W' : event.type === 'photo_update' ? 'P' : event.type === 'resolved' ? '✓' : '→'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {event.type === 'status_change' ? getStatusLabel(event.status) : eventStyles[event.type].label}
                      </p>
                      <span className="label text-[0.625rem]">{formatRelativeTime(event.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-muted)]">{event.user.name}</span>
                      {'department' in event.user && event.user.department && <span className="text-xs text-[var(--text-muted)]">· {event.user.department}</span>}
                    </div>
                    {event.notes && <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed border-l-2 border-[var(--border)] pl-3">{event.notes}</p>}
                    {event.photo && <img src={event.photo.thumbnailUrl} alt="Event photo" className="mt-2 w-20 h-20 object-cover border border-[var(--black)]" />}
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