import type { IssueCategory } from './issue';

export interface Locality {
  id: string;
  name: string;
  city: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
  issueCount: number;
  unresolvedCount: number;

  // Future: Health score
  healthScore?: HealthScore;
}

export interface CategoryHealth {
  score: number;
  unresolvedCount: number;
  avgResolutionTime: number;
  communityConfirmed: number;
  color: 'green' | 'yellow' | 'red';
}

export interface HealthScore {
  overall: number;
  categories: Partial<Record<IssueCategory, CategoryHealth>>;
  trend: 'improving' | 'stable' | 'declining';
  updatedAt: string;
}