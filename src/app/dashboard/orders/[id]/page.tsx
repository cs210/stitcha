'use client';

import { Order } from '@/utils/schemas/global.types';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [product, setProduct] = useState<any>(null);
	const [productLoading, setProductLoading] = useState(false);

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
					setProductLoading(true);
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
				setLoading(false);
			}
		}

		fetchOrder();
	}, [id]);

	if (loading) {
		return <div className='p-6'>Loading order details...</div>;
	}

	if (!order) {
		return <div className='p-6'>Order not found</div>;
	}

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold mb-4'>Order #{id}</h1>

			<div className='bg-white shadow rounded-lg p-6 mb-6'>
				<h2 className='text-xl font-semibold mb-3'>Order Details</h2>
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-gray-600'>Client:</p>
						<p>{order.client}</p>
					</div>
					<div>
						<p className='text-gray-600'>Contact:</p>
						<p>{order.contact}</p>
					</div>

					<div>
						<p className='text-gray-600'>Due Date:</p>
						<p>{order.due_date ? new Date(order.due_date).toLocaleDateString() : ''}</p>
					</div>
					<div>
						<p className='text-gray-600'>Order Quantity:</p>
						<p>{order.order_quantity}</p>
					</div>
					<div>
						<p className='text-gray-600'>Product ID:</p>
						<p className='text-sm truncate'>{order.product_id}</p>
					</div>
				</div>
			</div>

			{product && (
				<div className='bg-white shadow rounded-lg p-6'>
					<h2 className='text-xl font-semibold mb-3'>Product Information</h2>
					<div className='flex items-center gap-4'>
						{product.image_url && (
							<div className='w-24 h-24 rounded overflow-hidden'>
								<img src={product.image_url} alt={product.name || 'Product image'} className='w-full h-full object-cover' />
							</div>
						)}
						<div>
							<h3 className='text-lg font-medium'>{product.name}</h3>
						</div>
					</div>
				</div>
			)}

			{productLoading && (
				<div className='bg-white shadow rounded-lg p-6'>
					<p>Loading product information...</p>
				</div>
			)}
		</div>
	);
}
