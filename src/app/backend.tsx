import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useCallback } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export default function SignInBackend() {
	const { session } = useSession()
	const { user } = useUser()

	// Create a custom supabase client that injects the Clerk Supabase token into the request headers
	const createClerkSupabaseClient = useCallback(() => {
		return createClient(supabaseUrl, supabaseKey, {
			global: {
				fetch: async (url, options = {}) => {
					const clerkToken = await session?.getToken({
						template: 'supabase',
					})

					const headers = new Headers(options?.headers)
					headers.set('Authorization', `Bearer ${clerkToken}`)

					return fetch(url, {
						...options,
						headers,
					})
				},
			},
		})
	}, [session])

	// Function to insert user data into Supabase
	const insertUserData = useCallback(async () => {
		if (!user) return

		const supabaseClient = createClerkSupabaseClient()

		try {
			const { error } = await supabaseClient.from('users').upsert({
				id: user.id,
				email: user.primaryEmailAddress?.emailAddress,
				first_name: user.firstName,
				last_name: user.lastName,
				created_at: user.createdAt,
				updated_at: new Date().toISOString(),
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
