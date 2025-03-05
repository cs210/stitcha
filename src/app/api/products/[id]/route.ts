import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// get a specific product by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const supabase = await createClerkSupabaseClientSsr();
	const { id: productId } = await params;

	const { data, error } = await supabase
		.from('products')
		.select('*')
		.eq('id', productId) // Fetch the specific product by ID
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	// Return the data directly without wrapping it
	return NextResponse.json(data, { status: 200 });
}

// update the progress_level of a specific product (dragged in kanban)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id: productId } = await params;

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	const body = await request.json();

	const { data, error } = await supabase.from('products').update({ progress_level: body.progress_level }).eq('id', productId).select();

	if (error) {
		throw new Error(error.message);
	}

	return NextResponse.json({ data }, { status: 200 });
}

// Delete a specific product
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id: productId } = params;

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		// First delete related records in product_progress
		const { error: progressError } = await supabase.from('product_progress').delete().eq('product_id', productId);

		if (progressError) {
			throw new Error(progressError.message);
		}

		// Then delete the product
		const { error: productError } = await supabase.from('products').delete().eq('id', productId);

		if (productError) {
			throw new Error(productError.message);
		}

		return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
	}
}
