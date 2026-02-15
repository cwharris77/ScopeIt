import { GoogleGenAI, Type } from 'npm:@google/genai';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { calculatePerTaskAccuracy } from './accuracy.ts';

const TIER_LIMITS: Record<string, { cacheTtlMs: number; taskThreshold: number }> = {
  free: { cacheTtlMs: 7 * 24 * 60 * 60 * 1000, taskThreshold: 5 },
  pro: { cacheTtlMs: 3 * 24 * 60 * 60 * 1000, taskThreshold: 2 },
};
const MODEL = 'gemini-2.5-flash-lite';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('[analyze-tasks] Function invoked');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[analyze-tasks] Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('[analyze-tasks] Auth failed:', userError?.message ?? 'No user', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized', detail: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .maybeSingle();

    const tier = profile?.tier ?? 'free';
    const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

    // Count completed tasks for this user
    const { count: completedCount, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (countError) {
      console.error('[analyze-tasks] Failed to count tasks:', countError.message, countError);
      return new Response(
        JSON.stringify({ error: 'Failed to count tasks', detail: countError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!completedCount || completedCount === 0) {
      console.log('[analyze-tasks] No completed tasks, completedCount=', completedCount);
      return new Response(JSON.stringify({ error: 'No completed tasks to analyze' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for cached analysis
    const { data: cached, error: cacheError } = await supabase
      .from('task_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cacheError) {
      console.error('[analyze-tasks] Cache lookup error:', cacheError.message, cacheError);
      // Continue to generate fresh analysis
    }

    if (cached) {
      const ageMs = Date.now() - new Date(cached.created_at).getTime();
      const newTasksSince = completedCount - cached.completed_count;

      if (ageMs < limits.cacheTtlMs && newTasksSince < limits.taskThreshold) {
        return new Response(JSON.stringify(cached.analysis), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch completed tasks for Gemini
    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('name, category, estimated_minutes, actual_seconds, status')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    if (tasksError) {
      console.error('[analyze-tasks] Failed to fetch tasks:', tasksError.message, tasksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks', detail: tasksError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!completedTasks || completedTasks.length === 0) {
      return new Response(JSON.stringify({ error: 'No completed tasks to analyze' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const taskDataSummary = completedTasks.map((t) => ({
      title: t.name,
      category: t.category || 'Uncategorized',
      expectedMin: t.estimated_minutes,
      actualMin: Math.round((t.actual_seconds || 0) / 60),
    }));

    const computedAccuracy = calculatePerTaskAccuracy(completedTasks);

    const prompt = `Analyze these task completion data points for a productivity user.
  Compare their expected vs actual times.
  Identify patterns (e.g., they are always 20% over on "Coding", but under on "Meetings").
  Provide helpful, encouraging advice to improve their "scoping" accuracy.

  Their current per-task scoping accuracy is ${computedAccuracy}% (average of how close each estimate was to actual; over and under both count as error). Reference this in your summary and insights where relevant.

  Data: ${JSON.stringify(taskDataSummary)}`;

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[analyze-tasks] GEMINI_API_KEY not set in Edge Function secrets');
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000); // 50 seconds timeout

    console.log(`[analyze-tasks] Generating content with ${MODEL} (5 tasks, tier=${tier})...`);
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        abortSignal: controller.signal,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    clearTimeout(timeout);

    const text = response.text;
    if (!text) {
      console.error('[analyze-tasks] Gemini returned no text:', JSON.stringify(response));
      return new Response(JSON.stringify({ error: 'Empty response from Gemini' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(text) as Record<string, unknown>;
    } catch (parseError) {
      console.error('[analyze-tasks] Failed to parse Gemini response:', text, parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON from Gemini',
          detail: parseError instanceof Error ? parseError.message : String(parseError),
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save analysis to DB
    const { error: insertError } = await supabase.from('task_analyses').insert({
      user_id: user.id,
      analysis,
      completed_count: completedCount,
    });

    if (insertError) {
      console.error('[analyze-tasks] Failed to cache analysis:', insertError.message, insertError);
      // Still return the analysis even if caching failed
    }

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error('[analyze-tasks] Uncaught error:', errMsg, errStack ?? error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Gemini request timed out' }), {
        status: 504,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        detail: errMsg,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
