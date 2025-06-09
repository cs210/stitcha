import { Product, Progress } from '@/lib/schemas/global.types';
import { P } from '../text/text';
import { ProductsProgressCard } from './products-progress-card';

// The progress section for each individual product
export function ProductsProgress({ dict, product }: { dict: any, product: Product }) {
	return (
		<div className='mb-4'>
			{product.progress && product.progress.length > 0 ? (
				<div className='flex flex-row gap-4'>
					{product.progress.map((progress: Progress, index: number) => (
						<ProductsProgressCard key={index} dict={dict} progress={progress} />
					))}
				</div>
			) : (
				<P>{dict.adminsSection.products.product.progress.noProgressUpdates}</P>
			)}
		</div>
	);
}
