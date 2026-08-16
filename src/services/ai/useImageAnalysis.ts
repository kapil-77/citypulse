import { useState, useCallback } from 'react';
import { aiService, type ImageAnalysis } from './ai';

interface AnalysisState {
  isAnalyzing: boolean;
  result: ImageAnalysis | null;
  error: string | null;
}

export const useImageAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const analyzeImage = useCallback(async (file: File) => {
    if (!aiService.isConfigured()) {
      setState({
        isAnalyzing: false,
        result: null,
        error: 'AI service is unavailable right now.',
      });
      return null;
    }

    setState({ isAnalyzing: true, result: null, error: null });

    try {
      const result = await aiService.analyzeImage(file);
      setState({ isAnalyzing: false, result, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setState({ isAnalyzing: false, result: null, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isAnalyzing: false, result: null, error: null });
  }, []);

  return {
    ...state,
    analyzeImage,
    reset,
  };
};