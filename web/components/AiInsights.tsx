'use client';

import { createClient } from '@/lib/supabase/client';
import { TASK_STATUS } from '@shared/constants';
import { useTasks } from '@shared/hooks/useTasks';
import { AIAnalysis, analyzeTaskPerformance } from '@shared/services/geminiService';
import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function AiInsights() {
  const supabase = useMemo(() => createClient(), []);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tasks, loading: tasksLoading } = useTasks();

  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED);

  const fetchAnalysis = useCallback(async () => {
    if (completedTasks.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeTaskPerformance(supabase);
      if (result) {
        setAnalysis(result);
      } else {
        setError('Failed to generate insights. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while fetching insights.');
    } finally {
      setLoading(false);
    }
  }, [completedTasks.length, supabase]);

  // run when tasks are loaded and we don't have analysis yet
  useEffect(() => {
    // If we are still loading tasks, wait
    if (tasksLoading) return;

    // If we already have analysis or are already fetching or have an error, don't auto-fetch
    if (analysis || error) return;

    fetchAnalysis();
  }, [fetchAnalysis, analysis, error, tasksLoading]);

  if (loading) {
    return (
      <div className="rounded-xl bg-background-secondary p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary animate-pulse" />
          <p className="text-text-secondary">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-background-secondary p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-danger" />
            <p className="text-text-secondary">{error}</p>
          </div>
          <button
            onClick={fetchAnalysis}
            className="text-primary text-sm font-semibold hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="rounded-xl bg-background-secondary p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-white">AI Insights</h2>
      </div>

      {analysis && (
        <>
          <p className="text-text-secondary">{analysis.summary}</p>

          {analysis.insights?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Key Insights</h3>
              <ul className="space-y-1">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="text-text-secondary text-sm flex gap-2">
                    <span className="text-primary">&bull;</span> {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-text-secondary text-sm flex gap-2">
                    <span className="text-warning">&bull;</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
