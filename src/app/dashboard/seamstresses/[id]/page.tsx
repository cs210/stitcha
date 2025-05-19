'use client';

import { LangContext } from '@/app/layout';
import { getDictionary } from '@/app/locales';
import { Container } from '@/components/custom/container/container';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { SeamstressProductCard } from '@/components/custom/seamstress/seamstress-product-card';
import { SeamstressProfile } from '@/components/custom/seamstress/seamstress-profile';
import { H2, H3 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { Progress } from '@/components/ui/progress';
import { Product, User } from '@/lib/schemas/global.types';
import { use, useContext, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: seamstressId } = use(params);
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();

	const [loading, setLoading] = useState<boolean>(true);
	const [seamstress, setSeamstress] = useState<User | null>(null);

	useEffect(() => {
		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);
			
			// Get seamstress details
			const seamstressResponse = await fetch(`/api/seamstresses/${seamstressId}`);
			const { data, error } = await seamstressResponse.json();					

			if (!error) {
				setSeamstress(data);
			} else {
				console.error('Error fetching seamstress details:', error);
			}

			setLoading(false);
		})();
	}, [seamstressId, lang]);

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
				<H2>{seamstress?.first_name} {seamstress?.last_name}</H2>
			</HeaderContainer>

			<Container>
				<div className='flex flex-col gap-4'>
					<div className='flex flex-wrap gap-6'>{seamstress && <SeamstressProfile seamstress={seamstress} />}</div>

					{seamstress?.products.length > 0 && (
						<>
							<H3>{dict.seamstress.overallProgress}</H3>
							<div className='flex flex-row items-center gap-2'>
								<Progress value={(seamstress?.total_units_completed / seamstress?.total_units_assigned) * 100} className='w-[60%]' />
								<P>{`${seamstress?.total_units_completed} / ${seamstress?.total_units_assigned}`}</P>
							</div>

							<H3>{dict.seamstress.assignedProducts}</H3>
							<div className='flex flex-wrap gap-6'>
								{seamstress?.products.map((product: Product) => (
									<SeamstressProductCard key={product.id} dict={dict} product={product} />
								))}
							</div>
						</>
					)}
				</div>
			</Container>
		</>
	);
}
