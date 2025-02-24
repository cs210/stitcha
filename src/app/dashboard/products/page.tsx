'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'name' | 'weight' | 'product_type' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [products, setProducts] = useState<any[]>([]);

	// 🔍 Filter products based on search query
	// const filteredProducts = products.filter((product) =>
	// 	[product.name, product.system_code, product.barcode].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
	// );

	// 🔄 Sort products based on selected column
	// const sortedProducts = [...filteredProducts].sort((a, b) => {
	// 	if (!sortBy) return 0;
	// 	let valA = a[sortBy];
	// 	let valB = b[sortBy];

	// 	if (sortBy === 'weight') {
	// 		valA = Number(valA);
	// 		valB = Number(valB);
	// 	}

	// 	return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
	// });

	// 🔀 Toggle sorting function
	const toggleSort = (column: 'name' | 'weight' | 'product_type') => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	return (
		<div className='p-6'>
			<HeaderContainer>
				<Header text='Products' />
				<Description text='Explore a comprehensive overview of our products, including features, specifications, and benefits to help you make informed decisions.' />
			</HeaderContainer>

			{/* 🔍 Search Input */}
			<Input
				placeholder='Search products by Name, System Code, or Barcode...'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className='mb-4 w-full'
			/>

			{/* 📋 Products Table */}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Image</TableHead>
						<TableHead>
							<Button variant='ghost' onClick={() => toggleSort('name')}>
								Name <ArrowUpDown size={16} />
							</Button>
						</TableHead>
						<TableHead>System Code</TableHead>
						<TableHead>Cert Number</TableHead>
						<TableHead>Barcode</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>
							<Button variant='ghost' onClick={() => toggleSort('weight')}>
								Weight <ArrowUpDown size={16} />
							</Button>
						</TableHead>
						<TableHead>Width</TableHead>
						<TableHead>Height</TableHead>
						<TableHead>Lost %</TableHead>
						<TableHead>
							<Button variant='ghost' onClick={() => toggleSort('product_type')}>
								Product Type <ArrowUpDown size={16} />
							</Button>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{/* {sortedProducts.length ? (
						sortedProducts.map((product) => (
							<TableRow key={product.id}>
								<TableCell>
									<img src={product.image_url} alt={product.name} className='w-16 h-16 object-cover' />
								</TableCell>
								<TableCell>{product.name}</TableCell>
								<TableCell>{product.system_code}</TableCell>
								<TableCell>{product.inmetro_cert_number}</TableCell>
								<TableCell>{product.barcode}</TableCell>
								<TableCell>{product.description}</TableCell>
								<TableCell>{product.weight} kg</TableCell>
								<TableCell>{product.width} cm</TableCell>
								<TableCell>{product.height} cm</TableCell>
								<TableCell>{product.percent_pieces_lost}%</TableCell>
								<TableCell>{product.product_type}</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={11} className='text-center'>
								No products found.
							</TableCell>
						</TableRow>
					)} */}
				</TableBody>
			</Table>
		</div>
	);
}
