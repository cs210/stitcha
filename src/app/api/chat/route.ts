import { openai } from '@ai-sdk/openai';
import { jsonSchema, streamText } from 'ai';
import { NextRequest } from 'next/server';

// Stream a response from the OpenAI API
export async function POST(req: NextRequest) {
	const { messages, system, tools } = await req.json();

	const result = streamText({
		model: openai('gpt-4o'),
		messages,
		system,
		tools: Object.fromEntries(
			Object.entries<{ parameters: any }>(tools).map(([name, tool]) => [
				name,
				{
					parameters: jsonSchema(tool.parameters!),
				},
			])
		),
	});

	return result.toDataStreamResponse();
}
