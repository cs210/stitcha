import { Product } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';
import { H3 } from '../text/headings';

export function OrdersProduct({ product }: { product: Product }) {
	return (
		<div className='flex items-center gap-4'>
			{product.image_urls && product.image_urls.length > 0 && (
				<div className='w-24 h-24 rounded overflow-hidden'>
					<Image src={product.image_urls[0]} alt={product.name || 'Product image'} className='w-full h-full object-cover' width={100} height={100} />
				</div>
			)}
			<div>
				<Link href={`/dashboard/products/${product.id}`} className='hover:underline text-blue-600'>
					<H3 text={product.name} />
				</Link>
			</div>
		</div>
	);
}
