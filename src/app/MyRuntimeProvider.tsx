'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useVercelUseAssistantRuntime } from '@assistant-ui/react-ai-sdk';
import { useAssistant } from 'ai/react';

// This is a wrapper component that provides the assistant runtime for the AI chat assistant
export function MyRuntimeProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const assistant = useAssistant({
		api: '/api/assistant',
	});

	const runtime = useVercelUseAssistantRuntime(assistant);

	return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
}
