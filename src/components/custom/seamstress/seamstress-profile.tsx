import { User } from '@/lib/schemas/global.types';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { P } from '../text/text';

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
					<div className='flex items-center gap-3'>
						<Phone className='w-5 h-5' />
						<P text={seamstress.phone_number ? `(${seamstress.phone_number.toString().slice(0,3)}) ${seamstress.phone_number.toString().slice(3,6)}-${seamstress.phone_number.toString().slice(6)}` : ''} />
					</div>
					<div className='flex items-center gap-3'>
						<Mail className='w-5 h-5' />
						<P text={seamstress.email || ''} />
					</div>
				</div>
			</div>
		</div>
	);
}
