import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Ignore updates after unmount so a slow AI comparison can't set state on a dead component.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const checkForDuplicates = useCallback(async (
    newIssue: NewIssue,
    existingIssues: Issue[],
    threshold = 0.6
  ) => {
    ensureStrategies();
    setState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      // Use a low candidate threshold so visually-similar issues that don't match
      // on GPS/category/title still get a chance to be surfaced by AI comparison.
      const candidateThreshold = newIssue.photos.length > 0 ? 0.1 : threshold;
      const results = await duplicateEngine.findDuplicates(newIssue, existingIssues, candidateThreshold);

      // If the new issue has a photo, run AI visual comparison on the top candidates.
      // This both catches visual duplicates AND boosts their scores above threshold.
      if (newIssue.photos.length > 0 && results.length > 0) {
        const topResults = results.slice(0, 5); // Check top 5 candidates

        for (const result of topResults) {
          const existingPhotoUrl =
            result.existingIssue.photos[0]?.url ||
            result.existingIssue.photos[0]?.thumbnailUrl;
          if (!existingPhotoUrl) continue;

          const aiScore = await compareWithAi(newIssue.photos[0], existingPhotoUrl);

          if (aiScore > 0) {
            // Blend AI score into the result (50/50 so a strong visual match
            // can surface a duplicate that missed the sync threshold).
            const blendedScore = Math.round(
              result.similarityScore * 0.5 + aiScore * 100 * 0.5
            );
            result.similarityScore = Math.min(100, blendedScore);
            if (aiScore > 0.5) {
              result.matchedStrategies.push('AI Visual Match');
            }
          }
        }

        // Re-sort after AI scores
        results.sort((a, b) => b.similarityScore - a.similarityScore);
      }

      // Only surface candidates that meet the actual threshold after AI blending
      const finalResults = results.filter(
        (r) => r.similarityScore >= threshold * 100
      );

      if (mountedRef.current) {
        setState({
          isChecking: false,
          duplicates: finalResults,
          error: null,
          hasChecked: true,
        });
      }

      return finalResults;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Duplicate check failed';
      if (mountedRef.current) {
        setState({ isChecking: false, duplicates: [], error: message, hasChecked: true });
      }
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setState({ isChecking: false, duplicates: [], error: null, hasChecked: false });
    }
  }, []);

  return {
    ...state,
    checkForDuplicates,
    reset,
  };
};