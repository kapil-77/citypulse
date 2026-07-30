/**
 * Duplicate Detection Engine — Future Feature (Phase 7)
 * 
 * Uses the Strategy Pattern so strategies can be combined,
 * reordered, or extended independently without modifying existing code.
 */

import type { Issue, NewIssue } from '../../types/issue';

export interface DuplicateStrategy {
  name: string;
  weight: number;
  check(input: NewIssue, existing: Issue): number;
}

export interface DuplicateResult {
  existingIssue: Issue;
  similarityScore: number;
  matchedStrategies: string[];
}

export class DuplicateEngine {
  private strategies: DuplicateStrategy[] = [];

  registerStrategy(strategy: DuplicateStrategy): void {
    this.strategies.push(strategy);
  }

  async findDuplicates(
    newIssue: NewIssue,
    existingIssues: Issue[],
    threshold = 0.6
  ): Promise<DuplicateResult[]> {
    const results: DuplicateResult[] = [];

    for (const existing of existingIssues) {
      let totalScore = 0;
      let totalWeight = 0;
      const matchedStrategies: string[] = [];

      for (const strategy of this.strategies) {
        const score = strategy.check(newIssue, existing);
        totalScore += score * strategy.weight;
        totalWeight += strategy.weight;

        if (score > 0.3) {
          matchedStrategies.push(strategy.name);
        }
      }

      const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;

      if (averageScore >= threshold) {
        results.push({
          existingIssue: existing,
          similarityScore: Math.round(averageScore * 100),
          matchedStrategies,
        });
      }
    }

    // Sort by similarity score descending
    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}

export const duplicateEngine = new DuplicateEngine();