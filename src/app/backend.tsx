import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useCallback } from 'react'

export default function SignInBackend() {
	const { session } = useSession()
	const { user } = useUser()

	// Create a custom supabase client that injects the Clerk Supabase token into the request headers
	const createClerkSupabaseClient = useCallback(() => {
		return createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_KEY!,
			{
				global: {
					// Get the custom Supabase token from Clerk
					fetch: async (url, options = {}) => {
						// The Clerk `session` object has the getToken() method      
						const clerkToken = await session?.getToken({
							// Name of the JWT template you created in the Clerk Dashboard ('supabase')
							template: 'supabase',
						})
						
						// Insert the Clerk Supabase token into the headers
						const headers = new Headers(options?.headers)
						headers.set('Authorization', `Bearer ${clerkToken}`)
						
						// Call the default fetch
						return fetch(url, {
							...options,
							headers,
						})
					},
				},
			},
		)
	}, [session])

	// Function to insert user data into Supabase
	const insertUserData = useCallback(async () => {
		if (!user) return

		const supabaseClient = createClerkSupabaseClient()

		try {
			// user_login is the name of the table in Supabase
			const { error } = await supabaseClient.from('user_login').upsert({
				user_id: user.id,
				email: user.primaryEmailAddress?.emailAddress,
				first_name: user.firstName,
				last_name: user.lastName,
				created_at: user.createdAt,
				// updated_at: new Date().toISOString(),
			})

			if (error) {
				console.error('Error inserting user data:', error)
			}
		} catch (error) {
			console.error('Error inserting user data:', error)
		}
	}, [user, createClerkSupabaseClient])

	// Call insertUserData when user data is available
	if (user) {
		insertUserData()
	}

	return null
}
