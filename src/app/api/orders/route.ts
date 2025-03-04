import { createClerkSupabaseClientSsr } from '@/utils/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { userId } = await auth();

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('orders').select('*');

		if (error) {
			throw new Error(error.message);
		}

		return Response.json({ data }, { status: 200 });
	} catch (error) {
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const { userId } = await auth();

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		// Parse the request body
		const body = await request.json();

		// Insert the order data into the database
		const { data, error } = await supabase
			.from('orders')
			.insert({
				client: body.client,
				contact: body.contact,
				order_quantity: body.order_quantity,
				due_date: body.due_date,
				product_id: body.product_id,
			})
			.select()
			.single();

		console.log(data);
		console.log(error);

		if (error) {
			throw new Error(error.message);
		}

		return Response.json({ data, success: true }, { status: 201 });
	} catch (error) {
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
