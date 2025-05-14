import { Product } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';

export function ProductsActivityTimelineItem({ update }: { update: Product }) {
	return (
		<div key={update.id} className='relative pl-8'>
			<div className={`absolute left-0 top-[6px] w-4 h-4 rounded-full ${update.status === 'progress' ? 'bg-blue-500' : 'bg-black'}`} />
			<div>
				<h3 className='text-lg font-medium'>
					{update.status === 'created'
						? 'Product Created'
						: update.status === 'assigned'
						? 'Seamstress Assigned'
						: update.status === 'progress'
						? `Progress Update`
						: 'Status Update'}
				</h3>
				<p className='text-gray-500 mt-1'>{update.description}</p>
				{update.user && (
					<p className='text-gray-500 mt-1'>
						Seamstress:{' '}
						<Link href={`/dashboard/seamstresses/${update.user_id}`} className='hover:underline'>
							{update.user.first_name} {update.user.last_name}
						</Link>{' '}
						is feeling {update.emotion}
					</p>
				)}
				<p className='text-gray-500 mt-1'>
					{new Date(update.created_at)
						.toLocaleString('en-US', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit',
							hour12: false,
						})
						.replace(',', '')}
				</p>
				{update.image_urls && update.image_urls.length > 0 && (
					<div className='flex gap-2 mt-2'>
						{update.image_urls.map((url, idx) => (
							<div key={idx} className='w-24 h-24 rounded overflow-hidden'>
								<Image src={url} alt={`Progress update image ${idx + 1}`} width={96} height={96} className='w-full h-full object-cover' />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
