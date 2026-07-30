import type { StateCreator } from 'zustand';
import type { Locality } from '../../types/locality';

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
    // TODO: Connect to API
    set({ isLoading: false });
  },
});