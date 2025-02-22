'use server';

import { createClerkSupabaseClientSsr } from '@/lib/utils/supabase';
import { NextResponse } from 'next/server';

const client = await createClerkSupabaseClientSsr();

// Fetch products from Supabase
export async function GET() {
	try {
		// const { data: products, error } = await client.from('products').select();

		// if (error) {
		// 	throw error;
		// }

		// return NextResponse.json(products, { status: 200 });
		return NextResponse.json({ message: 'Products fetched successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error fetching products:', error);

		return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
	}
}
