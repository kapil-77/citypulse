import { useEffect, useRef, useState, useCallback } from 'react';
import { geminiService, type CityAnalystReport } from '../services/ai/gemini';
import type { Issue } from '../types/issue';

interface AnalystState {
  loading: boolean;
  report: CityAnalystReport | null;
}

const emptyReport = (): CityAnalystReport => ({
  verdict: 'Insufficient data to analyse this city yet.' + '' ,
  topProblems: [],
  priorityIssues: [],
  trends: [],
  recommendations: [],
});

/**
 * Loads (and reloads) an AI analyst report for a city from its actual issue data.
 * - Aborts in-flight requests on unmount or when the city/issues change.
 * - Never sets state after unmount.
 */
export const useCityAnalyst = (cityName: string, issues: Issue[]) => {
  const [state, setState] = useState<AnalystState>({ loading: false, report: null });
  const mountedRef = useRef(true);
  const ctrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (issues.length === 0) {
      setState({ loading: false, report: emptyReport() });
      return;
    }

    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setState({ loading: true, report: null });

    (async () => {
      try {
        const report = await geminiService.analyzeCity(cityName, issues, ctrl.signal);
        if (!mountedRef.current || ctrl.signal.aborted) return;
        setState({ loading: false, report });
      } catch {
        if (!mountedRef.current || ctrl.signal.aborted) return;
        setState({ loading: false, report: emptyReport() });
      }
    })();

    return () => { ctrl.abort(); };
  }, [cityName, issues]);

  const ask = useCallback(
    async (question: string): Promise<string> => {
      if (issues.length === 0) return 'Insufficient data for this city.';
      return geminiService.askCityQuestion(cityName, issues, question);
    },
    [cityName, issues]
  );

  return { ...state, ask };
};
