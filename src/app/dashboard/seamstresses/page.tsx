'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, PhoneIcon as WhatsappIcon } from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	// const [seamstresses, setSeamstresses] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'name' | 'weight' | 'product_type' | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	// useEffect(() => {
	// 	async function getSeamstresses() {
	// 		const response = await fetch('/api/users');
	// 		const data = await response.json();

	// 		setSeamstresses(data);
	// 	}

	// 	getSeamstresses();
	// }, []);

	return (
		<div className='flex h-screen bg-[#F8F7FD]'>
			{/* Main Content */}
			<div className='flex-1 overflow-auto'>
				{/* Header */}
				<header className='bg-white px-6 py-4 flex items-center justify-between border-b'>
					<div className='flex-1 max-w-xl'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
							<Input type='search' placeholder='Search...' className='w-full pl-10 bg-[#F8F7FD] border-none' />
						</div>
					</div>
					<div className='flex items-center gap-4'>
						<Button variant='ghost' size='icon' className='rounded-full'>
							<Bell className='w-5 h-5' />
						</Button>
						<Button variant='ghost' size='icon' className='rounded-full'>
							<WhatsappIcon className='w-5 h-5' />
						</Button>
					</div>
				</header>

				{/* Main Content Area */}
				<main className='p-6'>
					<div className='max-w-7xl mx-auto'>
						<h1 className='text-2xl font-bold mb-8'>Seamstresses</h1>
						<div className='flex flex-wrap gap-6'>
							{/* {seamstresses.map((seamstress) => (
								<div key={seamstress.id} className='bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow w-[300px]'>
									<div className='flex flex-col items-center text-center mb-6'>
										<div className='w-32 h-32 rounded-full overflow-hidden mb-4'>
											<img
												src={seamstress.image_url || '/placeholder.svg'}
												alt={`${seamstress.first_name} ${seamstress.last_name}`}
												className='w-full h-full object-cover'
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
							))} */}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
