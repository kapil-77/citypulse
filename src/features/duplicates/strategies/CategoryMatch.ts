import type { DuplicateStrategy } from '../duplicateEngine';
import type { NewIssue, Issue } from '../../../types/issue';

/**
 * Category Match Strategy
 * Same category = higher chance of duplicate.
 */
export const CategoryMatchStrategy: DuplicateStrategy = {
  name: 'Category Match',
  weight: 0.25,

  check(input: NewIssue, existing: Issue): number {
    return input.category === existing.category ? 1 : 0;
  },
};