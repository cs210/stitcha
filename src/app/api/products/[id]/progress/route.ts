import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// get a specific product by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const supabase = await createClerkSupabaseClientSsr();
	const { id: productId } = await params;

	const { data, error } = await supabase
		.from('product_progress')
		.select('*')
		.eq('product_id', productId) // Fetch the specific product by ID
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json(data, { status: 200 });
}
