'use client';

import { Container } from '@/components/custom/container/container';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { SeamstressCard } from '@/components/custom/seamstress/seamstress-card';
import { User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function Page() {
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);
	const [seamstresses, setSeamstresses] = useState<User[]>([]);

	useEffect(() => {
		if (!user) return;

		(async () => {
			// Get all seamstresses
			const response = await fetch('/api/seamstresses');
			const { data, error } = await response.json();

			if (!error) {
				setSeamstresses(data);
			}

			setLoading(false);
		})();
	}, [user]);

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
				<Header text='Seamstresses' />
				<Description text='View and manage all seamstresses' />
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
