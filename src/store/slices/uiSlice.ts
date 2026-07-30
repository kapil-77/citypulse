import type { StateCreator } from 'zustand';

export type BottomSheetView = 'none' | 'issues_list' | 'issue_detail' | 'report' | 'locality';

export interface UiSlice {
  isBottomSheetOpen: boolean;
  bottomSheetView: BottomSheetView;
  bottomSheetHeight: number; // percentage 0-100
  isFocused: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  openBottomSheet: (view: BottomSheetView) => void;
  closeBottomSheet: () => void;
  setBottomSheetHeight: (height: number) => void;
  setFocused: (focused: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  isBottomSheetOpen: false,
  bottomSheetView: 'none',
  bottomSheetHeight: 40,
  isFocused: false,
  toast: null,

  openBottomSheet: (view) => set({ isBottomSheetOpen: true, bottomSheetView: view }),
  closeBottomSheet: () => set({ isBottomSheetOpen: false, bottomSheetView: 'none' }),
  setBottomSheetHeight: (height) => set({ bottomSheetHeight: height }),
  setFocused: (focused) => set({ isFocused: focused }),
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
});