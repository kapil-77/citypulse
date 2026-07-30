import type { IssueCategory } from './issue';
import type { CategoryHealth } from './locality';

export interface CategoryInput {
  unresolvedCount: number;
  severityDistribution: Record<string, number>;
  communityConfirmations: number;
  avgResolutionTime: number;
}

export interface HealthScoreInput {
  unresolvedCount: number;
  severityDistribution: Record<string, number>;
  communityConfirmations: number;
  avgResolutionTime: number;
  totalIssues: number;
  // Extended fields for per-category scoring and trend detection
  previousOverall?: number;
  categoryInputs?: Record<string, CategoryInput>;
}

export interface HealthScoreResult {
  overall: number;
  categories: Partial<Record<IssueCategory, CategoryHealth>>;
  trend: 'improving' | 'stable' | 'declining';
  updatedAt: string;
}

export interface HealthState {
  scores: Record<string, HealthScoreResult>; // keyed by localityId
  isLoading: boolean;
  error: string | null;
}