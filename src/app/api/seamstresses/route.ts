import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { NextResponse } from 'next/server';

// Get all seamstresses
export async function GET() {
	await checkAuth();

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('users').select('*');

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
