import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { deleteProduct, getProduct } from '@/lib/utils/product';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific product by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await checkAuth();

	const { id } = await params;

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
	await checkAuth();

	const { id } = await params;

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
	await checkAuth();
	
	const { id } = await params;

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const product = await deleteProduct(id, supabase);

		return NextResponse.json({ data: product }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
