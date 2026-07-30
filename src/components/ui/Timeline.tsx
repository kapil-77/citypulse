import type { TimelineEvent } from '../../types/issue';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventIcons: Record<TimelineEvent['type'], string> = {
  reported: '📸',
  work_started: '👷',
  photo_update: '📷',
  status_change: '🔄',
  resolved: '✅',
};

const formatTimestamp = (ts: string) => {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export const Timeline = ({ events, className = '' }: TimelineProps) => {
  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-400 text-sm ${className}`}>
        No timeline events yet
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-100" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 pl-0">
            {/* Dot */}
            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-sm shadow-sm">
              {eventIcons[event.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-gray-900">{event.user.name}</span>
                <span className="text-xs text-gray-400">{formatTimestamp(event.timestamp)}</span>
              </div>
              {event.notes && (
                <p className="text-sm text-gray-600">{event.notes}</p>
              )}
              {event.photo && (
                <img
                  src={event.photo.thumbnailUrl}
                  alt="Timeline"
                  className="mt-2 rounded-lg w-24 h-24 object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};