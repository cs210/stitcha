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

	try {
		const { client, contact, order_quantity, due_date, product_id } = await req.json();

		const { data, error } = await supabase
			.from('orders')
			.insert({
				client,
				contact,
				order_quantity,
				due_date,
				product_id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data, success: true }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
