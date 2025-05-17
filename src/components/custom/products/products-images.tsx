import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product } from '@/lib/schemas/global.types';
import Image from 'next/image';
import { P } from '../text/text';

export function ProductsImages({ product }: { product: Product }) {
	return (		
		<Carousel>
			<CarouselContent>
				{product.image_urls && product.image_urls.length > 0 ? (
					product.image_urls.map((imageUrl: string, index: number) => (
						<CarouselItem key={index}>
							<div className="w-full h-full flex items-center justify-center">
								<Image src={imageUrl} alt={`Product image ${index + 1}`} className="w-96 h-96 object-contain" width={96} height={96} />
							</div>
						</CarouselItem>
					))
				) : (
					<CarouselItem>
						<P>No images available</P>
					</CarouselItem>
				)}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
