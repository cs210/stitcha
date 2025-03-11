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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'client' | 'due_date' | 'order_quantity' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	useEffect(() => {
		async function getOrders() {
			try {
				const response = await fetch('/api/orders');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				const { data } = result;
				setOrders(data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching orders:', error);
			}
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

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

	// toggle sorting function
	const toggleSort = (column: 'client' | 'due_date' | 'order_quantity') => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	const handleDeleteOrder = async (orderId: string) => {
		try {
			const response = await fetch(`/api/orders/${orderId}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete order');
			}

			setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
		} catch (error) {
			console.error('Error deleting order:', error);
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

			<div className='py-4'>
				<div className='flex gap-4 mb-4 w-full'>
					<Input
						placeholder='Search orders by ID, client, or contact...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='flex-1'
					/>
					<Button asChild>
						<Link href='/dashboard/orders/new'>
							<Plus size={16} className='mr-2' />
							New Order
						</Link>
					</Button>
				</div>

				{/* Orders Table */}
				<div className='rounded-md border'>
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
								<TableHead className='w-[100px]'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currentItems.map((order) => (
								<TableRow key={order.id}>
									<TableCell>
										<Link href={`/dashboard/orders/${order.id}`}>{order.client}</Link>
									</TableCell>
									<TableCell>{order.contact}</TableCell>
									<TableCell>{order.order_quantity}</TableCell>
									<TableCell>{order.due_date ? new Date(order.due_date).toLocaleDateString() : '-'}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' className='h-8 w-8 p-0'>
													<span className='sr-only'>Open menu</span>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
													<Pencil className='mr-2 h-4 w-4' />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleDeleteOrder(order.id)}>
													<Trash className='mr-2 h-4 w-4' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className='flex items-center justify-between space-x-2 py-4'>
					<div className='text-sm text-muted-foreground'>
						Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedOrders.length)} of {sortedOrders.length} entries
					</div>
					<div className='flex items-center space-x-2'>
						<Button variant='outline' size='sm' onClick={() => setCurrentPage((old) => Math.max(old - 1, 1))} disabled={currentPage === 1}>
							Previous
						</Button>
						<div className='text-sm'>
							Page {currentPage} of {totalPages}
						</div>
						<Button variant='outline' size='sm' onClick={() => setCurrentPage((old) => Math.min(old + 1, totalPages))} disabled={currentPage === totalPages}>
							Next
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
