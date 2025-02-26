import { createClerkSupabaseClientSsr } from '@/utils/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { userId } = await auth();

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('users').select('*');

		if (error) {
			throw new Error(error.message);
		}

		return Response.json({ data }, { status: 200 });
	} catch (error) {
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
