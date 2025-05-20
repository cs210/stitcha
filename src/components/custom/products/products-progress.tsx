import { Card } from '@/components/ui/card';
import { Product, Progress } from '@/lib/schemas/global.types';
import { P } from '../text/text';

export function ProductsProgress({ dict, product }: { dict: any, product: Product }) {
	return (
		<div className='mb-4'>
			{product.progress && product.progress.length > 0 ? (
				<div className='flex flex-row gap-4'>
					{product.progress.map((progress: Progress, index: number) => (
						<Card key={index} className='p-4'>
							<P>{new Date(progress.created_at).toLocaleDateString()}</P>
							<P>{progress.description}</P>
							<P>{progress.emotion}</P>
						</Card>
					))}
				</div>
			) : (
				<P>{dict.product.progress.noProgressUpdatesYet}</P>
			)}
		</div>
	);
}
