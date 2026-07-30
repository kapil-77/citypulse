import { useState, useCallback } from 'react';
import { duplicateEngine, type DuplicateResult } from '../features/duplicates/duplicateEngine';
import { GpsProximityStrategy } from '../features/duplicates/strategies/GpsProximity';
import { CategoryMatchStrategy } from '../features/duplicates/strategies/CategoryMatch';
import { TitleSimilarityStrategy } from '../features/duplicates/strategies/TitleSimilarity';
import { compareWithAi } from '../features/duplicates/strategies/AiSimilarity';
import type { NewIssue, Issue } from '../types/issue';

// Register strategies once
let strategiesRegistered = false;
function ensureStrategies() {
  if (!strategiesRegistered) {
    duplicateEngine.registerStrategy(GpsProximityStrategy);
    duplicateEngine.registerStrategy(CategoryMatchStrategy);
    duplicateEngine.registerStrategy(TitleSimilarityStrategy);
    strategiesRegistered = true;
  }
}

interface DuplicateCheckState {
  isChecking: boolean;
  duplicates: DuplicateResult[];
  error: string | null;
  hasChecked: boolean;
}

export const useDuplicateCheck = () => {
  const [state, setState] = useState<DuplicateCheckState>({
    isChecking: false,
    duplicates: [],
    error: null,
    hasChecked: false,
  });

  const checkForDuplicates = useCallback(async (
    newIssue: NewIssue,
    existingIssues: Issue[],
    threshold = 0.6
  ) => {
    ensureStrategies();
    setState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      // Run synchronous strategies first
      const results = await duplicateEngine.findDuplicates(newIssue, existingIssues, threshold);
      
      // If we have results and the new issue has a photo, try AI comparison for top candidates
      if (newIssue.photos.length > 0 && results.length > 0) {
        const topResults = results.slice(0, 3); // Check top 3
        
        for (const result of topResults) {
          if (result.existingIssue.photos.length > 0) {
            const aiScore = await compareWithAi(
              newIssue.photos[0],
              result.existingIssue.photos[0].thumbnailUrl
            );
            
            if (aiScore > 0) {
              // Blend AI score into the result
              const blendedScore = Math.round(
                (result.similarityScore * 0.7 + aiScore * 100 * 0.3)
              );
              result.similarityScore = Math.min(100, blendedScore);
              if (aiScore > 0.5) {
                result.matchedStrategies.push('AI Visual Match');
              }
            }
          }
        }
        
        // Re-sort after AI scores
        results.sort((a, b) => b.similarityScore - a.similarityScore);
      }

      setState({
        isChecking: false,
        duplicates: results,
        error: null,
        hasChecked: true,
      });

      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Duplicate check failed';
      setState({ isChecking: false, duplicates: [], error: message, hasChecked: true });
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isChecking: false, duplicates: [], error: null, hasChecked: false });
  }, []);

  return {
    ...state,
    checkForDuplicates,
    reset,
  };
};