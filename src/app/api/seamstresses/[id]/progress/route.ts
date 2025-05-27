import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

// Create a new progress update for a seamstress
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await checkAuth();

	const { id: seamstressId } = await params;

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await req.formData();
	
		const { data, error } = await supabase.from('progress').insert({
			user_id: seamstressId,
			product_id: formData.get('product'),
			description: formData.get('description'),
			emotion: formData.get('emotion'),
			units_completed: formData.get('units_completed'),
		});

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
