import { NextResponse } from 'next/server';

// Fetch orders from Supabase
export async function GET() {
	try {
		// const { data: orders, error } = await supabase.from('orders').select();
		// if (error) {
		// 	throw error;
		// }
		// return NextResponse.json(orders, { status: 200 });
		return NextResponse.json({ message: 'Orders fetched successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error fetching orders:', error);

		return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
	}
}
