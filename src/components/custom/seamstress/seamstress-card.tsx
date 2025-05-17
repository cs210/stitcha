import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/schemas/global.types';
import Link from 'next/link';
import { H4 } from '../text/headings';
import { P } from '../text/text';

export function SeamstressCard({ seamstress }: { seamstress: User }) {
	return (
		<div className='p-4'>
			<div className='flex flex-col items-center text-center'>
				<Link href={`/dashboard/seamstresses/${seamstress.id}`}>
					<Avatar className='w-32 h-32 mb-4'>
						<AvatarImage src={seamstress.image_url || ''} alt={`${seamstress.first_name} ${seamstress.last_name}`} />
						<AvatarFallback>
							{seamstress.first_name[0]}
							{seamstress.last_name[0]}
						</AvatarFallback>
					</Avatar>
				</Link>
				<Link href={`/dashboard/seamstresses/${seamstress.id}`} className='mb-1'>
					<H4>{seamstress.first_name} {seamstress.last_name}</H4>
				</Link>
				<P color='dark-gray'>{seamstress.location}</P>
			</div>
		</div>
	);
}
