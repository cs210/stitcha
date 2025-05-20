import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { getProduct } from '@/lib/utils/product';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific product by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const product = await getProduct(id, supabase);

		return NextResponse.json({ data: product }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}

// Update a specific product by id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const body = await req.json();	

		const { data, error } = await supabase.from('products').update(body).eq('id', id);

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}

// Delete a specific product by id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('products').delete().eq('id', id);

		if (error) {
			throw new Error(error.message);
		}

		const { error: productStorageError } = await supabase.storage.from('products').remove([`${id}`]);

		if (productStorageError) {
			throw new Error(productStorageError.message);
		}

		const { error: technicalSheetStorageError } = await supabase.storage.from('technical-sheets').remove([`${id}`]);

		if (technicalSheetStorageError) {
			throw new Error(technicalSheetStorageError.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
