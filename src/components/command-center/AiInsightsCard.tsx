import { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { geminiService } from '../../services/ai/gemini';
import type { Issue } from '../../types/issue';

interface AiInsightsCardProps {
  issues: Issue[];
}

export const AiInsightsCard = ({ issues }: AiInsightsCardProps) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await geminiService.analyzeInsights(issues);
      if (!cancelled) {
        setInsights(result);
        setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [issues]);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>AI Insights</h3>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 rounded bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--accent)]">▸</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
};
