import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
	const { id: seamstressId } = await params;
	const { userId } = await auth();

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase
			.from('product_users')
			.select(
				`
				products (
					*
				)
			`
			)
			.eq('user_id', seamstressId);

		if (error) {
			throw new Error(error.message);
		}

		// Extract just the products from the joined data
		const products = data?.map((item) => item.products);

		return NextResponse.json({ data: products }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
