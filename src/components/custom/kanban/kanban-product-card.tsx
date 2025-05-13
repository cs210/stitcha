import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/schemas/global.types';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { H4 } from '../text/headings';
import { P } from '../text/text';

export function KanbanProductCard({ product, index, onDelete }: { product: Product; index: number; onDelete: (productId: string) => void }) {
	const router = useRouter();

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
					<div className='p-4 relative'>
						<H4 text='#ORD-1001' className='mb-3' />

						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<User className='h-4 w-4' />
								<div className='flex gap-2'>
									<P text='Client:' />
									<P text={product.name} />
								</div>
							</div>
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
