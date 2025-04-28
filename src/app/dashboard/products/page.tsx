'use client';

import { DataTable } from '@/components/custom/data-table/data-table';
import { DataTableColumnHeader } from '@/components/custom/data-table/data-table-column-header';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Product } from '@/lib/schemas/global.types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Handle delete product
const handleDeleteProduct = async (productId: string) => {
	try {
		const response = await fetch(`/api/products/${productId}`, {
			method: 'DELETE',
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Failed to delete product');
		}
	} catch (error) {
		console.error('Error deleting product:', error);
	}
};

export const columns: ColumnDef<Product>[] = [
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
		id: 'image',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Image' />,
		cell: ({ row }) => (
			<Image
				src={row.original.image_urls && row.original.image_urls.length > 0 ? row.original.image_urls[0] : '/placeholder-image.jpg'}
				alt={row.original.name}
				className='w-32 h-32 object-contain'
				width={128}
				height={128}
			/>
		),
	},
	{
		accessorKey: 'name',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
		cell: ({ row }) => (
			<Link href={`/dashboard/products/${row.original.id}`} className='text-base font-medium'>
				{row.original.name}
			</Link>
		),
	},
	{
		accessorKey: 'type',
		header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
		cell: ({ row }) => <Badge variant='outline'>{row.original.product_type}</Badge>,
	},
	{
		accessorKey: 'system_code',
		header: ({ column }) => <DataTableColumnHeader column={column} title='System Code' />,		
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const product = row.original;

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
						<DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
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
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		// Get products from the database
		async function getProducts() {
			try {
				const response = await fetch('/api/products');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				setProducts(result.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching products:', error);
			}
		}

		getProducts();
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
				<Header text='Products' />
				<Description text='View and manage all products' />
			</HeaderContainer>

			<div className='py-4'>
				<DataTable columns={columns} searchPlaceholder='Search products by name, progress, or type...' path='products' data={products} />
			</div>
		</>
	);
}
