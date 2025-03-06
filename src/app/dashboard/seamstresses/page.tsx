'use client';

import { User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { Loader, Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Page() {
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(false);
	const [seamstresses, setSeamstresses] = useState<User[]>([]);

	useEffect(() => {
		if (!user) return;

		// Anonymous function to fetch seamstresses from Supabase
		(async () => {
			setLoading(true);

			const response = await fetch('/api/users');
			const { data, error } = await response.json();

			if (!error) {
				setSeamstresses(data);
			}

			setLoading(false);
		})();
	}, [user]);

	// Loading state
	if (loading) return <Loader />;

	return (
		<div className='flex h-screen'>
			<div className='flex-1 overflow-auto'>
				<main className='p-6'>
					<div className='max-w-7xl mx-auto'>
						<h1 className='text-2xl font-bold mb-8'>Seamstresses</h1>
						<div className='flex flex-wrap gap-6'>
							{seamstresses.map((seamstress: User) => (
								<div key={seamstress.id} className='bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow w-[300px]'>
									<div className='flex flex-col items-center text-center mb-6'>
										<div className='w-32 h-32 rounded-full overflow-hidden mb-4'>
											<Image
												src={seamstress.image_url || '/placeholder.svg'}
												alt={`${seamstress.first_name} ${seamstress.last_name}`}
												className='w-full h-full object-cover'
												width={100}
												height={100}
											/>
										</div>
										<h3 className='text-xl font-semibold mb-1'>
											{seamstress.first_name} {seamstress.last_name}
										</h3>
										<p className='text-gray-500 mb-4'>{seamstress.location}</p>
										<div className='space-y-3 w-full text-left'>
											<div className='flex items-center gap-2 text-gray-600'>
												<Phone className='w-4 h-4' />
												<span className='text-sm'>Tel: {seamstress.phone_number}</span>
											</div>
											<div className='flex items-center gap-2 text-gray-600'>
												<Mail className='w-4 h-4' />
												<span className='text-sm'>Email: {seamstress.email}</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
