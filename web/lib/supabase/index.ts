import { createClient as createSupabaseClient } from './client';
export * from '@shared/types';

export const supabase = createSupabaseClient();
