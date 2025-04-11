import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Retrieves all products assigned to a seamstress
export async function GET({ params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id: seamstressId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('product_users').select('products (*)').eq('user_id', seamstressId);

		if (error) {
			throw new Error(error.message);
		}

		const products = data?.map((item) => item.products);

		return NextResponse.json({ data: products }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
