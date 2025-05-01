'use client';

import { Container } from '@/components/custom/container/container';
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
import { toast } from 'sonner';

export default function Page() {
	const [loading, setLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);

	const handleDeleteOrder = async (orderId: string) => {
		try {
			// First get the order data to get product IDs
			const orderResponse = await fetch(`/api/orders/${orderId}`);
			const orderData = await orderResponse.json();

			if (orderData.product_ids) {
				// For each product, first delete its parts
				await Promise.all(orderData.product_ids.map(async (productId: string) => {
					// Get all parts for this product
					const partsResponse = await fetch(`/api/products/${productId}/parts`);
					const partsData = await partsResponse.json();

					// Delete all parts
					if (partsData.data) {
						await Promise.all(partsData.data.map(async (part: { part_id: string }) => {
							const deletePartResponse = await fetch(`/api/products/${productId}/parts/${part.part_id}`, {
								method: 'DELETE',
							});
							if (!deletePartResponse.ok) {
								throw new Error(`Failed to delete part ${part.part_id}`);
							}
						}));
					}

					// Update product to remove order_id
					const updateResponse = await fetch(`/api/products/${productId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ order_id: null }),
					});

					if (!updateResponse.ok) {
						const errorData = await updateResponse.json();
						throw new Error(errorData.error || `Failed to update product ${productId}`);
					}
				}));
			}

			// Finally delete the order
			const deleteResponse = await fetch(`/api/orders/${orderId}`, {
				method: 'DELETE',
			});

			if (!deleteResponse.ok) {
				const data = await deleteResponse.json();
				throw new Error(data.error || 'Failed to delete order');
			}

			// Refresh the orders list
			const response = await fetch('/api/orders');
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error);
			}

			setOrders(result.data);
			toast.success('Order deleted successfully');
		} catch (error) {
			console.error('Error deleting order:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to delete order');
		}
	};

	useEffect(() => {
		(async () => {
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
				toast.error('Failed to fetch orders');
			}
		})();
	}, []);

	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	const columns: ColumnDef<Order>[] = [
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
			cell: ({ row }) => <Link href={`/dashboard/orders/${row.original.id}`} className='font-medium'>{row.original.client}</Link>,
		},
		{
			accessorKey: 'contact',
			header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
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

	return (
		<>
			<HeaderContainer>
				<Header text='Orders' />
				<Description text='Manage and track customer orders' />
			</HeaderContainer>

			<Container>
				<DataTable columns={columns} searchPlaceholder='Search orders by client, email, or due date...' path='orders' data={orders} />
			</Container>
		</>
	);
}
