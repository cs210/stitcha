'use client';

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";

export default function Page() {
    const runtime = useChatRuntime({
        api: "/api/chat",
      });
	return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 pt-2 pb-20">
            <ThreadList />
            <Thread />
            </div>
        </AssistantRuntimeProvider>
    );
}
