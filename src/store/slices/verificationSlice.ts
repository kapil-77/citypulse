import type { StateCreator } from 'zustand';
import type { VerificationStats, VerificationAction } from '../../types/verification';
import { apiClient } from '../../services/api/client';

/**
 * Verification Slice — Phase 6 Implementation
 * Manages community verification state and actions for each issue.
 */

export interface VerificationSlice {
  verifications: Record<string, VerificationStats>;
  isLoading: boolean;
  error: string | null;

  fetchVerification: (issueId: string) => Promise<void>;
  submitAction: (action: VerificationAction) => Promise<void>;
  
  // Direct state actions
  addConfirm: (issueId: string) => void;
  addMarkFixed: (issueId: string) => void;
  addPhoto: (issueId: string, file: File) => void;
  addComment: (issueId: string, comment: string) => void;
  clearVerification: (issueId: string) => void;
  getVerification: (issueId: string) => VerificationStats | null;
}

export const createVerificationSlice: StateCreator<VerificationSlice, [], [], VerificationSlice> = (set, get) => ({
  verifications: {},
  isLoading: false,
  error: null,

  fetchVerification: async (issueId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<VerificationStats>(`/verifications/${issueId}`);
      if (res.error) {
        set({ error: res.error, isLoading: false });
        return;
      }
      set((state) => ({
        verifications: { ...state.verifications, [issueId]: res.data },
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  submitAction: async (action: VerificationAction) => {
    try {
      const res = await apiClient.post<VerificationStats>(
        `/verifications/${action.issueId}/action`,
        { type: action.type, userId: action.userId, content: action.content }
      );
      if (res.error) {
        set({ error: res.error });
        return;
      }
      set((state) => ({
        verifications: { ...state.verifications, [action.issueId]: res.data },
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addConfirm: (issueId) => {
    void get().submitAction({ issueId, type: 'confirm', userId: 'anonymous' });
  },

  addMarkFixed: (issueId) => {
    void get().submitAction({ issueId, type: 'mark_fixed', userId: 'anonymous' });
  },

  addPhoto: async (issueId, file) => {
    try {
      // Upload the photo file to the server first so it persists
      const formData = new FormData();
      formData.append('photos', file);
      formData.append('uploadedBy', 'anonymous');
      formData.append('isBefore', 'false');

      const uploadRes = await apiClient.upload<{ photos: { url: string }[] }>('/uploads', formData);
      if (uploadRes.error) {
        set({ error: `Photo upload failed: ${uploadRes.error}` });
        return;
      }
      const photoUrl = uploadRes.data.photos[0]?.url;
      if (!photoUrl) {
        set({ error: 'Photo upload returned no URL' });
        return;
      }
      await get().submitAction({ issueId, type: 'photo', userId: 'anonymous', content: photoUrl });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addComment: (issueId, comment) => {
    void get().submitAction({ issueId, type: 'comment', userId: 'anonymous', content: comment });
  },

  clearVerification: (issueId) =>
    set((state) => {
      const { [issueId]: _, ...rest } = state.verifications;
      return { verifications: rest };
    }),

  getVerification: (issueId) => {
    return get().verifications[issueId] || null;
  },
});