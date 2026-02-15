export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
}

/**
 * Minimal interface for Supabase client to avoid version compatibility issues
 * between different projects (Expo vs Web).
 */
export interface MinimalSupabaseClient {
  functions: {
    invoke: (functionName: string, options?: any) => Promise<{ data: any; error: any }>;
  };
}

/**
 * Gemini AI service for task performance analysis
 * Calls the analyze-tasks Supabase Edge Function
 */
export const analyzeTaskPerformance = async (
  supabase: MinimalSupabaseClient
): Promise<AIAnalysis | null> => {
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
