import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { userId } = await auth();

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		return Response.json({ data: [] });
	} catch (error) {
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
