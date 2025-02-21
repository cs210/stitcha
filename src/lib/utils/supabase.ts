import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Create a Clerk Supabase client for server-side rendering
export async function createClerkSupabaseClientSsr() {
	const { getToken } = await auth();

	return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		global: {
			fetch: async (url, options = {}) => {
				const clerkToken = await getToken({
					template: 'supabase',
				});

				const headers = new Headers(options?.headers);
				headers.set('Authorization', `Bearer ${clerkToken}`);

				return fetch(url, {
					...options,
					headers,
				});
			},
		},
	});
}
