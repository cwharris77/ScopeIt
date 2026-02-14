import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('[delete-account] Function invoked');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the user's token to verify identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError || !user) {
      console.error('[delete-account] Auth failed:', userError?.message ?? 'No user');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[delete-account] Deleting data for user:', user.id);

    // Use service role client to delete user data and auth record
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Delete user data in dependency order.
    // task_tags is cleaned up automatically via ON DELETE CASCADE from tasks and tags.
    const tablesToDelete = [
      'task_analyses',
      'daily_logs',
      'templates',
      'tasks',
      'tags',
      'projects',
    ];

    for (const table of tablesToDelete) {
      const { error: delError } = await adminClient
        .from(table)
        .delete()
        .eq('user_id', user.id);

      if (delError) {
        console.error(`[delete-account] Failed to delete ${table}:`, delError.message);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user data', detail: delError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete the auth user record using admin API
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('[delete-account] Failed to delete auth user:', deleteUserError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account', detail: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[delete-account] Successfully deleted user:', user.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[delete-account] Uncaught error:', errMsg);
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
