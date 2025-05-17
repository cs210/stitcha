import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Retrieves a specific seamstress by id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	const { userId } = await auth();
	const { id: seamstressId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data: seamstressData, error: seamstressError } = await supabase
			.from('users')
			.select(
				`
				*,
				products_users (
					products (*),
					*
				)
			`
			)
			.eq('id', seamstressId)
			.single();

		const { data: progressData, error: progressError } = await supabase
			.from('progress')
			.select('*')
			.eq('user_id', seamstressId)

		const data = { ...seamstressData };
				
		if (data) {	
			// Map product_user records (including product data) to products field
			data.products = data.products_users.map((product) => ({
				...product.products,
				validated: product.validated,
				units_completed: product.units_completed || 0,
				units_assigned: product.units_assigned || 0
			}));

			// Update each product with respective progress data
			if (progressData && data.products) {
				data.products = data.products.map(product => {					
					const productProgress = progressData.filter(
						progress => progress.product_id === product.id
					);
										
					return {
						...product,
						progress: productProgress || []
					};
				});
			}
			
			// Calculate total units completed across all products
			data.total_units_completed = data.products_users.reduce((total, product) => {
				return total + (product.units_completed || 0);
			}, 0);

			// Calculate total units assigned across all products
			data.total_units_assigned = data.products_users.reduce((total, product) => {
				return total + (product.units_assigned || 0);
			}, 0);

			delete data.products_users;
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
