import type { StateCreator } from 'zustand';
import type { VerificationStats, VerificationAction } from '../../types/verification';
import type { CommunityUpdate } from '../../types/issue';

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
  addPhoto: (issueId: string, photoUrl: string) => void;
  addComment: (issueId: string, comment: string) => void;
  clearVerification: (issueId: string) => void;
  getVerification: (issueId: string) => VerificationStats | null;
}

const createEmptyStats = (): VerificationStats => ({
  confirmsExisting: 0,
  marksFixed: 0,
  communityPhotos: [],
  updates: [],
  lastVerifiedAt: new Date().toISOString(),
});

export const createVerificationSlice: StateCreator<VerificationSlice, [], [], VerificationSlice> = (set, get) => ({
  verifications: {},
  isLoading: false,
  error: null,

  fetchVerification: async (_issueId: string) => {
    set({ isLoading: false });
  },

  submitAction: async (_action: VerificationAction) => {
    // Will connect to backend when available
  },

  addConfirm: (issueId) =>
    set((state) => {
      const existing = state.verifications[issueId] || createEmptyStats();
      const update: CommunityUpdate = {
        id: `vu-${Date.now()}`,
        type: 'confirm',
        userId: 'anonymous',
        timestamp: new Date().toISOString(),
        content: 'Confirmed',
      };
      return {
        verifications: {
          ...state.verifications,
          [issueId]: {
            ...existing,
            confirmsExisting: existing.confirmsExisting + 1,
            updates: [...existing.updates, update],
            lastVerifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  addMarkFixed: (issueId) =>
    set((state) => {
      const existing = state.verifications[issueId] || createEmptyStats();
      const update: CommunityUpdate = {
        id: `vu-${Date.now()}`,
        type: 'mark_fixed',
        userId: 'anonymous',
        timestamp: new Date().toISOString(),
        content: 'Marked as fixed',
      };
      return {
        verifications: {
          ...state.verifications,
          [issueId]: {
            ...existing,
            marksFixed: existing.marksFixed + 1,
            updates: [...existing.updates, update],
            lastVerifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  addPhoto: (issueId, photoUrl) =>
    set((state) => {
      const existing = state.verifications[issueId] || createEmptyStats();
      const photo = {
        id: `photo-${Date.now()}`,
        url: photoUrl,
        thumbnailUrl: photoUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'anonymous',
        isBefore: false,
      };
      const update: CommunityUpdate = {
        id: `vu-${Date.now()}`,
        type: 'photo',
        userId: 'anonymous',
        timestamp: new Date().toISOString(),
        content: photo,
      };
      return {
        verifications: {
          ...state.verifications,
          [issueId]: {
            ...existing,
            communityPhotos: [...existing.communityPhotos, photo],
            updates: [...existing.updates, update],
            lastVerifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  addComment: (issueId, comment) =>
    set((state) => {
      const existing = state.verifications[issueId] || createEmptyStats();
      const update: CommunityUpdate = {
        id: `vu-${Date.now()}`,
        type: 'comment',
        userId: 'anonymous',
        timestamp: new Date().toISOString(),
        content: comment,
      };
      return {
        verifications: {
          ...state.verifications,
          [issueId]: {
            ...existing,
            updates: [...existing.updates, update],
            lastVerifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  clearVerification: (issueId) =>
    set((state) => {
      const { [issueId]: _, ...rest } = state.verifications;
      return { verifications: rest };
    }),

  getVerification: (issueId) => {
    return get().verifications[issueId] || null;
  },
});