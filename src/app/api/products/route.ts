import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import {
	handleProductTableInsert,
	updateLaborFromProduct,
	updatePackagingMaterialFromProduct,
	updateRawMaterialFromProduct,
	updateTechnicalSheetFromProduct,
	handleProductCostsInsert,
} from '@/lib/supabase/utils';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Retrieves all products
export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('products').select('*');

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}

// Creates a new product
export async function POST(req: NextRequest) {
	console.log('Creating new product');
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await req.formData();

		const updatedProduct = await handleProductTableInsert(formData, supabase, userId);
		const productId = updatedProduct.id;

		await updateRawMaterialFromProduct(productId, supabase, formData);
		await updatePackagingMaterialFromProduct(productId, supabase, formData);
		await updateTechnicalSheetFromProduct(productId, supabase, formData);
		await updateLaborFromProduct(productId, supabase, formData);
		await handleProductCostsInsert(productId, supabase, formData);


		return NextResponse.json({ data: updatedProduct }, { status: 200 });
	} catch (error) {
		console.log('Error creating product', error);
		return NextResponse.json({ error }, { status: 500 });
	}
}
