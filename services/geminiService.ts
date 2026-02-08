/**
 * Gemini AI service for task performance analysis
 * Calls the analyze-tasks Supabase Edge Function
 */

import { supabase } from '@/lib/supabase';

export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
}

export const analyzeTaskPerformance = async (): Promise<AIAnalysis | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-tasks');

    if (error) {
      console.error('Edge function error:', error);
      if (data && typeof data === 'object' && 'detail' in data) {
        console.error('Edge function detail:', (data as { detail?: string }).detail);
      }
      return null;
    }

    return data as AIAnalysis;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return null;
  }
};
