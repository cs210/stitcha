import { User } from '@/lib/schemas/global.types';
import { X } from 'lucide-react';
import Image from 'next/image';

export function ProductsSeamstressAvatar({ user, handleDeleteAssignment }: { user: User; handleDeleteAssignment: (id: string) => void }) {
	return (
		<div key={user.id} className='group relative'>
			<div className='relative w-8 h-8 rounded-full overflow-hidden border-2 border-white'>
				<Image
					src={user.image_url || '/placeholder-avatar.jpg'}
					alt={`${user.first_name} ${user.last_name}`}
					className='w-full h-full object-cover'
					width={32}
					height={32}
				/>
			</div>
			<button
				onClick={() => handleDeleteAssignment(user.id)}
				className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
				title={`Remove ${user.first_name} ${user.last_name}`}
			>
				<X className='w-3 h-3' />
			</button>
		</div>
	);
}
