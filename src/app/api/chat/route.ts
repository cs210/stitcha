import { openai } from "@ai-sdk/openai";
import { AssistantResponse, jsonSchema, streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, system, tools } = await req.json();

    // const functions_object = {
    //   "type": "function", 
    //   "function": {
    //     "name": "get_product_costs",
    //     "description": "Get all the details for a given product, based on the product id.",
    //     "parameters": {
    //       "type": "object",
    //       "properties": {
    //         "id": {
    //           "type": "string",
    //           "description": "The id corresponding to that product"
    //         }
    //       },
    //       "required": ["id"],
    //       "additionalProperties": false
    //     },
    //     "strict": true
    //   }
    // };

    // Function handlers
    // const functionHandlers = {
    //   get_product_by_id: async (product_id: string) => {
    //     const productResponse = await fetch(`/api/products/${product_id}/costs`, { method: 'GET' });
    //     const { data, error } = await productResponse.json();

    //     console.log("productResponse:", data);

    //     if (error) throw error;
    //     return data;
    //   }
    // };

    
    const result = streamText({
      model: openai("gpt-4"),
      messages,
      system,
      tools: {
        ...Object.fromEntries(
          Object.entries<{ parameters: unknown }>(tools).map(([name, tool]) => [
            name,
            {
              parameters: jsonSchema(tool.parameters!),
            },
          ]),
        ),
      }
    });

    console.log("result:", result);

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500
    });
  }
}
