import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { handleProductTableInsert, updatePackagingMaterialFromProduct, updateRawMaterialFromProduct } from '@/lib/supabase/supabase_utils';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		// Check authentication
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get the form data from the request
		const formData = await request.formData();

		// Initialize Supabase client
		const supabase = await createClerkSupabaseClientSsr();

		// Handle the product submission
		const updatedProduct = await handleProductTableInsert(formData, supabase, userId);
		const productId = updatedProduct.id;
		await updateRawMaterialFromProduct(productId, supabase, formData);
		await updatePackagingMaterialFromProduct(productId, supabase, formData);

		return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
	} catch (error) {
		console.error('Error processing product form:', error);
		return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
	}
}
