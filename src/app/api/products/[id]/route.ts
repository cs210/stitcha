import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { deleteProduct, deleteProductRelations, getProduct, insertProductCost, updateLaborFromProduct, updatePackagingMaterialFromProduct, updateRawMaterialFromProduct, upsertProduct } from '@/lib/utils/product';
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
		const formData = await req.formData();

		const updatedProduct = await upsertProduct(formData, supabase, id);
		await deleteProductRelations(id, supabase);
		await updateRawMaterialFromProduct(id, supabase, formData);
		await updatePackagingMaterialFromProduct(id, supabase, formData);
		await updateLaborFromProduct(id, supabase, formData);
		await insertProductCost(id, supabase, formData);

		return NextResponse.json({ data: updatedProduct }, { status: 200 });
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
		const product = await deleteProduct(supabase, id);

		return NextResponse.json({ data: product }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
