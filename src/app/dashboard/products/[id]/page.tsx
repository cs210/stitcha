'use client';

import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { ProductsDetails } from '@/components/custom/products/products-details';
import { ProductsImages } from '@/components/custom/products/products-images';
import { ProductsProgress } from '@/components/custom/products/products-progress';
import { ProductsSeamstresses } from '@/components/custom/products/products-seamstresses';
import { H4 } from '@/components/custom/text/headings';
import { Product } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { use, useEffect, useState } from 'react';

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
	const { id: productId } = use(params);
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);
	const [product, setProduct] = useState<Product | null>(null);

	// Fetch initial product data
	useEffect(() => {
		if (!user) return;

		(async () => {
			// Get product details
			const productResponse = await fetch(`/api/products/${productId}`);
			const { data, error } = await productResponse.json();

			console.log(data);

			if (!error) {
				setProduct(data);
			} else {
				console.error('Error fetching product details:', error);
			}

			setLoading(false);
		})();
	}, [user, productId]);

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
				<Header text={`${product?.name}`} />
			</HeaderContainer>

			<div className='flex flex-col justify-center items-center gap-4'>
				<div className='w-[80%]'>
					<ProductsImages product={product} />
				</div>				
				<div className='w-full'>
					<ProductsSeamstresses product={product} />
				</div>
				<div className='w-full'>
					<ProductsDetails product={product} />
				</div>
				<div className='w-full'>
					<H4 text='Progress Updates' />
					<ProductsProgress product={product} />
				</div>
			</div>
		</>
	);
}
