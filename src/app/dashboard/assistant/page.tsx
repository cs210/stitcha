'use client';

import { AssistantRuntimeProvider, useAssistantInstructions, AssistantCloud, makeAssistantToolUI } from "@assistant-ui/react";
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
    const [productCosts, setProductCosts] = useState(null);
    const [productRawMaterials, setProductRawMaterials] = useState(null);
    const [rawMaterials, setRawMaterials] = useState(null);

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

    const fetchProductCosts = async () => {
        try {
            const response = await fetch('/api/products/costs');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setProductCosts(result.data);
        } catch (error) {
            console.error("Error fetching product costs:", error);
        }
    }

    const fetchProductRawMaterials = async () => {
        try {
            const response = await fetch('/api/product-raw-materials');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setProductRawMaterials(result.data);
        } catch (error) {
            console.error("Error fetching product raw materials:", error);
        }
    }

    const fetchRawMaterials = async () => {
        try {
            const response = await fetch('/api/products/raw_materials');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }
            setRawMaterials(result.data);
        } catch (error) {
            console.error("Error fetching raw materials:", error);
        }
    }


    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchProductUsers();
        fetchUsers();
        fetchProductCosts();
        fetchProductRawMaterials();
        fetchRawMaterials();
    }, []);

    useEffect(() => {
    }, [products, orders, productUsers, users, progress]);

    const productDetails = products ? JSON.stringify(products, null, 2) : "No product data available";
    // const orderDetails = orders ? JSON.stringify(orders, null, 2) : "No order data available";
    // const usersDetails = users ? JSON.stringify(users, null, 2) : "No users data available";
    // const productUsersDetails = productUsers ? JSON.stringify(productUsers, null, 2) : "No product users data available";
    // const productCostsDetails = productCosts ? JSON.stringify(productCosts, null, 2) : "No product costs data available";
    // const productRawMaterialsDetails = productRawMaterials ? JSON.stringify(productRawMaterials, null, 2) : "No product raw materials data available";
    // const rawMaterialsDetails = rawMaterials ? JSON.stringify(rawMaterials, null, 2) : "No raw materials data available";

    const instruction = `You are a helpful professional assistant for the organization Orientavida. You have access to all the data from the following table: the PRODUCT TABLE ${productDetails}. If the user mentions a product (i.e. by its name or properties), you will use the product table to find the product id. You should also use the product table to answer the user's questions. 

    (a) If the user asks questions about predicting the costs of a new product, you should first find the product_id using the product table. Then, you should call the relevant function to predict the costs of the new product.

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


// const ProductCostsToolUI = makeAssistantToolUI({
//     toolName: "get_product_costs",
//     render: async ({ product_id }) => {
//         try {
//             const productCosts = await fetch(`/api/products/${product_id}/costs`, { method: "GET" });
//             const productCostsData = await productCosts.json();

//             console.log("productCostsData:", productCostsData);

//             return (
//                 <div>
//                     <p>The cost of the product is ${productCostsData.cost}</p>
//                 </div>
//             );
//         } catch (error) {
//             console.error("Error fetching product costs:", error);
//             return (
//                 <div>
//                     <p>Error loading product costs</p>
//                 </div>
//             );
//         }
//     }
// });


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
            {/* <ProductCostsToolUI /> */}
        </AssistantRuntimeProvider>
    );
}
