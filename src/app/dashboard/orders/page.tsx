'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { LoaderContainer } from '@/components/custom/loader-container';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/lib/schemas/global.types';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Page() {
	const [loading, setLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'client' | 'due_date' | 'order_quantity' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	useEffect(() => {
		async function getOrders() {
			const response = await fetch('/api/orders');
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error);
			}

			const { data } = result;

			setOrders(data);

			setLoading(false);
		}
		getOrders();
	}, []);

	// filter orders based on search query
	const filteredOrders = orders.filter((order: Order) => [order.id, order.client, order.contact].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));

	// sort orders based on selected column
	const sortedOrders = [...filteredOrders].sort((a, b) => {
		if (!sortBy) return 0;
		let valA = a[sortBy];
		let valB = b[sortBy];

		if (sortBy === 'due_date') {
			valA = new Date(valA).getTime();
			valB = new Date(valB).getTime();
		} else if (sortBy === 'order_quantity') {
			valA = Number(valA);
			valB = Number(valB);
		}

		return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
	});

	// toggle sorting function
	const toggleSort = (column: 'client' | 'due_date' | 'order_quantity') => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	// Loading state
	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<>
			<HeaderContainer>
				<Header text='Orders' />
				<Description text='Manage and track customer orders' />
			</HeaderContainer>

			{/* search Input and New Order button */}
			<div className='py-4'>
				<div className='flex gap-4 mb-4 w-full'>
					<Input
						placeholder='Search orders by ID, client, or contact...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full'
					/>
					<Button asChild>
						<Link href='/dashboard/orders/new'>
							<Plus size={16} className='mr-2' />
							New Order
						</Link>
					</Button>
				</div>

				{/* Orders Table */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>
								<Button variant='ghost' onClick={() => toggleSort('client')}>
									Client <ArrowUpDown size={16} />
								</Button>
							</TableHead>
							<TableHead>Contact</TableHead>
							<TableHead>
								<Button variant='ghost' onClick={() => toggleSort('order_quantity')}>
									Quantity <ArrowUpDown size={16} />
								</Button>
							</TableHead>
							<TableHead>
								<Button variant='ghost' onClick={() => toggleSort('due_date')}>
									Due Date <ArrowUpDown size={16} />
								</Button>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedOrders.length ? (
							sortedOrders.map((order) => (
								<TableRow key={order.id} className='cursor-pointer hover:bg-gray-100'>
									<TableCell>
										<Link href={`/dashboard/orders/${order.id}`} className='block'>
											{order.client}
										</Link>
									</TableCell>
									<TableCell>{order.contact}</TableCell>
									<TableCell>{order.order_quantity}</TableCell>
									<TableCell>{new Date(order.due_date).toLocaleDateString('en-US')}</TableCell>
									<TableCell>
										<div className='actions-dropdown'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='ghost' className='h-8 w-8 p-0'>
														<span className='sr-only'>Open menu</span>
														<MoreHorizontal className='h-4 w-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													<DropdownMenuItem
														onClick={() => {
															// Handle edit action
															console.log('Edit order:', order.id);
														}}
													>
														<Pencil className='mr-2 h-4 w-4' />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															// Handle delete action
															console.log('Delete order:', order.id);
															fetch(`/api/orders/${order.id}`, {
																method: 'DELETE',
																headers: {
																	'Content-Type': 'application/json',
																},
															});

															// refresh the orders list
															window.location.reload();
														}}
														className='text-red-600'
													>
														<Trash className='mr-2 h-4 w-4' />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className='text-center'>
									No orders found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
