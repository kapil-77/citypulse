import { useState, useCallback } from 'react';
import { geminiService, type ImageAnalysis } from './gemini';

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
    if (!geminiService.isConfigured()) {
      setState({
        isAnalyzing: false,
        result: null,
        error: 'Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env',
      });
      return null;
    }

    setState({ isAnalyzing: true, result: null, error: null });

    try {
      const result = await geminiService.analyzeImage(file);
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