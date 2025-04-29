import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Retrieves a specific seamstress by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const { userId } = await auth();
	const { id: seamstressId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase
			.from('users')
			.select(
				`
				*,
				product_users!inner (
					products (*)
				)
			`
			)
			.eq('id', seamstressId)
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
