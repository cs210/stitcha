import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// get a specific product by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const supabase = await createClerkSupabaseClientSsr();
	const { id: productId } = await params;

	const { data, error } = await supabase
		.from('product_progress')
		.select('progress_id, progress(id, description, image_urls, emotion, created_at, user_id)')
		.eq('product_id', productId);

	if (data && data.length > 0) {
		const progressUpdates = data.map((item) => item.progress);

		return NextResponse.json({ data: progressUpdates }, { status: 200 });
	}

	return NextResponse.json({ error: error?.message }, { status: 400 });
}
