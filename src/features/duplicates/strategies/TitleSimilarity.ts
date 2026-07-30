import type { DuplicateStrategy } from '../duplicateEngine';
import type { NewIssue, Issue } from '../../../types/issue';

/**
 * Title Similarity Strategy
 * Uses Levenshtein distance to compare titles.
 */
export const TitleSimilarityStrategy: DuplicateStrategy = {
  name: 'Title Similarity',
  weight: 0.2,

  check(input: NewIssue, existing: Issue): number {
    const a = input.title.toLowerCase();
    const b = existing.title.toLowerCase();

    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.8;

    const distance = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    const similarity = 1 - distance / maxLen;

    return Math.max(0, similarity);
  },
};

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}