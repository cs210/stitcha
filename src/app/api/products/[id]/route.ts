import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Get a specific product by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase
			.from('products')
			.select(`
				*,
				products_users (
					user_id,					
					users!inner (
						first_name,
						last_name
					)
				),
				product_costs (*),
				product_progress (
					progress_id,
					progress (
						id,
						description, 
						created_at,
						image_urls,
						emotion,
						user_id,
						users:user_id (
							first_name,
							last_name
						)
					)
				),
				products_labor (
					*,
					labor (*)
				),
				products_packaging_materials (
					*,
					packaging_materials (*)
				),
				products_raw_materials (
					*,
					raw_materials (*)
				)
			`)
			.eq('id', id)
			.single();

		// Rename the users, costs, progress, labor, packaging materials, and raw materials fields in the data object
		if (data) {
			data.users = data.products_users;
			data.costs = data.product_costs;
			data.progress = data.product_progress;
			data.labor = data.products_labor;
			data.packaging_materials = data.products_packaging_materials;
			data.raw_materials = data.products_raw_materials;
			
			delete data.products_users;
			delete data.product_costs;
			delete data.product_progress;
			delete data.products_labor;
			delete data.products_packaging_materials;
			delete data.products_raw_materials;
		}		

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}

// Delete a specific product by id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const { userId } = await auth();
	const { id: productId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('products').delete().eq('id', productId);

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
