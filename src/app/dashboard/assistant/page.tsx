'use client';

import { AssistantRuntimeProvider, useAssistantInstructions, AssistantCloud } from "@assistant-ui/react";
import { useChatRuntime, } from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { useEffect, useState } from "react";
// import LanguageToggleButton from "@/components/assistant-ui/language-toggle";

function AssistantInstructions() {
    const [products, setProducts] = useState(null);
    const [orders, setOrders] = useState(null);

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

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setOrders(result.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }

    // const fetchProgress = async () => {
    //     try {
    //         const response = await fetch('/api/progress');
    //         const result = await response.json();


    //     } catch (error) {
    //         console.error("Error fetching progress:", error);
    //     }
    // }

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        // fetchProgress();
    }, []);

    useEffect(() => {
    }, [products, orders]);

    const productDetails = products ? JSON.stringify(products, null, 2) : "No product data available";
    const orderDetails = orders ? JSON.stringify(orders, null, 2) : "No order data available";

    const instruction = `You are a helpful assistant for the organization Orientavida. You have access to all the data from the following two Supabase tables: ${productDetails} and ${orderDetails}. If the user asks questions about a product, return the relevant information strictly from the product table. If the user asks questions about an order, return the relevant information strictly from the order table. If the user asks questions about a product that is not in the product table, say that you don't have information about that product. If the user asks questions about an order that is not in the order table, say that you don't have information about that order.

    You should only respond to the user in the language that the user asks the question in (English or Portuguese).`

    // Simple string usage
    useAssistantInstructions(instruction);
    
    return <div></div>;
    
}

const cloud = new AssistantCloud({
    baseUrl: process.env["NEXT_PUBLIC_ASSISTANT_BASE_URL"]!,
    authToken: () =>
      fetch("/api/assistant-ui-token", { method: "POST" })
        .then((r) => r.json())
        .then((r) => r.token),
  });

export default function Page() {

    const runtime = useChatRuntime({
        cloud,
        api: "/api/chat",
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4">
                <ThreadList />
                <Thread />
                <AssistantInstructions />
            </div>
        </AssistantRuntimeProvider>
    );
}
