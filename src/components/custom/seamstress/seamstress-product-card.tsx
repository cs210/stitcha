import { Card } from '@/components/ui/card';
import { Product, Progress } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';
import { H4 } from '../text/headings';
import { P } from '../text/text';

export function SeamstressProductCard({ product }: { product: Product }) {
	return (
		<Card className='flex flex-col gap-4 p-4'>
			<div className='flex flex-row gap-2'>
				<Image src={product.image_urls[0]} alt={product.name} className='w-48 h-48' width={48} height={48} />

				<div className='flex flex-col gap-2'>
					<Link href={`/dashboard/products/${product.id}`}>
						<H4>{product.name}</H4>
					</Link>
					<P><strong>System Code:</strong> {product.system_code}</P>
					<P><strong>Validated:</strong> {product.validated ? 'Yes' : 'No'}</P>
					<P><strong>Units Completed:</strong> {product.units_completed}</P>
				</div>
			</div>

			<div className='flex flex-col gap-2'>
				<H4>Progress Updates</H4>
				
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
		</Card>
	);
}
