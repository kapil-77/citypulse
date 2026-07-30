export type IssueCategory =
  | 'roads'
  | 'garbage'
  | 'water_leakage'
  | 'street_lights'
  | 'sewage'
  | 'encroachment'
  | 'parks'
  | 'public_safety'
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'reported'
  | 'under_review'
  | 'work_started'
  | 'in_progress'
  | 'resolved'
  | 'verified_resolved';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  isBefore: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isAuthority?: boolean;
  department?: string;
}

export interface Authority extends User {
  isAuthority: true;
  department: string;
  badge: string;
}

export interface TimelineEvent {
  id: string;
  issueId: string;
  type: 'reported' | 'work_started' | 'photo_update' | 'status_change' | 'resolved';
  timestamp: string;
  user: User | Authority;
  photo: Photo | null;
  status: IssueStatus;
  notes: string;
  metadata: Record<string, unknown>;
}

export interface CommunityUpdate {
  id: string;
  type: 'confirm' | 'mark_fixed' | 'photo' | 'comment';
  userId: string;
  timestamp: string;
  content: string | Photo;
}

export interface VerificationStats {
  confirmsExisting: number;
  marksFixed: number;
  communityPhotos: Photo[];
  updates: CommunityUpdate[];
  lastVerifiedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  location: GeoPoint;
  address: string;
  localityId: string;
  photos: Photo[];
  reportedBy: User | null;
  reportedAt: string;
  resolvedAt: string | null;
  updatedAt: string;

  // Future: Timeline integration
  timeline?: TimelineEvent[];

  // Future: Verification integration
  verification?: VerificationStats;

  // Future: Duplicate linking
  duplicateGroupId?: string;
  duplicateOf?: string;
}

export interface NewIssue {
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  location: GeoPoint;
  address: string;
  localityId: string;
  photos: File[];
}

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  roads: 'Roads',
  garbage: 'Garbage',
  water_leakage: 'Water Leakage',
  street_lights: 'Street Lights',
  sewage: 'Sewage',
  encroachment: 'Encroachment',
  parks: 'Parks',
  public_safety: 'Public Safety',
  other: 'Other',
};

export const ISSUE_CATEGORY_ICONS: Record<IssueCategory, string> = {
  roads: '🛣️',
  garbage: '🗑️',
  water_leakage: '💧',
  street_lights: '💡',
  sewage: '🔧',
  encroachment: '🚧',
  parks: '🌳',
  public_safety: '🛡️',
  other: '📌',
};