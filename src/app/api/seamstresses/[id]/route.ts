import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { getSeamstress } from '@/lib/utils/seamstress';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific seamstress by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await checkAuth();
	
	const { id } = await params;

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const seamstress = await getSeamstress(id, supabase);

		return NextResponse.json({ data: seamstress }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}