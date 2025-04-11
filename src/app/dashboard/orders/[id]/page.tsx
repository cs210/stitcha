'use client';

import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { OrdersDetails } from '@/components/custom/orders/orders-details';
import { OrdersProduct } from '@/components/custom/orders/orders-product';
import { Order, Product } from '@/lib/schemas/global.types';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [product, setProduct] = useState<Product | null>(null);
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

				// Fetch product data if product_id exists
				if (data.product_id) {
					try {
						const productResponse = await fetch(`/api/products/${data.product_id}`);

						if (productResponse.ok) {
							const productData = await productResponse.json();

							setProduct(productData);
						}
					} catch (error) {
						console.error('Error fetching product:', error);
					} finally {
						setProductLoading(false);
					}
				}
			} catch (error) {
				console.error('Error fetching order:', error);
			} finally {
				setProductLoading(false);
				setLoading(false);
			}
		}

		fetchOrder();
	}, [id]);

	// Loading state
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

				{product && (
					<div className='bg-white shadow rounded-lg p-6'>
						<h2 className='text-xl font-semibold mb-3'>Product Information</h2>
						<div className='flex items-center gap-4'>
							<OrdersProduct product={product} />
						</div>
					</div>
				)}
			</div>
		</>
	);
}
