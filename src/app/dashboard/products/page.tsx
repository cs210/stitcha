'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { LoaderContainer } from '@/components/custom/loader-container';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/lib/schemas/global.types';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductPage() {
	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(true);
	const [products, setProducts] = useState<Product[]>([]);
	const [progressFilter, setProgressFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [sortBy, setSortBy] = useState<'name' | 'weight' | 'product_type' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	useEffect(() => {
		async function getProducts() {
			try {
				const response = await fetch('/api/products');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				const { data } = result;

				setProducts(data);

				setLoading(false);
			} catch (error) {
				console.error('Error fetching products:', error);
			}
		}

		getProducts();
	}, []);

	// Get unique progress levels and product types
	const progressLevels = ['all', ...new Set(products.map((product) => product.progress_level))];

	const productTypes = ['all', ...new Set(products.map((product) => product.product_type))];

	// Update filtered products to include type filter
	const filteredProducts = products.filter((product) => {
		const matchesProgressFilter = progressFilter === 'all' || product.progress_level === progressFilter;
		const matchesTypeFilter = typeFilter === 'all' || product.product_type === typeFilter;
		const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesProgressFilter && matchesTypeFilter && matchesSearch;
	});

	// 🔄 Sort products based on selected column
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		if (!sortBy) return 0;
		let valA = a[sortBy];
		let valB = b[sortBy];

		if (sortBy === 'weight') {
			valA = Number(valA);
			valB = Number(valB);
		}

		return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
	});

	// 🔀 Toggle sorting function
	const toggleSort = (column: 'name' | 'weight' | 'product_type') => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

	const handleDeleteProduct = async (productId: string) => {
		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to delete product');
			}

			setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
		} catch (error) {
			console.error('Error deleting product:', error);
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
				<Header text='Products' />
				<Description text='View and manage all products' />
			</HeaderContainer>

			<div className='py-4'>
				<div className='flex gap-4 mb-4 w-full'>
					<Input placeholder='Search products...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='flex-1' />
					<Select value={progressFilter} onValueChange={setProgressFilter}>
						<SelectTrigger className='w-40'>
							<SelectValue placeholder='Filter by progress' />
						</SelectTrigger>
						<SelectContent>
							{progressLevels.map((level) => (
								<SelectItem key={level} value={level}>
									{level === 'all' ? 'Any' : level}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className='w-40'>
							<SelectValue placeholder='Filter by type' />
						</SelectTrigger>
						<SelectContent>
							{productTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type === 'all' ? 'All Types' : type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button asChild>
						<Link href='/dashboard/products/new'>
							<Plus size={16} className='mr-2' />
							New Product
						</Link>
					</Button>
				</div>

				<div className='pb-10'>
					<Table className='border-t-0'>
						<TableHeader>
							<TableRow>
								<TableHead className='w-48'>Image</TableHead>
								<TableHead>
									<Button variant='ghost' onClick={() => toggleSort('name')}>
										Name <ArrowUpDown size={16} />
									</Button>
								</TableHead>
								<TableHead>Progress</TableHead>
								<TableHead className='w-[100px]'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currentItems.length ? (
								currentItems.map((product) => (
									<TableRow key={product.id} className='cursor-pointer hover:bg-gray-100' onClick={() => router.push(`/dashboard/products/${product.id}`)}>
										<TableCell className='py-4'>
											<Image
												src={product.image_url || ''}
												alt={product.name}
												className='w-32 h-32 object-contain rounded-lg bg-white p-2 border'
												width={128}
												height={128}
											/>
										</TableCell>
										<TableCell>
											<div className='space-y-1'>
												<div className='text-base font-medium'>{product.name}</div>
												<div className='text-xs text-gray-500'>Type: {product.product_type}</div>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1 text-sm'>
												<div
													className={`h-3 w-3 rounded-full ${
														product.progress_level === 'In Progress' ? 'bg-yellow-400' : product.progress_level === 'Done' ? 'bg-green-500' : 'bg-red-500'
													}`}
												/>
												{product.progress_level}
											</div>
										</TableCell>
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
														<DropdownMenuItem className='text-sm py-2'>
															<Pencil className='mr-2 h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();

																handleDeleteProduct(product.id);
															}}
															className='text-red-600 text-sm py-2'
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
									<TableCell colSpan={4} className='text-center py-6 text-base'>
										No products found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{/* Pagination Controls */}
					<div className='mt-4 flex items-center justify-between'>
						<div className='text-sm text-gray-500'>
							Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
						</div>
						<div className='flex gap-2'>
							<Button variant='outline' onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
								Previous
							</Button>
							<Button variant='outline' onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
								Next
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
