'use client';

import { HeaderContainer } from '@/components/custom/containers/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { ProductsDetails } from '@/components/custom/products/products-details';
import { ProductsImages } from '@/components/custom/products/products-images';
import { ProductsProgress } from '@/components/custom/products/products-progress';
import { ProductsSeamstresses } from '@/components/custom/products/products-seamstresses';
import { H2, H4 } from '@/components/custom/text/headings';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { Product } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { use, useContext, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: productId } = use(params);	
	const { lang } = useContext(LangContext);
	const { user } = useUser();
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

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
				// toast({
				// 	title: dict.adminsSection.products.seamstress.seamstressRemoved,
				// 	description: dict.adminsSection.products.seamstresses.seamstressRemovedDescription,
				// 	variant: 'destructive',
				// });	
			}

			setLoading(false);
		})();
	}, [productId, lang, user]);

	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<H2>{product?.name}</H2>
			</HeaderContainer>

			<div className='flex flex-col justify-center items-center gap-4 mt-4'>
				<div className='w-[80%]'>
					<ProductsImages dict={dict} product={product} />
				</div>				
				{user?.organizationMemberships[0].role === 'org:admin' && (
					<div className='w-full'>
						<H4 className='mb-4'>{dict.adminsSection.products.product.assignedSeamstresses}</H4>
						<ProductsSeamstresses dict={dict} product={product} />
					</div>
				)}
				<div className='w-full'>
					<H4 className='mb-4'>{dict.adminsSection.products.product.productDetails}</H4>
					<ProductsDetails dict={dict} product={product} />
				</div>
				{user?.organizationMemberships[0].role === 'org:admin' && (
					<div className='w-full'>
						<H4 className='mb-4'>{dict.adminsSection.products.product.progressUpdates}</H4>
						<ProductsProgress dict={dict} product={product} />
					</div>
				)}
			</div>
		</>
	);
}
