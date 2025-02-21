import { supabase } from '@/lib/utils/supabase';
import { NextResponse } from 'next/server';

// Fetch users from Supabase
export async function GET() {
	try {
		const { data: users, error } = await supabase.from('users').select();

		if (error) {
			throw error;
		}

		return NextResponse.json(users, { status: 200 });
	} catch (error) {
		console.error('Error fetching users:', error);

		return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
	}
}

// Create a new user in Supabase
export async function POST(request: Request) {
	try {
		const newUser = await request.json();

		const { data, error } = await supabase.from('users').upsert(newUser);

		if (error) {
			throw error;
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error('Error creating user:', error);

		return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
	}
}
