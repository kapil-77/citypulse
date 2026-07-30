import { create } from 'zustand';
import { createIssueSlice, type IssueSlice } from './slices/issueSlice';
import { createMapSlice, type MapSlice } from './slices/mapSlice';
import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createLocalitySlice, type LocalitySlice } from './slices/localitySlice';
import { createTimelineSlice, type TimelineSlice } from './slices/timelineSlice';
import { createVerificationSlice, type VerificationSlice } from './slices/verificationSlice';
import { createHealthSlice, type HealthSlice } from './slices/healthSlice';
import { DEMO_ISSUES } from '../data/demoData';

export type AppStore = IssueSlice & MapSlice & UiSlice & LocalitySlice & TimelineSlice & VerificationSlice & HealthSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createIssueSlice(...a),
  ...createMapSlice(...a),
  ...createUiSlice(...a),
  ...createLocalitySlice(...a),
  ...createTimelineSlice(...a),
  ...createVerificationSlice(...a),
  ...createHealthSlice(...a),
}));

// Seed demo data on initial load
useStore.getState().setIssues(DEMO_ISSUES);

// Selector hooks for performance
export const useIssues = () => useStore((s) => s.issues);
export const useSelectedIssue = () => useStore((s) => s.selectedIssue);
export const useIssueFilters = () => useStore((s) => s.filters);
export const useMapState = () => useStore((s) => ({ center: s.center, zoom: s.zoom, selectedIssueId: s.selectedIssueId }));
export const useUiState = () => useStore((s) => ({ isBottomSheetOpen: s.isBottomSheetOpen, bottomSheetView: s.bottomSheetView, bottomSheetHeight: s.bottomSheetHeight }));
export const useLocalities = () => useStore((s) => s.localities);
export const useSelectedLocality = () => useStore((s) => s.selectedLocality);