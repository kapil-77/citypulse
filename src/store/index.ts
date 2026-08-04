import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createIssueSlice, type IssueSlice } from './slices/issueSlice';
import { createMapSlice, type MapSlice } from './slices/mapSlice';
import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createLocalitySlice, type LocalitySlice } from './slices/localitySlice';
import { createTimelineSlice, type TimelineSlice } from './slices/timelineSlice';
import { createVerificationSlice, type VerificationSlice } from './slices/verificationSlice';
import { createHealthSlice, type HealthSlice } from './slices/healthSlice';
import { createLocationSlice, type LocationSlice } from './slices/locationSlice';
import { DEMO_ISSUES } from '../data/demoData';

export type AppStore = IssueSlice & MapSlice & UiSlice & LocalitySlice & TimelineSlice & VerificationSlice & HealthSlice & LocationSlice;

export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createIssueSlice(...a),
      ...createMapSlice(...a),
      ...createUiSlice(...a),
      ...createLocalitySlice(...a),
      ...createTimelineSlice(...a),
      ...createVerificationSlice(...a),
      ...createHealthSlice(...a),
      ...createLocationSlice(...a),
    }),
    {
      name: 'citypulse-store',
      // Persist issues and community verification data across refreshes (local fallback cache)
      partialize: (state) => ({
        issues: state.issues,
        verifications: state.verifications,
      }),
    }
  )
);

// Bootstrap data loading:
// 1. Seed demo data only on very first visit (nothing persisted yet)
// 2. Then attempt to fetch fresh data from the backend API
// 3. If the API is unreachable, keep the seeded/persisted local data as fallback
(async () => {
  const { issues, fetchIssues, fetchLocalities } = useStore.getState();

  if (issues.length === 0) {
    useStore.getState().setIssues(DEMO_ISSUES);
  }

  // Try to load from the backend API (replaces local demo/persisted data on success)
  await fetchIssues();
  // Non-blocking localities fetch (best-effort)
  void fetchLocalities();
})();

// Selector hooks for performance
export const useIssues = () => useStore((s) => s.issues);
export const useSelectedIssue = () => useStore((s) => s.selectedIssue);
export const useIssueFilters = () => useStore((s) => s.filters);
export const useMapState = () => useStore((s) => ({ center: s.center, zoom: s.zoom, selectedIssueId: s.selectedIssueId }));
export const useUiState = () => useStore((s) => ({ isBottomSheetOpen: s.isBottomSheetOpen, bottomSheetView: s.bottomSheetView, bottomSheetHeight: s.bottomSheetHeight }));
export const useLocalities = () => useStore((s) => s.localities);
export const useSelectedLocality = () => useStore((s) => s.selectedLocality);
export const useSelectedLocation = () => useStore((s) => s.selectedLocation);
export const useSelectLocation = () => useStore((s) => s.selectLocation);
