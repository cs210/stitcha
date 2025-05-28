import { cn } from '@/lib/utils/utils';

// Page loading element
export function Loader() {
	return (
		<div className='flex justify-center items-center h-full'>
			<div className='flex items-center justify-center h-screen'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className={cn('animate-spin')}
				>
					<path d='M21 12a9 9 0 1 1-6.219-8.56' />
				</svg>
			</div>			
		</div>
	);
}
