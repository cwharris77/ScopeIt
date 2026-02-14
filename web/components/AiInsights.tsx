'use client';

import { createClient } from '@/lib/supabase/client';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type Analysis = {
  summary: string;
  insights: string[];
  recommendations: string[];
};

export function AiInsights() {
  const supabase = createClient();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      supabase
        .from('task_analyses')
        .select('analysis')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.analysis) {
            setAnalysis(data.analysis as Analysis);
          }
          setLoading(false);
        });
    });
  }, [supabase]);

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
