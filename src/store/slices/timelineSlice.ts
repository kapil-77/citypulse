import type { StateCreator } from 'zustand';
import type { TimelineEvent } from '../../types/issue';

/**
 * FUTURE FEATURE: Timeline Slice
 * This slice is a stub ready for Phase 5 implementation.
 * The schema and state shape are fully defined so components can be built against it.
 */

export interface TimelineSlice {
  events: Record<string, TimelineEvent[]>; // keyed by issueId
  isLoading: boolean;
  error: string | null;

  // Stub actions — implement when backend is ready
  fetchTimeline: (issueId: string) => Promise<void>;
  addEvent: (issueId: string, event: TimelineEvent) => void;
  clearTimeline: (issueId: string) => void;
}

export const createTimelineSlice: StateCreator<TimelineSlice, [], [], TimelineSlice> = (set) => ({
  events: {},
  isLoading: false,
  error: null,

  fetchTimeline: async (_issueId: string) => {
    // TODO: Implement when Timeline feature is built (Phase 5)
    set({ isLoading: false });
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