import { vi, type Mock } from 'vitest';

/**
 * Creates a mock Supabase client for testing edge function calls.
 */
export function mockSupabaseClient() {
  return {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }) as Mock,
    },
  };
}
