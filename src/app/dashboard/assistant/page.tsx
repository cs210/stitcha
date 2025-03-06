'use client';

import { AssistantRuntimeProvider, useAssistantInstructions } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { useEffect, useState } from "react";

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

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    useEffect(() => {
        console.log("PRODUCTS", products);
        console.log("ORDERS", orders);
    }, [products, orders]);

    const productDetails = products ? JSON.stringify(products, null, 2) : "No product data available";
    const orderDetails = orders ? JSON.stringify(orders, null, 2) : "No order data available";
    const language = "English";

    const instruction = `You are a helpful assistant. You have access to all the data from the following two Supabase tables: ${productDetails} and ${orderDetails}. If the user asks questions about a product, return the relevant information strictly from the product table. If the user asks questions about an order, return the relevant information strictly from the order table. If the user asks questions about a product that is not in the product table, say that you don't have information about that product. If the user asks questions about an order that is not in the order table, say that you don't have information about that order.
    You should only respond to the user in ${language}.`

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