import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { handleProductTableInsert, updatePackagingMaterialFromProduct, updateRawMaterialFromProduct } from '@/lib/supabase/utils';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

		return Response.json({ data }, { status: 200 });
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}

// Creates a new product
export async function POST(request: Request) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await request.formData();

		const updatedProduct = await handleProductTableInsert(formData, supabase, userId);
		const productId = updatedProduct.id;

		await updateRawMaterialFromProduct(productId, supabase, formData);
		await updatePackagingMaterialFromProduct(productId, supabase, formData);

		return NextResponse.json({ success: true, data: updatedProduct }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
