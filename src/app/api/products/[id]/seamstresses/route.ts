import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Assigns a seamstress to a product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await req.formData();		

		const { data, error } = await supabase.from('products_users').insert({
			product_id: id,
			user_id: formData.get('seamstress'),
			units_assigned: formData.get('units'),
			description: formData.get('description'),
		});		

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}