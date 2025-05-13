import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Retrieves a specific seamstress by id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
				products_users (
					products (*)
				)
			`
			)
			.eq('id', seamstressId)
			.single();

		// Rename the products_users field in the data object
		if (data) {
			data.products = data.products_users.map((product) => product.products);

			delete data.products_users;
		}

		const { data: progressData, error: progressError } = await supabase.from('progress').select('*').eq('user_id', seamstressId);

		// Combine the seamstress data with the progress data
		const combinedData = {
			...data,
			progress: progressData,
		};

		if (error || progressError) {
			throw new Error(error?.message || progressError?.message);
		}

		return NextResponse.json({ data: combinedData }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
