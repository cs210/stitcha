import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { getProduct } from "@/lib/utils/product";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Remove a seamstress from a product
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, seamstressId: string }> }) {
	const { userId } = await auth();
	const { id: productId, seamstressId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

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
