import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { checkAuth } from "@/lib/utils/auth";
import { getProduct } from "@/lib/utils/product";
import { NextRequest, NextResponse } from "next/server";

// Remove a seamstress from a product
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, seamstressId: string }> }) {	
	await checkAuth();

	const { id: productId, seamstressId } = await params;
	
	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { error } = await supabase.from('products_users').delete().eq('user_id', seamstressId).eq('product_id', productId);

		if (error) {
			throw new Error(error.message);
		}

		const product = await getProduct(productId, supabase);		

		return NextResponse.json({ data: product }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
