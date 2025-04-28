import { Product } from '@/lib/schemas/global.types';
import Image from 'next/image';
import Link from 'next/link';

export function SeamstressProductCard({ product }: { product: Product }) {
	return (
		<div className='bg-white rounded-lg p-6 border hover:border-gray-300 transition-colors'>
			<div className='w-full h-48 rounded-lg overflow-hidden mb-4'>
				<Image src={`${product.image_urls[0]}`} alt={product.name} className='w-full h-full object-cover' width={100} height={100} />
			</div>
			<Link href={`/dashboard/products/${product.id}`}>
				<h4 className='text-lg font-semibold mb-2 hover:text-blue-600'>{product.name}</h4>
			</Link>
			<p className='text-gray-600 mb-3'>{product.description}</p>
		</div>
	);
}
