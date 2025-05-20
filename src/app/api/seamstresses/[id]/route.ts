import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { getSeamstress } from '@/lib/utils/seamstress';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific seamstress by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const seamstress = await getSeamstress(id, supabase);

		return NextResponse.json({ data: seamstress }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}