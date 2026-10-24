import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	SUPABASE_URL: {},
	SUPABASE_SECRET_KEY: {}
});
