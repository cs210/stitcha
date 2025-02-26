'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser } from '@clerk/nextjs';
import { ArrowUpDown, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
	const { user } = useUser();
	// const client = createClerkSupabaseClient();

	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'name' | 'weight' | 'product_type' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [products, setProducts] = useState<any[]>([]);

	useEffect(() => {
		if (!user) return;

		// Anonymous function to fetch products from Supabase
		(async () => {
			setLoading(true);

			const response = await fetch('/api/products');
			const { data, error } = await response.json();

			console.log(data, error);

			if (!error) {
				setProducts(data);
			}

			setLoading(false);
		})();
	}, [user]);

	// Filter products based on search query
	const filteredProducts = products.filter((product) =>
		[product.name, product.system_code, product.barcode].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Sort filtered products based on the selected criteria and order
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

	// Function to toggle sorting order based on the selected column
	const toggleSort = (column: 'name' | 'weight' | 'product_type') => {
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
				<Header text='Products' />
				<Description text='Explore a comprehensive overview of our products, including features, specifications, and benefits to help you make informed decisions.' />
			</HeaderContainer>

			<Input
				placeholder='Search products by Name, System Code, or Barcode...'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className='mb-4 w-full'
			/>

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
					{sortedProducts.length ? (
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
					)}
				</TableBody>
			</Table>
		</div>
	);
}
