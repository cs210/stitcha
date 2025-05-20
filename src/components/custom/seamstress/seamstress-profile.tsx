import { User } from '@/lib/schemas/global.types';
import { Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { P } from '../text/text';

export function SeamstressProfile({ seamstress }: { seamstress: User }) {
	return (
		<div className='flex gap-8'>
			<div className='w-48 h-48 rounded-lg overflow-hidden'>
				<Image
					src={seamstress.image_url || '/images/placeholder-image.jpg'}
					alt={`${seamstress.first_name} ${seamstress.last_name}`}
					className='w-full h-full object-cover'
					width={200}
					height={200}
				/>
			</div>
			<div className='space-y-6'>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<MapPin className='w-5 h-5' />
						<P>{seamstress.location || ''}</P>
					</div>
					<div className='flex items-center gap-3'>
						<Phone className='w-5 h-5' />
						<P>{seamstress.phone_number ? `+${seamstress.phone_number.toString().slice(1,2)} (${seamstress.phone_number.toString().slice(2,5)}) ${seamstress.phone_number.toString().slice(5,8)}-${seamstress.phone_number.toString().slice(8)}` : ''}</P>
					</div>
					<div className='flex items-center gap-3'>
						<Mail className='w-5 h-5' />
						<P>{seamstress.email || ''}</P>
					</div>
				</div>
			</div>
		</div>
	);
}
