import { GoogleGenAI, Type } from 'npm:@google/genai';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  // TODO update to only allow requests from the app when I have a domain
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
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
      return new Response(JSON.stringify({ error: 'Unauthorized', detail: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { taskIds } = await req.json();
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or empty taskIds array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('name, category, estimated_minutes, actual_seconds, status')
      .in('id', taskIds)
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (tasksError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    const prompt = `Analyze these task completion data points for a productivity user.
  Compare their expected vs actual times.
  Identify patterns (e.g., they are always 20% over on "Coding", but under on "Meetings").
  Provide helpful, encouraging advice to improve their "scoping" accuracy.

  Data: ${JSON.stringify(taskDataSummary)}`;

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        abortSignal: controller.signal,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            accuracyRating: { type: Type.NUMBER },
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
      return new Response(JSON.stringify({ error: 'Empty response from Gemini' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysis = JSON.parse(text);
    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Gemini request timed out' }), {
        status: 504,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
