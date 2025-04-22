'use client';

import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function Page() {
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!user) return;

		setLoading(false);
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
				<Header text='Settings' />
				<Description text='Manage your account settings and preferences' />
			</HeaderContainer>

			<div className='py-4'>
				<div className='space-y-8 w-full'>
					<div className='grid grid-cols-2 gap-6'>
						<div className='space-y-2'>
								<Label>Full Name</Label>
								<Input value={user?.fullName || ''} disabled />
							</div>
							<div className='space-y-2'>
								<Label>Email</Label>
								<Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled />
							</div>
							<div className='space-y-2'>
								<Label>Language</Label>
								<Select defaultValue='pt'>
								<SelectTrigger>
									<SelectValue placeholder='Select language' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pt'>Português</SelectItem>
									<SelectItem value='en'>English</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Button>Save Changes</Button>
				</div>
			</div>
		</>
	);
}
