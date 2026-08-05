import type { StateCreator } from 'zustand';
import type { Locality } from '../../types/locality';
import { apiClient } from '../../services/api/client';

export interface LocalitySlice {
  localities: Locality[];
  selectedLocality: Locality | null;
  isLoading: boolean;

  setLocalities: (localities: Locality[]) => void;
  addLocality: (locality: Locality) => void;
  selectLocality: (locality: Locality | null) => void;
  setLoading: (loading: boolean) => void;
  fetchLocalities: () => Promise<void>;
}

export const createLocalitySlice: StateCreator<LocalitySlice, [], [], LocalitySlice> = (set) => ({
  localities: [],
  selectedLocality: null,
  isLoading: false,

  setLocalities: (localities) => set({ localities }),
  addLocality: (locality) => set((state) => ({ localities: [...state.localities, locality] })),
  selectLocality: (locality) => set({ selectedLocality: locality }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchLocalities: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get<Locality[]>('/localities');
      if (res.error) {
        set({ isLoading: false });
        return;
      }
      set({ localities: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
});