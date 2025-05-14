import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/schemas/global.types';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { H4 } from '../text/headings';
import { P } from '../text/text';

export function KanbanProductCard({ product, index, onDelete }: { product: Product; index: number; onDelete: (productId: string) => void }) {
	const router = useRouter();

	console.log();

	return (
		<Draggable draggableId={product.id} index={index}>
			{(provided, snapshot) => (
				<Card
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className={`border rounded-none w-full cursor-pointer hover:border-black/20 transition-colors ${
						snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg' : ''
					}`}
					onClick={() => router.push(`/dashboard/products/${product.id}`)}
				>
					<div className='flex flex-row gap-4 p-4 relative'>
						{product?.image_urls?.length > 0 && (
							<Image src={`${product.image_urls[0]}`} alt={product.name} className='w-48 h-48' width={48} height={48} />
						)}

						<div className='flex flex-col gap-2'>
							<H4 text={product.name} />
							<P text={`${product.system_code}`} />
						</div>

						<Button
							size='sm'
							variant='ghost'
							className='absolute top-3 right-3 text-gray-400 hover:text-red-600 h-7 w-7 bg-white/80 backdrop-blur-sm'
							onClick={(e) => {
								e.stopPropagation();
								onDelete(product.id);
							}}
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</Card>
			)}
		</Draggable>
	);
}
