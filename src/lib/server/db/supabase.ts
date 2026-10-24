import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SECRET_KEY, SUPABASE_URL } from '$app/env/private';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
	if (!client) {
		client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false
			}
		});
	}
	return client;
}
