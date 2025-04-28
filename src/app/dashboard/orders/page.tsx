'use client';

import { DataTable } from '@/components/custom/data-table/data-table';
import { DataTableColumnHeader } from '@/components/custom/data-table/data-table-column-header';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Order } from '@/lib/schemas/global.types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Handle delete order
const handleDeleteOrder = async (orderId: string) => {
	try {
		const response = await fetch(`/api/orders/${orderId}`, {
			method: 'DELETE',
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Failed to delete order');
		}
	} catch (error) {
		console.error('Error deleting order:', error);
	}
};

export const columns: ColumnDef<Order>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'client',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Client' />,					
		cell: ({ row }) => <Link href={`/dashboard/orders/${row.original.id}`} className='text-base font-medium'>{row.original.client}</Link>,
	},
	{
		accessorKey: 'contact',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Contact' />,
	},
	{
		accessorKey: 'order_quantity',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity' />,
	},
	{
		accessorKey: 'due_date',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const order = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' className='h-8 w-8 p-0'>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem>
							<Pencil className='mr-2 h-4 w-4' />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleDeleteOrder(order.id)}>
							<Trash className='mr-2 h-4 w-4' />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export default function Page() {
	const [loading, setLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);

	useEffect(() => {
		// Get orders from the database
		async function getOrders() {
			try {
				const response = await fetch('/api/orders');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				setOrders(result.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching orders:', error);
			}
		}

		getOrders();
	}, []);

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
				<DataTable columns={columns} searchPlaceholder='Search orders by ID, client, or contact...' path='orders' data={orders} />
			</div>
		</>
	);
}
