import { auth } from "@clerk/nextjs/server";
import { AssistantCloud } from "@assistant-ui/react";

export const POST = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = new AssistantCloud({
    apiKey: process.env.ASSISTANT_API_KEY!,
    userId,
    workspaceId: userId,
  });

  const { token } = await client.auth.tokens.create();
  return Response.json({ token });
};
