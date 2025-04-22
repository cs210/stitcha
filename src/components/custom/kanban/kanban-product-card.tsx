import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/schemas/global.types';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function KanbanProductCard({ product, index, onDelete }: { product: Product; index: number; onDelete: (productId: string) => void }) {
	const router = useRouter();

	return (
		<Draggable draggableId={product.id} index={index}>
			{(provided) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className='bg-white rounded-lg shadow px-5 py-3 relative group min-w-[380px] cursor-pointer'
					onClick={() => router.push(`/dashboard/products/${product.id}`)}
				>
					<div className='absolute top-3 right-5 flex gap-2 z-10'>
						<Button
							size='sm'
							variant='ghost'
							className='text-gray-400 hover:text-red-600 h-7 w-7 bg-white/80 backdrop-blur-sm'
							onClick={(e) => {
								e.stopPropagation();

								onDelete(product.id);
							}}
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>

					<div className='flex gap-4 pt-8'>
						<div className='flex-1'>
							<h3 className='font-medium line-clamp-1 pr-12'>{product.name}</h3>
							<div className='flex items-center gap-2 mt-1'>
								<Badge variant='secondary' className='bg-orange-100 text-orange-600'>
									{product.product_type}
								</Badge>
								{product.system_code && (
									<Badge variant='outline' className='text-gray-600'>
										{product.system_code}
									</Badge>
								)}
							</div>
						</div>

						<div className='relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0'>
							<Image
								src={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder-image.jpg'}
								alt={product.name}
								fill
								className='object-cover'
								sizes='(max-width: 768px) 96px, 96px'
								priority={index < 2}
								quality={75}
							/>
						</div>
					</div>
				</div>
			)}
		</Draggable>
	);
}
