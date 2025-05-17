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
				console.error('Error fetching products:', error);
			}
		})();
	}, []);

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

				toast({
					title: 'Product status updated.',
					description: 'Product status updated successfully.',
				});
			} catch (error) {
				setProducts(newProducts);
				
				toast({
					title: 'Error updating product status.',
					description: 'Failed to update product status.',
				});
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

			toast({
				title: 'Product deleted.',
				description: 'Product deleted successfully.',
			});
		} catch (error) {
			toast({
				title: 'Error deleting product.',
				description: 'Failed to delete product.',
			});
		}
	};

	return (
		<div className='flex flex-col h-full'>
			<DragDropContext onDragEnd={onDragEnd}>
				<div className='flex-1 overflow-x-auto'>
					<div className='flex gap-4 h-full'>
						<KanbanColumn id='notStarted' title={dict.kanban.columns.notStarted} badgeColor='bg-red-500' products={products.notStarted} onDelete={onDelete} />
						<KanbanColumn
							id='inProgress'
							title={dict.kanban.columns.inProgress}
							badgeColor='bg-yellow-400'
							products={products.inProgress}
							onDelete={onDelete}
						/>
						<KanbanColumn
							id='done'
							title={dict.kanban.columns.done}
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
