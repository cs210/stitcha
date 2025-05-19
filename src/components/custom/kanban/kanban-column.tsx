import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/schemas/global.types';
import { Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { P } from '../text/text';
import { KanbanProductCard } from './kanban-product-card';

export function KanbanColumn({
	id,
	title,
	badgeColor,
	products,
	onDelete,
}: {
	id: string;
	title: string;
	badgeColor: string;
	products: Product[];
	onDelete: (productId: string) => void;
}) {
	return (
		<div className='flex flex-col w-full min-w-sm max-w-md'>
			<div className='flex items-center gap-2 mb-4'>
				<Badge className={`text-sm px-4 py-1 ${badgeColor} hover:${badgeColor}`}>{title}</Badge>
				<P color='light-gray' className='text-sm'>({products.length})</P>
			</div>

			<Droppable droppableId={id}>
				{(provided: DroppableProvided) => (
					<div {...provided.droppableProps} ref={provided.innerRef} className='flex-1 space-y-2 overflow-y-auto'>
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
