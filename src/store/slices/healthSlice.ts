import type { StateCreator } from 'zustand';
import type { HealthScoreResult } from '../../types/health';
import { apiClient } from '../../services/api/client';

/**
 * Health Score Slice — fetches city/state-wise health scores from the backend.
 */

export interface HealthSlice {
  scores: Record<string, HealthScoreResult>; // keyed by location name
  isLoading: boolean;
  error: string | null;

  fetchHealthScore: (location: string) => Promise<void>;
  setHealthScore: (location: string, score: HealthScoreResult) => void;
  clearScores: () => void;
  getHealthScore: (location: string) => HealthScoreResult | undefined;
}

export const createHealthSlice: StateCreator<HealthSlice, [], [], HealthSlice> = (set, get) => ({
  scores: {},
  isLoading: false,
  error: null,

  fetchHealthScore: async (location: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<HealthScoreResult>(`/health/${encodeURIComponent(location)}`);
      if (res.error) {
        set({ error: res.error, isLoading: false });
        return;
      }
      set((state) => ({
        scores: { ...state.scores, [location]: res.data },
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  setHealthScore: (location, score) =>
    set((state) => ({
      scores: { ...state.scores, [location]: score },
    })),

  clearScores: () => set({ scores: {} }),

  getHealthScore: (location) => get().scores[location],
});