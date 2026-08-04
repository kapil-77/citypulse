import type { StateCreator } from 'zustand';
import type { TimelineEvent } from '../../types/issue';
import { apiClient } from '../../services/api/client';

/**
 * Timeline Slice — fetches timeline events from the backend.
 */

export interface TimelineSlice {
  events: Record<string, TimelineEvent[]>; // keyed by issueId
  isLoading: boolean;
  error: string | null;

  fetchTimeline: (issueId: string) => Promise<void>;
  addEvent: (issueId: string, event: TimelineEvent) => void;
  clearTimeline: (issueId: string) => void;
}

export const createTimelineSlice: StateCreator<TimelineSlice, [], [], TimelineSlice> = (set) => ({
  events: {},
  isLoading: false,
  error: null,

  fetchTimeline: async (issueId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<TimelineEvent[]>(`/timeline/${issueId}`);
      if (res.error) {
        set({ error: res.error, isLoading: false });
        return;
      }
      set((state) => ({
        events: { ...state.events, [issueId]: res.data },
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addEvent: (issueId, event) =>
    set((state) => ({
      events: {
        ...state.events,
        [issueId]: [...(state.events[issueId] || []), event],
      },
    })),

  clearTimeline: (issueId) =>
    set((state) => {
      const { [issueId]: _, ...rest } = state.events;
      return { events: rest };
    }),
});