/**
 * Gemini AI service for task performance analysis
 * Calls the analyze-tasks Supabase Edge Function
 */

import { supabase, Task } from '@/lib/supabase';

export interface AIAnalysis {
  summary: string;
  accuracyRating: number; // 0 to 100
  insights: string[];
  recommendations: string[];
}

export const analyzeTaskPerformance = async (tasks: Task[]): Promise<AIAnalysis | null> => {
  if (tasks.length === 0) return null;

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  if (completedTasks.length === 0) return null;

  const taskIds = completedTasks.map((t) => t.id);

  try {
    const { data, error } = await supabase.functions.invoke('analyze-tasks', {
      body: { taskIds },
    });

    if (error) {
      console.error('Edge function error:', error);
      return null;
    }

    return data as AIAnalysis;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return null;
  }
};
