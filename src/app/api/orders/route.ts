import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Retrieves all orders
export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const { data, error } = await supabase.from('orders').select('*');

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}

// Creates a new order
export async function POST(req: NextRequest) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	const { client, contact, order_quantity, due_date, product_ids } = await req.json();

	const { data: orderData, error: orderError } = await supabase
		.from('orders')
		.insert({
			client,
			contact,
			order_quantity,
			due_date,
			product_ids
		})
		.select()
		.single();

	if (orderError) {
		return NextResponse.json({ orderError }, { status: 400 });
	}

	return NextResponse.json({ data: orderData, success: true }, { status: 201 });
}
