'use client';

import { Container } from '@/components/custom/container/container';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { SeamstressProfile } from '@/components/custom/seamstress/seamstress-profile';
import { User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: seamstressId } = use(params);
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);
	const [seamstress, setSeamstress] = useState<User | null>(null);

	useEffect(() => {
		if (!user) return;

		(async () => {			
			// Get seamstress details			
			const seamstressResponse = await fetch(`/api/seamstresses/${seamstressId}`);
			const { data, error } = await seamstressResponse.json();

			if (!error) {
				setSeamstress(data);
			} else {
				console.error("Error fetching seamstress details:", error);
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

			<Container>
				<div className='flex flex-wrap gap-6'>
					{seamstress && <SeamstressProfile seamstress={seamstress} />}
				</div>
			</Container>
		</>
	);
}
