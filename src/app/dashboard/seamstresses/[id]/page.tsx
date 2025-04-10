'use client';

import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { SeamstressProductCard } from '@/components/custom/seamstress/seamstress-product-card';
import { SeamstressProfile } from '@/components/custom/seamstress/seamstress-profile';
import { Product, User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
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
			// TODO: Consolidate this into a single API call

			// Get seamstress details
			const seamstressResponse = await fetch(`/api/seamstresses/${seamstressId}`);
			const { data: seamstressData, error: seamstressError } = await seamstressResponse.json();

			if (!seamstressError) {
				setSeamstress(seamstressData);

				// Get products assigned to seamstress
				const productsResponse = await fetch(`/api/seamstresses/${seamstressId}/products`);
				const { data: productsData, error: productsError } = await productsResponse.json();

				if (!productsError) {
					setProducts(productsData);
				}
			}

			setLoading(false);
		})();
	}, [user, seamstressId]);

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
					{seamstress && <SeamstressProfile seamstress={seamstress} />}
					{products && products.length > 0 && (
						<div className='w-full mt-8'>
							<h3 className='text-xl font-semibold mb-4'>Assigned Products</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{products.map((product) => (
									<SeamstressProductCard key={product.id} product={product} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
