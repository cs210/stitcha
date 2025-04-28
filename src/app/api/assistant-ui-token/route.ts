import { AssistantCloud } from '@assistant-ui/react';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Creates a new assistant UI token for the user
export async function POST() {
	const { userId } = await auth();

	if (!userId) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const client = new AssistantCloud({
		apiKey: process.env.ASSISTANT_API_KEY!,
		userId,
		workspaceId: userId,
	});

	const { token } = await client.auth.tokens.create();

	return NextResponse.json({ token });
}
