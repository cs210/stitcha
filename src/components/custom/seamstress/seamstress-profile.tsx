import { User } from '@/lib/schemas/global.types';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export function SeamstressProfile({ seamstress }: { seamstress: User }) {
	return (
		<div className='flex gap-8'>
			<div className='w-48 h-48 rounded-lg overflow-hidden'>
				<Image
					src={seamstress.image_url || ''}
					alt={`${seamstress.first_name} ${seamstress.last_name}`}
					className='w-full h-full object-cover'
					width={200}
					height={200}
				/>
			</div>
			<div className='space-y-6'>
				<div className='space-y-4'>
					<div className='flex items-center gap-3 text-gray-700'>
						<Phone className='w-5 h-5' />
						<span>{seamstress.phone_number}</span>
					</div>
					<div className='flex items-center gap-3 text-gray-700'>
						<Mail className='w-5 h-5' />
						<span>{seamstress.email}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
