import type { StateCreator } from 'zustand';
import type { HealthScoreResult } from '../../types/health';

/**
 * FUTURE FEATURE: Area Health Score Slice
 * This slice is a stub ready for Phase 8 implementation.
 */

export interface HealthSlice {
  scores: Record<string, HealthScoreResult>; // keyed by localityId
  isLoading: boolean;
  error: string | null;

  fetchHealthScore: (localityId: string) => Promise<void>;
  setHealthScore: (localityId: string, score: HealthScoreResult) => void;
  clearScores: () => void;
}

export const createHealthSlice: StateCreator<HealthSlice, [], [], HealthSlice> = (set) => ({
  scores: {},
  isLoading: false,
  error: null,

  fetchHealthScore: async (_localityId: string) => {
    // TODO: Implement when Health Score feature is built (Phase 8)
    set({ isLoading: false });
  },
  setHealthScore: (localityId, score) =>
    set((state) => ({
      scores: { ...state.scores, [localityId]: score },
    })),
  clearScores: () => set({ scores: {} }),
});