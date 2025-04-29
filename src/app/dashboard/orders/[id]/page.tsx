'use client';

import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { OrdersDetails } from '@/components/custom/orders/orders-details';
import { Order, Product } from '@/lib/schemas/global.types';
import { use, useEffect, useState } from 'react';
import { ProductParts } from '@/components/custom/orders/orders-product-parts';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(true);

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
                if (productsData.product_ids) {
                    for (const productId of productsData.product_ids) {
                        const productResponse = await fetch(`/api/products/${productId}`);

                        if (!productResponse.ok) {
                            throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
                        }

                        const productData = await productResponse.json();
                        allProductsData.push(productData);
                    }
                }

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

    if (loading || productLoading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }

    return (
        <>
            <HeaderContainer>
                <Header text={`Order for ${order?.client}`} />
            </HeaderContainer>

            <div className='py-4'>
                <div className='bg-white shadow rounded-lg p-6 mb-6'>
                    <div className='grid grid-cols-1 gap-4 mb-6'>
                        <div>
                            <h2 className='text-xl font-semibold mb-3'>Order Details</h2>
                            <OrdersDetails order={order} />
                        </div>
                    </div>
                </div>

                {products.length > 0 && (
                    <div className='space-y-6'>
                        <h2 className='text-xl font-semibold mb-3'>Products</h2>
                        {products.map((product) => (
                            <div key={product.id} className='bg-white shadow rounded-lg p-6'>
                                <ProductParts
                                    productId={product.id}
                                    productName={product.name}
                                    orderQuantity={order?.order_quantity || 0}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
