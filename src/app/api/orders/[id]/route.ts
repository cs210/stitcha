import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Retrieves a specific order by id
export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { userId } = await auth();
	const orderId = params.id;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json(data, { status: 200 });
}

// Deletes a specific order by id
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { userId } = await auth();
	const { id: orderId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	const { error } = await supabase.from('orders').delete().eq('id', orderId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
}
