import type { Photo, CommunityUpdate } from './issue';

export interface VerificationState {
  verifications: Record<string, VerificationStats>; // keyed by issueId
  isLoading: boolean;
  error: string | null;
}

export interface VerificationStats {
  confirmsExisting: number;
  marksFixed: number;
  communityPhotos: Photo[];
  updates: CommunityUpdate[];
  lastVerifiedAt: string;
}

export interface VerificationAction {
  issueId: string;
  type: 'confirm' | 'mark_fixed' | 'photo' | 'comment';
  userId: string;
  content?: string | File;
}