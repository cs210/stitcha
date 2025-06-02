import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import {
	insertProduct,
	insertProductCost,
	updateLaborFromProduct,
	updatePackagingMaterialFromProduct,
	updateRawMaterialFromProduct,
} from '@/lib/utils/product';
import { NextRequest, NextResponse } from 'next/server';

// Get all products
export async function GET() {
	await checkAuth();

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

// Create a new product
export async function POST(req: NextRequest) {
	await checkAuth();

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await req.formData();

		const updatedProduct = await insertProduct(formData, supabase);
		const productId = updatedProduct.id;

		await updateRawMaterialFromProduct(productId, supabase, formData);
		await updatePackagingMaterialFromProduct(productId, supabase, formData);
		await updateLaborFromProduct(productId, supabase, formData);
		await insertProductCost(productId, supabase, formData);

		return NextResponse.json({ data: updatedProduct }, { status: 200 });
	} catch (error: any) {
		console.log('Error creating product', error);

		if (error.name === 'DuplicateProductError') {
			return NextResponse.json(
				{ message: error.message },
				{ status: 409 } // Conflict
			);
		}

		return NextResponse.json(
			{ error },
			{ status: 500 }
		);
	}
}
