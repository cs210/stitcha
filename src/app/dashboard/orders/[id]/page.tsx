'use client';

import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { LoaderContainer } from '@/components/custom/loader-container';
import { Order, Product, User } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [product, setProduct] = useState<Product | null>(null);
	const [productLoading, setProductLoading] = useState(false);
	const [seamstresses, setSeamstresses] = useState<User[]>([]);
	const [selectedSeamstresses, setSelectedSeamstresses] = useState<string[]>([]);
	const [open, setOpen] = useState(false);
	const [seamstressesLoading, setSeamstressesLoading] = useState(false);

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

		async function fetchSeamstresses() {
			setSeamstressesLoading(true);

			try {
				const response = await fetch('/api/seamstresses');

				if (response.ok) {
					const data = await response.json();

					setSeamstresses(data.data || []);
				}
			} catch (error) {
				console.error('Error fetching seamstresses:', error);
			} finally {
				setSeamstressesLoading(false);
			}
		}

		fetchOrder();
		fetchSeamstresses();
	}, [id]);

	const toggleSeamstress = (seamstressId: string) => {
		setSelectedSeamstresses((current) => (current.includes(seamstressId) ? current.filter((id) => id !== seamstressId) : [...current, seamstressId]));
	};

	const removeSeamstress = (seamstressId: string) => {
		setSelectedSeamstresses((current) => current.filter((id) => id !== seamstressId));
	};

	// Loading state
	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	if (!order) {
		return <div className='p-6'>Order not found</div>;
	}

	return (
		<>
			<HeaderContainer>
				<Header text={`Order for ${order.client}`} />
			</HeaderContainer>

			<div className='py-4'>
				<div className='bg-white shadow rounded-lg p-6 mb-6'>
					<div className='grid grid-cols-2 gap-4 mb-6'>
						<div>
							<h2 className='text-xl font-semibold mb-3'>Order Details</h2>
							<div className='grid gap-2'>
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
					</div>
				</div>

				{product && (
					<div className='bg-white shadow rounded-lg p-6'>
						<h2 className='text-xl font-semibold mb-3'>Product Information</h2>
						<div className='flex items-center gap-4'>
							{product.image_urls && product.image_urls.length > 0 && (
								<div className='w-24 h-24 rounded overflow-hidden'>
									<Image src={product.image_urls[0]} alt={product.name || 'Product image'} className='w-full h-full object-cover' width={100} height={100} />
								</div>
							)}
							<div>
								<h3 className='text-lg font-medium'>
									<Link href={`/dashboard/products/${product.id}`} className='hover:underline text-blue-600'>
										{product.name}
									</Link>
								</h3>
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
		</>
	);
}
