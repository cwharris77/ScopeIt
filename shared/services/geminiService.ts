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
 * Includes a timeout to prevent hanging.
 */
export const analyzeTaskPerformance = async (
  supabase: MinimalSupabaseClient,
  timeoutMs: number = 60000 // 60s timeout
): Promise<AIAnalysis | null> => {
  console.log('[geminiService] Starting task performance analysis...');

  const timeoutPromise = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
  );

  try {
    const response = await Promise.race([
      supabase.functions.invoke('analyze-tasks'),
      timeoutPromise,
    ]);

    console.log('[geminiService] Edge function response received');

    if (response === null) {
      console.error('[geminiService] Request timed out after', timeoutMs, 'ms');
      return null;
    }

    const { data, error } = response as { data: any; error: any };

    if (error) {
      console.error('[geminiService] Edge function returned error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        details: error,
      });
      return null;
    }

    console.log('[geminiService] Analysis completed successfully');
    return data as AIAnalysis;
  } catch (error: any) {
    if (error.message === 'TIMEOUT') {
      console.error(`[geminiService] Analysis timed out after ${timeoutMs}ms`);
    } else {
      console.error('[geminiService] Gemini Analysis Error:', error);
    }
    return null;
  }
};
