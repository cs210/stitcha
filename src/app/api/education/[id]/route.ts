import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific education video by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await checkAuth();

	const { id } = await params;

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('education').select('*').eq('id', id).single();

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
