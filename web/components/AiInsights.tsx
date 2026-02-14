'use client';

import { createClient } from '@/lib/supabase/client';
import { Task } from '@shared/types';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

type Props = {
  tasks: Task[];
};

type Analysis = {
  summary: string;
  insights: string[];
  recommendations: string[];
};

export function AiInsights({ tasks }: Props) {
  const supabase = createClient();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const taskIds = tasks.map((t) => t.id);
      const token = session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ taskIds }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setLoading(false);
  };

  if (!analysis && !loading) {
    return (
      <div className="rounded-xl bg-background-secondary p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-white">AI Insights</h2>
          </div>
          <button
            onClick={fetchInsights}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition"
          >
            Analyze
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-2">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-background-secondary p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary animate-pulse" />
          <p className="text-text-secondary">Analyzing your tasks...</p>
        </div>
      </div>
    );
  }

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
