import { Product } from '@/lib/schemas/global.types';
import { Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { H3 } from '../text/headings';
import { KanbanProductCard } from './kanban-product-card';

export function KanbanColumn({ title, id, products, onDelete }: { title: string; id: string; products: Product[]; onDelete: (productId: string) => void }) {
	return (
		<div className='flex flex-col w-full h-full'>
			<div className='flex items-center justify-between mb-6'>
				<H3 text={title} />
			</div>
				<Droppable droppableId={id}>
					{(provided: DroppableProvided) => (
						<div {...provided.droppableProps} ref={provided.innerRef} className='flex-1 space-y-4'>
							{products.map((product, index) => (
								<KanbanProductCard key={product.id} product={product} index={index} onDelete={onDelete} />
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>			
		</div>
	);
}
