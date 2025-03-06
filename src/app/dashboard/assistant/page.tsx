'use client';

import { AssistantRuntimeProvider, useAssistantInstructions } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { useEffect, useState } from "react";

function AssistantInstructions() {
    const [products, setProducts] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setProducts(result.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        console.log("PRODUCTS", products);
    }, [products]);

    const productDetails = products ? JSON.stringify(products, null, 2) : "No product data available";

    const instruction = `You are a helpful form assistant. You have access to all the data from the following table: ${productDetails}. If the user asks questions about a product, return the relevant information strictly from this table. If the user asks questions about a product that is not in the table, say that you don't have information about that product.`

    console.log("INSTRUCTION ", instruction)

    // Simple string usage
    useAssistantInstructions(instruction);
    
    return <div></div>;
}

export default function Page() {
    const runtime = useChatRuntime({
        api: "/api/chat",
    });
    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 pt-2 pb-20">
                <ThreadList />
                <Thread />
                <AssistantInstructions />
            </div>
        </AssistantRuntimeProvider>
    );
}