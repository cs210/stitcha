import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { createProgressUpdate } from '@/lib/utils/seamstress';
import { NextRequest, NextResponse } from 'next/server';

// Create a new progress update for a seamstress
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await checkAuth();

	const { id: seamstressId } = await params;

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await req.formData();

		const data = await createProgressUpdate(seamstressId, supabase, formData);

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
