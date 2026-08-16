import { useEffect, useRef, useState, useCallback } from 'react';
import {
  aiService,
  type CityAnalystReport,
  type CityAnswer,
  type CityAssistantContext,
} from '../services/ai/ai';
import type { Issue } from '../types/issue';
import type { CityHealthReport } from '../features/health/cityHealthScore';

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
 * Build the data-grounded context passed to AI for the city assistant.
 * Every number here comes from the selected city's actual issue dataset.
 */
export function buildCityAssistantContext(
  cityName: string,
  issues: Issue[],
  report: CityHealthReport | null
): CityAssistantContext {
  const categories: Record<string, number> = {};
  const statuses: Record<string, number> = {};
  for (const i of issues) {
    categories[i.category] = (categories[i.category] || 0) + 1;
    statuses[i.status] = (statuses[i.status] || 0) + 1;
  }
  const active = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length;
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'verified_resolved').length;
  const critical = issues.filter((i) => i.severity === 'critical').length;
  return {
    cityName,
    stats: {
      total: issues.length,
      active,
      resolved,
      critical,
      healthScore: report ? report.score : null,
      avgActiveAgeDays: report ? report.avgActiveAgeDays : 0,
    },
    categories,
    statuses,
    communityConfirmations: report ? report.communityConfirmations : 0,
  };
}

/**
 * Loads (and reloads) an AI analyst report for a city from its actual issue data.
 * - Aborts in-flight requests on unmount or when the city/issues change.
 * - Never sets state after unmount.
 */
export const useCityAnalyst = (
  cityName: string,
  issues: Issue[],
  context: CityAssistantContext
) => {
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
        const report = await aiService.analyzeCity(cityName, issues, ctrl.signal);
        if (!mountedRef.current || ctrl.signal.aborted) return;
        setState({ loading: false, report });
      } catch {
        if (!mountedRef.current || ctrl.signal.aborted) return;
        setState({ loading: false, report: emptyReport() });
      }
    })();

    return () => { ctrl.abort(); };
  }, [cityName, issues]);

  /**
   * Ask a follow-up question. Answers are grounded in the city's real statistics
   * via the provided context. Throws on failure so the UI can surface it.
   */
  const ask = useCallback(
    async (question: string): Promise<CityAnswer> => {
      if (issues.length === 0) throw new Error('Insufficient data for this city.');
      return aiService.askCityQuestion(context, issues, question);
    },
    [context, issues]
  );

  return { ...state, ask };
};
