import type { StateCreator } from 'zustand';
import type { LocationResult } from '../../data/indiaLocations';

export interface LocationSlice {
  selectedLocation: LocationResult | null;
  selectLocation: (location: LocationResult | null) => void;
}

const DEFAULT_LOCATION: LocationResult = {
  name: 'New Delhi',
  state: 'Delhi',
  type: 'city',
  searchTerms: ['new delhi', 'delhi', 'dilli'],
};

export const createLocationSlice: StateCreator<LocationSlice, [], [], LocationSlice> = (set) => ({
  selectedLocation: DEFAULT_LOCATION,
  selectLocation: (location) => set({ selectedLocation: location }),
});