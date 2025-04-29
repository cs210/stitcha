'use client';

import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { Order, Product } from '@/lib/schemas/global.types';
import { use, useEffect, useState } from 'react';
import { ProductParts } from '@/components/custom/orders/orders-product-parts';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Part {
    total_units: number;
    units_completed: number;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(true);
    const [totalParts, setTotalParts] = useState(0);
    const [completedParts, setCompletedParts] = useState(0);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const response = await fetch(`/api/orders/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch order: ${response.statusText}`);
                }

                const data = await response.json();
                setOrder(data);

                // Fetch all products associated with the order
                const productsResponse = await fetch(`/api/orders/${id}/products`);
                const productsData = await productsResponse.json();

                // Fetch product data for each product_id
                const allProductsData: Product[] = [];
                let totalPartsCount = 0;
                let completedPartsCount = 0;

                if (productsData.product_ids) {
                    for (const productId of productsData.product_ids) {
                        const productResponse = await fetch(`/api/products/${productId}`);
                        const partsResponse = await fetch(`/api/products/${productId}/parts`);

                        if (!productResponse.ok) {
                            throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
                        }

                        const productData = await productResponse.json();
                        const partsData = await partsResponse.json();
                        
                        if (partsData.data) {
                            partsData.data.forEach((part: Part) => {
                                totalPartsCount += part.total_units;
                                completedPartsCount += part.units_completed;
                            });
                        }
                        
                        allProductsData.push(productData);
                    }
                }

                setTotalParts(totalPartsCount);
                setCompletedParts(completedPartsCount);
                setProducts(allProductsData);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setProductLoading(false);
                setLoading(false);
            }
        }

        fetchOrder();
    }, [id]);

    const progressPercentage = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;
    const totalUnits = products.length * (order?.order_quantity || 0);

    if (loading || productLoading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/dashboard/orders" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold">Order #{id}</h1>
                            <span className="bg-black text-white text-xs px-2 py-1 rounded">New</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Customer Info */}
                        <div>
                            <h2 className="text-sm font-medium text-gray-500 mb-2">Customer</h2>
                            <h3 className="text-lg font-semibold mb-1">{order?.client}</h3>
                            <p className="text-sm text-gray-600">{order?.contact}</p>
                        </div>

                        {/* Deadline */}
                        <div>
                            <h2 className="text-sm font-medium text-gray-500 mb-2">Deadline</h2>
                            <h3 className="text-lg font-semibold mb-1">
                                {new Date(order?.due_date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h3>
                        </div>

                        {/* Order Value */}
                        <div>
                            <h2 className="text-sm font-medium text-gray-500 mb-2">Order Value</h2>
                            <h3 className="text-lg font-semibold mb-1">N/A</h3>
                            <p className="text-gray-500">{products.length} products</p>
                        </div>

                        {/* Production Progress */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-500">Production Progress</h2>
                                <span className="text-sm text-gray-500">{completedParts} of {totalParts} parts</span>
                            </div>
                            <div className="mb-1">
                                <Progress value={progressPercentage} className="h-2" />
                            </div>
                            <p className="text-lg font-semibold">{progressPercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='container mx-auto px-4 py-6'>
                <div className='space-y-6'>
                    {/* <div className="flex items-center justify-between">
                        <h2 className='text-xl font-semibold'>Products</h2>
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                            Export Order
                        </button>
                    </div> */}
                    {products.length > 0 ? (
                        <>
                            {products.map((product) => (
                                <div key={product.id} className='bg-white shadow rounded-lg p-6'>
                                    <ProductParts
                                        productId={product.id}
                                        productName={product.name}
                                        orderQuantity={order?.order_quantity || 0}
                                    />
                                </div>
                            ))}

                            <div className="bg-white shadow rounded-lg p-6 mt-8">
                                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
                                <div className="grid grid-cols-4 gap-8 text-center">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
                                        <p className="text-2xl font-semibold">{products.length}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Units</h3>
                                        <p className="text-2xl font-semibold">{totalUnits}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Parts</h3>
                                        <p className="text-2xl font-semibold">{totalParts}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Completion</h3>
                                        <p className="text-2xl font-semibold">{progressPercentage}%</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='bg-white shadow rounded-lg p-6 text-center text-gray-500'>
                            No Products Attached to Order
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
