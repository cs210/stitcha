import { User } from '@/lib/schemas/global.types';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function SeamstressCard({ seamstress }: { seamstress: User }) {
	const router = useRouter();

	return (
		<div
			className='bg-white rounded-2xl p-8 border hover:border-gray-300 transition-colors w-[300px] cursor-pointer hover:shadow-md'
			onClick={() => router.push(`/dashboard/seamstresses/${seamstress.id}`)}
		>
			<div className='flex flex-col items-center text-center mb-6'>
				<div className='w-32 h-32 rounded-full overflow-hidden mb-4'>
					<Image
						src={`${seamstress.image_url}`}
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
	);
}
