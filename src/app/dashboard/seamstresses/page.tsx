'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { LoaderContainer } from '@/components/custom/containers/loader-container';
import { Loader } from '@/components/custom/loader/loader';
import { SeamstressCard } from '@/components/custom/seamstress/seamstress-card';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { LangContext } from '@/lib/lang/LangContext';
import { User } from '@/lib/schemas/global.types';
import { useContext, useEffect, useState } from 'react';
import { getDictionary } from '../../../lib/lang/locales';

export default function Page() {
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	
	const [seamstresses, setSeamstresses] = useState<User[]>([]);

	useEffect(() => {
		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);

			const response = await fetch('/api/seamstresses');
			const { data, error } = await response.json();

			if (!error) {
				setSeamstresses(data);
			}

			setLoading(false);
		})();
	}, [lang]);

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
				<H2>{dict.seamstresses.title}</H2>
				<P className='mt-2'>{dict.seamstresses.description}</P>
			</HeaderContainer>

			<Container>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
					{seamstresses.map((seamstress: User) => (
						<SeamstressCard key={seamstress.id} seamstress={seamstress} />
					))}
				</div>
			</Container>
		</>
	);
}
