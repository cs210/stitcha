'use client';

import { LangContext } from '@/app/layout';
import { Container } from '@/components/custom/container/container';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { SeamstressCard } from '@/components/custom/seamstress/seamstress-card';
import { User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { useContext, useEffect, useState } from 'react';
import { getDictionary } from '../../locales';

export default function Page() {
	const { user } = useUser();
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();

	const [loading, setLoading] = useState<boolean>(true);
	const [seamstresses, setSeamstresses] = useState<User[]>([]);

	useEffect(() => {
		if (!user) return;

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
	}, [user, lang]);

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
				<Header text={dict.seamstresses.title} />
				<Description text={dict.seamstresses.description} />
			</HeaderContainer>

			<Container>
				<div className='grid grid-cols-4 gap-6'>
					{seamstresses.map((seamstress: User) => (
						<SeamstressCard key={seamstress.id} seamstress={seamstress} />
					))}
				</div>
			</Container>
		</>
	);
}
