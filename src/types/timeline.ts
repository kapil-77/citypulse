import type { TimelineEvent } from './issue';

export interface TimelineGroup {
  date: string; // ISO date string (YYYY-MM-DD)
  events: TimelineEvent[];
}

export type TimelineFilter = 'all' | 'reported' | 'work_started' | 'photo_update' | 'status_change' | 'resolved';

export interface TimelineState {
  events: Record<string, TimelineEvent[]>; // keyed by issueId
  isLoading: boolean;
  error: string | null;
}