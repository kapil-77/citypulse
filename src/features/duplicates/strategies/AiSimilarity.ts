import type { DuplicateStrategy } from '../duplicateEngine';
import type { NewIssue, Issue } from '../../../types/issue';

/**
 * AI Similarity Strategy
 * Uses AI Vision to compare images between the new issue and existing issues.
 * This runs asynchronously — returns 0 if no photos to compare or if AI is unavailable.
 */
export const AiSimilarityStrategy: DuplicateStrategy = {
  name: 'AI Visual Match',
  weight: 0.20,

  check(input: NewIssue, existing: Issue): number {
    // Synchronous check — if either side has no photos, can't compare visually
    if (input.photos.length === 0 || existing.photos.length === 0) {
      return 0;
    }
    // This returns a base score; the async comparison runs separately
    // and updates the result. Default to a moderate score based on category proximity.
    return 0;
  },
};

/**
 * Async version of AI comparison — call this separately and update results.
 * Returns a similarity score 0-1 based on AI Vision image comparison.
 */
export async function compareWithAi(
  inputPhoto: File,
  existingPhotoUrl: string
): Promise<number> {
  try {
    const { aiService } = await import('../../../services/ai/ai');
    if (!aiService.isConfigured()) {
      return 0;
    }

    const result = await aiService.compareImages(inputPhoto, existingPhotoUrl);
    return result.similarityScore;
  } catch {
    return 0;
  }
}