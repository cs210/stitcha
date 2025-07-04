'use client';

import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/schemas/global.types';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { KanbanColumn } from './kanban-column';

const STATUS_MAPPING = {
	notStarted: 'Not Started',
	inProgress: 'In Progress',
	done: 'Done',
} as const;

const REVERSE_STATUS_MAPPING = {
	'Not Started': 'notStarted',
	'In Progress': 'inProgress',
	'Done': 'done',
} as const;

export function KanbanBoard({ dict }: { dict: any }) {
	const { toast } = useToast();

	const [products, setProducts] = useState<Record<string, Product[]>>({
		notStarted: [],
		inProgress: [],
		done: [],
	});

	// Pull in initial products and organise them by progress_level
	useEffect(() => {
		(async () => {
			try {
				const response = await fetch('/api/products');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				const getColumnId = (progress_level: string) => {
					return REVERSE_STATUS_MAPPING[progress_level as keyof typeof REVERSE_STATUS_MAPPING] || 'notStarted';
				};

				const organized = result.data.reduce(
					(acc: Record<string, Product[]>, product: Product) => {
						const columnId = getColumnId(product.progress_level || 'notStarted');

						return {
							...acc,
							[columnId]: [...(acc[columnId] || []), product],
						};
					},
					{
						notStarted: [],
						inProgress: [],
						done: [],
					}
				);

				setProducts(organized);
			} catch (error) {
				// toast({
				// 	title: dict.kanban.notifications.productsLoading.error.title,
				// 	description: dict.settings.notifications.productsLoading.error.description,
				// 	variant: 'destructive',
				// });
			}
		})();
	}, []);

	// Handle what happens when we drag element / card to new columnn
	const onDragEnd = async (result: DropResult) => {
		const { source, destination, draggableId } = result;

		if (!destination) return;

		const newProducts = { ...products };
		const sourceColumn = [...newProducts[source.droppableId]];
		const destColumn = source.droppableId === destination.droppableId ? sourceColumn : [...newProducts[destination.droppableId]];

		const [removed] = sourceColumn.splice(source.index, 1);

		if (source.droppableId === destination.droppableId) {
			sourceColumn.splice(destination.index, 0, removed);
		} else {
			destColumn.splice(destination.index, 0, removed);
		}

		const updated = {
			...newProducts,
			[source.droppableId]: sourceColumn,
		};

		if (source.droppableId !== destination.droppableId) {
			updated[destination.droppableId] = destColumn;
		}

		setProducts(updated);

		// Only make API call if moving between columns
		if (source.droppableId !== destination.droppableId) {
			try {
				const newStatus = STATUS_MAPPING[destination.droppableId as keyof typeof STATUS_MAPPING];
				const response = await fetch(`/api/products/${draggableId}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						progress_level: newStatus,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to update product status');
				}

				// toast({
				// 	title: dict.kanban.notifications.productStatusUpdated.success.title,
				// 	description: dict.kanban.notifications.productStatusUpdated.success.description.replace('{{status}}', `"${newStatus}"`),
				// });
			} catch (error) {
				// toast({
				// 	title: dict.kanban.notifications.productStatusUpdated.error.title,
				// 	description: dict.kanban.notifications.productStatusUpdated.error.description,
				// 	variant: 'destructive',
				// });
			}
		}
	};

	// Handle deleting a product from the Kanban board
	const onDelete = async (productId: string) => {
		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete product');
			}
			const newProducts = { ...products };

			Object.keys(newProducts).forEach((key) => {
				newProducts[key] = newProducts[key].filter((product: Product) => product.id !== productId);
			});

			setProducts(newProducts);

			// toast({
			// 	title: dict.kanban.notifications.productDeleted.success.title,
			// 	description: dict.kanban.notifications.productDeleted.success.description,
			// });
		} catch (error) {			
			// toast({
			// 	title: dict.kanban.notifications.productDeleted.error.title,
			// 	description: dict.kanban.notifications.productDeleted.error.description,
			// 	variant: 'destructive',
			// });
		}
	};

	return (
		<div className='flex flex-col h-full'>
			<DragDropContext onDragEnd={onDragEnd}>
				<div className='flex-1 overflow-x-auto'>
					<div className='flex gap-4 h-full'>
						<KanbanColumn id='notStarted' title={dict.adminsSection.kanban.columns.notStarted} badgeColor='bg-red-500' products={products.notStarted} onDelete={onDelete} />
						<KanbanColumn
							id='inProgress'
							title={dict.adminsSection.kanban.columns.inProgress}
							badgeColor='bg-yellow-400'
							products={products.inProgress}
							onDelete={onDelete}
						/>
						<KanbanColumn
							id='done'
							title={dict.adminsSection.kanban.columns.done}
							badgeColor='bg-green-500'
							products={products.done}
							onDelete={onDelete}
						/>
					</div>
				</div>
			</DragDropContext>
		</div>
	);
}
