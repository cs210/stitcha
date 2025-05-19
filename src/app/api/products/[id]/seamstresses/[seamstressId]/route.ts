import { NextRequest } from "next/server";

import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

// Removes a seamstress from a product
export async function DELETE(req: NextRequest, { params }: { params: { id: string, seamstressId: string } }) {
	const { userId } = await auth();
	const { id: productId, seamstressId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('products_users').delete().eq('user_id', seamstressId).eq('product_id', productId);

		return NextResponse.json({ data, error }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
