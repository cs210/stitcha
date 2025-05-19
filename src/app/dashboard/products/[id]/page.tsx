'use client';

import { LangContext } from '@/app/layout';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { ProductsDetails } from '@/components/custom/products/products-details';
import { ProductsImages } from '@/components/custom/products/products-images';
import { ProductsProgress } from '@/components/custom/products/products-progress';
import { ProductsSeamstresses } from '@/components/custom/products/products-seamstresses';
import { H2, H4 } from '@/components/custom/text/headings';
import { Product } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { use, useContext, useEffect, useState } from 'react';
import { getDictionary } from '../../../locales';

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
	const { id: productId } = use(params);
	const { user } = useUser();
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();

	const [loading, setLoading] = useState<boolean>(true);
	const [product, setProduct] = useState<Product | null>(null);

	useEffect(() => {
		if (!user) return;

		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);

			const productResponse = await fetch(`/api/products/${productId}`);
			const { data, error } = await productResponse.json();

			if (!error) {
				setProduct(data);
			} else {
				console.error('Error fetching product details:', error);
			}

			setLoading(false);
		})();
	}, [user, productId, lang]);

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
				<H2>{product?.name}</H2>
			</HeaderContainer>

			<div className='flex flex-col justify-center items-center gap-4 mt-4'>
				<div className='w-[80%]'>
					<ProductsImages dict={dict} product={product} />
				</div>				
				<div className='w-full'>
					<H4 className='mb-4'>{dict.product.assignedSeamstresses}</H4>
					<ProductsSeamstresses dict={dict} product={product} />
				</div>
				<div className='w-full'>
					<H4 className='mb-4'>{dict.product.productDetails}</H4>
					<ProductsDetails dict={dict} product={product} />
				</div>
				<div className='w-full'>
					<H4 className='mb-4'>{dict.product.progressUpdates}</H4>
					<ProductsProgress dict={dict} product={product} />
				</div>
			</div>
		</>
	);
}
