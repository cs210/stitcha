'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Order, Product, User } from '@/lib/schemas/global.types';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
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

			<div className='bg-white shadow rounded-lg p-6 mb-6'>
				<h2 className='text-xl font-semibold mb-3'>Assign Seamstresses</h2>

				<div className='mb-4'>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between'>
								{selectedSeamstresses.length > 0
									? `${selectedSeamstresses.length} seamstress${selectedSeamstresses.length > 1 ? 'es' : ''} selected`
									: 'Select seamstresses...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search seamstresses...' />
								<CommandEmpty>{seamstressesLoading ? 'Loading...' : 'No seamstress found.'}</CommandEmpty>
								<CommandGroup>
									{seamstresses.map((seamstress: User) => (
										<CommandItem key={seamstress.id} value={seamstress.id} onSelect={() => toggleSeamstress(seamstress.id)}>
											<Check className={cn('mr-2 h-4 w-4', selectedSeamstresses.includes(seamstress.id) ? 'opacity-100' : 'opacity-0')} />
											{seamstress.first_name} {seamstress.last_name}
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				<div className='flex flex-wrap gap-2'>
					{selectedSeamstresses.map((id) => {
						const seamstress = seamstresses.find((s: User) => s.id === id);
						return (
							<Badge key={id} variant='secondary' className='px-3 py-1'>
								{seamstress?.first_name} {seamstress?.last_name}
								<button className='ml-2 text-xs' onClick={() => removeSeamstress(id)}>
									×
								</button>
							</Badge>
						);
					})}
				</div>
			</div>

			{product && (
				<div className='bg-white shadow rounded-lg p-6'>
					<h2 className='text-xl font-semibold mb-3'>Product Information</h2>
					<div className='flex items-center gap-4'>
						{product.image_url && (
							<div className='w-24 h-24 rounded overflow-hidden'>
								<Image src={product.image_url} alt={product.name || 'Product image'} className='w-full h-full object-cover' width={100} height={100} />
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
