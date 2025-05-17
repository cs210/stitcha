import { Product, Progress } from '@/lib/schemas/global.types';
import { P } from '../text/text';

export function ProductsProgress({ dict, product }: { dict: any, product: Product }) {
	return (
		<div className='mb-4'>
			{product.progress && product.progress.length > 0 ? (
				<div className='flex flex-row gap-4'>
					{product.progress.map((progress: Progress, index: number) => (
						<div key={index}>
							<P>{new Date(progress.created_at).toLocaleDateString()}</P>
							<P>{progress.description}</P>
							<P>{progress.emotion}</P>
						</div>
					))}
				</div>
			) : (
				<P>No progress updates yet</P>
			)}
		</div>
	);
}
