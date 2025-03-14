'use client';

import { AssistantRuntimeProvider, useAssistantInstructions, AssistantCloud } from "@assistant-ui/react";
import { useChatRuntime, } from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { useEffect, useState } from "react";
import { Asul } from "next/font/google";

// a better way to do this in the future -- use function calling to recursively make api fetch calls in order rather than passing in all the data in the databases. current approach is not scalable.

function AssistantInstructions() {
    const [products, setProducts] = useState(null);
    const [orders, setOrders] = useState(null);
    const [progress, setProgress] = useState(null);
    const [productUsers, setProductUsers] = useState(null);
    const [users, setUsers] = useState(null);

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

    const fetchProductUsers = async () => {

        try {
            const response = await fetch('/api/product-users');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setProductUsers(result.data);
        } catch (error) {
            console.error("Error fetching product users:", error);
        }

    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/seamstresses');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setUsers(result.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }
    
    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchProductUsers();
        fetchUsers();
    }, []);

    useEffect(() => {
    }, [products, orders, productUsers, users, progress]);

    const productDetails = products ? JSON.stringify(products, null, 2) : "No product data available";
    const orderDetails = orders ? JSON.stringify(orders, null, 2) : "No order data available";
    const usersDetails = users ? JSON.stringify(users, null, 2) : "No users data available";
    const productUsersDetails = productUsers ? JSON.stringify(productUsers, null, 2) : "No product users data available";

    const instruction = `You are a helpful professional assistant for the organization Orientavida. You have access to all the data from the following 5 Supabase tables: the PRODUCT TABLE ${productDetails}, the ORDER TABLE ${orderDetails}, the PRODUCT_USERS TABLE ${productUsersDetails}, and the USERS TABLE ${usersDetails}. You must use the data from the tables to answer the user's questions. If necessary, you are encouraged to link the data from multiple tables to answer the user's questions (i.e. search by product or user id).
    
    (a) If the user asks questions about a product, return the relevant information strictly from the product table. If the user asks questions about a product that is not in the product table, say that you don't have information about that product. Include a link to the image url which the user can click on to view the image. If a product has multiple images, ONLY include 1 image url unless the user asks for more. Format the description text so it is easy to read.
    
    (b) If the user asks questions about an order, return the relevant information strictly from the order table. If the user asks questions about an order that is not in the order table, say that you don't have information about that order.
    
    (c) If the user asks questions about which seamstress is assigned to a product, return the relevant information strictly from the product_users table. Use the products table to extract the product_id that corresponds to the product that the user is asking about, then map that to the seamstress_id in the product_users table, which can then further be mapped to the seamstress's information (such as name, email, phone number, etc.) in the users table. If no seamstress is assigned to the product, say that no seamstress is assigned to the product.

    (d) If the user asks questions about a 'seamstress', return the relevant information strictly from the users table. If the user asks questions about a user that is not in the users table, say that you don't have information about that user.

    (e) If the user asks questions about the progress of a product, return the status (Not Started, In Progress, Done) of the product and any relevant information strictly from the progress table.

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
            {/* <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4"> */}
            <div className="flex gap-x-6 flex-row h-full overflow-y-hidden">
                <div className="w-1/4">
                <ThreadList />
                </div>
                <div className="w-3/4">
                <Thread />
                </div>
                <AssistantInstructions />
            </div>
        </AssistantRuntimeProvider>
    );
}
