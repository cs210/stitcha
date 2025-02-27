'use client';

// import { createClerkSupabaseClient } from '@/app/supabase/client';
import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/utils/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(false);
	const [orders, setOrders] = useState<Order[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [sortBy, setSortBy] = useState<'client' | 'due_date' | 'order_quantity' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	useEffect(() => {
		if (!user) return;

		// Anonymous function to fetch products from Supabase
		(async () => {
			setLoading(true);

			const response = await fetch('/api/orders');
			const { data, error } = await response.json();

			if (!error) {
				setOrders(data);
			}

			setLoading(false);
		})();
	}, [user]);

	// Filter orders based on search query
	const filteredOrders = orders.filter((order) => [order.id, order.client, order.contact].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));

	// Sort filtered orders based on the selected criteria and order
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

	// Function to toggle sorting order based on the selected column
	const toggleSort = (column: 'client' | 'due_date' | 'order_quantity') => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	// Loading state
	if (loading) return <Loader />;

	return (
		<div className='p-6'>
			<HeaderContainer>
				<Header text='Orders' />
				<Description text='Manage and track customer orders.' />
			</HeaderContainer>

			<Input
				placeholder='Search orders by ID, client, or contact...'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className='mb-4 w-full'
			/>

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
							<TableRow key={order.id}>
								<TableCell>{order.client}</TableCell>
								<TableCell>{order.contact}</TableCell>
								<TableCell>{order.order_quantity}</TableCell>
								<TableCell>{new Date(order.due_date).toLocaleDateString('en-US')}</TableCell>
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
	);
}
