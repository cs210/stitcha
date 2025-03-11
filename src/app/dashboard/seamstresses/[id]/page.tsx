'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { LoaderContainer } from '@/components/custom/loader-container';
import { Product, User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: seamstressId } = use(params);
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);
	const [seamstress, setSeamstress] = useState<User | null>(null);
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		if (!user) return;

		(async () => {
			// Fetch seamstress data
			const seamstressResponse = await fetch(`/api/seamstresses/${seamstressId}`);
			const { data: seamstressData, error: seamstressError } = await seamstressResponse.json();

			if (!seamstressError) {
				setSeamstress(seamstressData);

				// Fetch products data
				const productsResponse = await fetch(`/api/seamstresses/${seamstressId}/products`);
				const { data: productsData, error: productsError } = await productsResponse.json();

				if (!productsError) {
					setProducts(productsData);
				}
			}

			setLoading(false);
		})();
	}, [user, seamstressId]);

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
				<Header text={`${seamstress?.first_name} ${seamstress?.last_name}`} />
				<Description text={`${seamstress?.location}`} />
			</HeaderContainer>

			<div className='py-4'>
				<div className='flex flex-wrap gap-6'>
					{seamstress && (
						<div className='flex gap-8'>
							<div className='w-48 h-48 rounded-lg overflow-hidden'>
								<Image
									src={seamstress.image_url || ''}
									alt={`${seamstress.first_name} ${seamstress.last_name}`}
									className='w-full h-full object-cover'
									width={200}
									height={200}
								/>
							</div>
							<div className='space-y-6'>
								<div className='space-y-4'>
									<div className='flex items-center gap-3 text-gray-700'>
										<Phone className='w-5 h-5' />
										<span>{seamstress.phone_number}</span>
									</div>
									<div className='flex items-center gap-3 text-gray-700'>
										<Mail className='w-5 h-5' />
										<span>{seamstress.email}</span>
									</div>
								</div>
							</div>
						</div>
					)}
					{products && products.length > 0 && (
						<div className='w-full mt-8'>
							<h3 className='text-xl font-semibold mb-4'>Assigned Products</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{products.map((product) => (
									<div key={product.id} className='bg-white rounded-lg p-6 border hover:border-gray-300 transition-colors'>
										<div className='w-full h-48 rounded-lg overflow-hidden mb-4'>
											<Image src={product.image_urls[0] || ''} alt={product.name} className='w-full h-full object-cover' width={100} height={100} />
										</div>
										<Link href={`/dashboard/products/${product.id}`}>
											<h4 className='text-lg font-semibold mb-2 hover:text-blue-600'>{product.name}</h4>
										</Link>
										<p className='text-gray-600 mb-3'>{product.description}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
