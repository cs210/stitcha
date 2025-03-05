import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// get a specific order by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const supabase = await createClerkSupabaseClientSsr();
	const { id: orderId } = await params;

	const { data, error } = await supabase
		.from('orders')
		.select('*')
		.eq('id', orderId) // Fetch the specific order by ID
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json(data, { status: 200 });
}

// delete a specific order by id
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const supabase = await createClerkSupabaseClientSsr();
	const { id: orderId } = await params;

	const { error } = await supabase.from('orders').delete().eq('id', orderId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
}
