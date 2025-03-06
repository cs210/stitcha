import { Product } from '@/lib/schemas/global.types';
import { Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { ProductCard } from './product-card';

interface KanbanColumnProps {
	title: string;
	id: string;
	products: Product[];
	onDelete: (productId: string) => void;
}

export function KanbanColumn({ title, id, products, onDelete }: KanbanColumnProps) {
	return (
		<div className='flex flex-col w-full h-full bg-gray-50 p-4 rounded-md'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-semibold'>{title}</h2>
			</div>
			<Droppable droppableId={id}>
				{(provided: DroppableProvided) => (
					<div {...provided.droppableProps} ref={provided.innerRef} className='flex-1 space-y-4'>
						{products.map((product, index) => (
							<ProductCard key={product.id} product={product} index={index} onDelete={onDelete} />
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	);
}
