import { Card } from '@/components/ui/card';
import { Product, Progress } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';
import { H4 } from '../text/headings';
import { P } from '../text/text';

// Product card for the individual seamstress page
export function SeamstressProductCard({ dict, product }: { dict: any, product: Product }) {
	return (
		<Card className='flex flex-col gap-4 p-4'>
			<div className='flex flex-row gap-2'>
				<Image src={product.image_urls[0]} alt={product.name} className='w-48 h-48' width={48} height={48} />

				<div className='flex flex-col gap-2'>
					<Link href={`/dashboard/products/${product.id}`}>
						<H4>{product.name}</H4>
					</Link>
					<P><strong>{dict.adminsSection.product.systemCode}:</strong> {product.system_code}</P>
					<P><strong>{dict.adminsSection.product.validated}:</strong> {product.validated ? 'Yes' : 'No'}</P>
					<P><strong>{dict.adminsSection.product.unitsAssigned}:</strong> {product.units_assigned}</P>
					<P><strong>{dict.adminsSection.product.unitsCompleted}:</strong> {product.units_completed}</P>
				</div>
			</div>

			<div className='flex flex-col gap-2'>
				<H4>{dict.seamstress.productCard.progressUpdates}</H4>
				
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
					<P>{dict.adminsSection.seamstresses.productCard.noProgressUpdates}</P>
				)}
			</div>
		</Card>
	);
}
