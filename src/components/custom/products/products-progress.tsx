import { Product } from '@/lib/schemas/global.types';
import { P } from '../text/text';

export function ProductsProgress({ product }: { product: Product }) {
	return (
		<div>			
			{product.progress && product.progress.length > 0 ? (
				<div className='flex flex-row gap-4'>
					{product.progress.map((progressItem, index) => (
						<div key={index}>
							<P text={`${new Date(progressItem.created_at).toLocaleDateString()}`} />
							<P text={`${progressItem.description}`} />
							<P text={`${progressItem.emotion}`} />
						</div>
					))}
				</div>
			) : (
				<P text='No progress updates yet' />
			)}
		</div>
	);
}
