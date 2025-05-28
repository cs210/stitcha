'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { DataTable } from '@/components/custom/data-table/data-table';
import { DataTableColumnHeader } from '@/components/custom/data-table/data-table-column-header';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { Product } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';

export default function Page() {
	const { lang } = useContext(LangContext);
	const { user } = useUser();
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	const [products, setProducts] = useState<Product[]>([]);

	// Handle deleting a product
	const handleDeleteProduct = async (id: string) => {
		const response = await fetch(`/api/products/${id}`, {
			method: 'DELETE',
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error);
		}

		const newProducts = products.filter((product) => product.id !== id);

		setProducts(newProducts);
	};

	const columns: ColumnDef<Product>[] = [
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
			header: ({ column }) => <DataTableColumnHeader dict={dict} column={column} title='Image' />,
			cell: ({ row }) => (
				<Image
					src={row.original.image_urls && row.original.image_urls.length > 0 ? row.original.image_urls[0] : '/images/placeholder-image.jpg'}
					alt={row.original.name}
					className='w-32 h-auto object-contain'
					width={32}
					height={32}
				/>
			),
		},
		{
			accessorKey: 'name',
			header: ({ column }) => <DataTableColumnHeader dict={dict} column={column} title={dict.adminsSection.products.table.name} />,
			cell: ({ row }) => (
				<Link href={`/dashboard/products/${row.original.id}`} className='font-medium'>
					{row.original.name}
				</Link>
			),
		},
		{
			accessorKey: 'type',
			header: ({ column }) => <DataTableColumnHeader dict={dict} column={column} title={dict.adminsSection.products.table.type} />,
			cell: ({ row }) => (
				<Badge variant='outline' className='text-sm text-center'>
					{row.original.product_type}
				</Badge>
			),
		},
		{
			accessorKey: 'progress_level',
			header: ({ column }) => <DataTableColumnHeader dict={dict} column={column} title={dict.adminsSection.products.table.progressLevel} />,
			cell: ({ row }) => (
				<Badge
					className={`${
						row.original.progress_level === 'Not Started'
							? `bg-red-500 hover:bg-red-500`
							: row.original.progress_level === 'In Progress'
							? `bg-yellow-400 hover:bg-yellow-400`
							: `bg-green-500 hover:bg-green-500`
					}`}
				>
					{row.original.progress_level}
				</Badge>
			),
		},
		{
			accessorKey: 'system_code',
			header: ({ column }) => <DataTableColumnHeader dict={dict} column={column} title={dict.adminsSection.products.table.systemCode} />,
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const product = row.original;

				// Only admins can edit and delete products
				if (user?.organizationMemberships[0].role !== 'org:admin') {
					return null;
				}

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
								{dict.general.table.body.edit}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									handleDeleteProduct(product.id);
								}}
							>
								<Trash className='mr-2 h-4 w-4' />
								{dict.general.table.body.delete}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	useEffect(() => {
		if (!user) return;
		
		(async () => {
			try {
				const dict = await getDictionary(lang);

				setDict(dict);

				if (user?.organizationMemberships[0].role === 'org:admin') {
					const response = await fetch('/api/products');
					const result = await response.json();

					if (!response.ok) {
						throw new Error(result.error);
					}

					setProducts(result.data);
				} else {
					const response = await fetch(`/api/seamstresses/${user?.id}`);
					const result = await response.json();					

					if (!response.ok) {
						throw new Error(result.error);
					}

					setProducts(result.data.products);
				}
				
				setLoading(false);
			} catch (error) {
				// toast({
				// 	title: dict.products.notifcations.error,
				// 	description: dict.products.notifcations.errorDescription,
				// 	variant: 'destructive',
				// });
			}
		})();
	}, [lang, user]);

	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<H2>{dict.adminsSection.products.title}</H2>
				<P className='mt-2'>{dict.adminsSection.products.description}</P>
			</HeaderContainer>

			<Container>
				<DataTable dict={dict} columns={columns} searchPlaceholder={dict.adminsSection.products.table.search} isAdmin={user?.organizationMemberships[0].role === 'org:admin'} path='products' data={products} />
			</Container>
		</>
	);
}
