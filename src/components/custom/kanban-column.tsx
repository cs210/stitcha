import { Droppable } from '@hello-pangea/dnd';
import { ProductCard } from './product-card';

interface KanbanColumnProps {
	title: string;
	id: string;
	products: any[];
	seamstresses: any[];
	onAssign: (productId: string, seamstress: any) => void;
	onDelete: (productId: string) => void;
}

export function KanbanColumn({ title, id, products, seamstresses, onAssign, onDelete }: KanbanColumnProps) {
	return (
		<div className='flex flex-col min-w-[350px] max-w-[350px] h-full'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-semibold'>{title}</h2>
			</div>
			<Droppable droppableId={id}>
				{(provided) => (
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
