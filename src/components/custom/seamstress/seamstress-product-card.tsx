import { Card } from '@/components/ui/card';
import { Product } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';
import { H4 } from '../text/headings';
import { P } from '../text/text';

export function SeamstressProductCard({ product }: { product: Product }) {
	console.log(product.progress);

	return (
		<Card className='flex flex-col gap-4 p-4'>
			<div className='flex flex-row gap-2'>
				<Image src={`${product.image_urls[0]}`} alt={product.name} className='w-48 h-48' width={48} height={48} />

				<div className='flex flex-col gap-2'>
					<Link href={`/dashboard/products/${product.id}`}>
						<H4 text={product.name} />
					</Link>
					<P text={`${product.system_code}`} />
					<P text={`Validated: ${product.validated ? 'Yes' : 'No'}`} />
					<P text={`Units Completed: ${product.units_completed}`} />
				</div>
			</div>

			<div className='flex flex-col gap-2'>
				<H4 text='Progress Updates' />
				
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
		</Card>
	);
}
