'use client';

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

export function KanbanBoard() {
	const [products, setProducts] = useState<Record<string, Product[]>>({
		notStarted: [],
		inProgress: [],
		done: [],
	});

	// Fetch products from API route on mount
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await fetch('/api/products');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				const { data } = result;

				// Map status to column IDs
				const getColumnId = (progress_level: string) => {
					return REVERSE_STATUS_MAPPING[progress_level as keyof typeof REVERSE_STATUS_MAPPING] || 'notStarted';
				};

				// Organize products by status and ensure unique IDs
				const organized = data.reduce(
					(acc: Record<string, Product[]>, product: Product) => {
						const columnId = getColumnId(product.progress_level);
						return {
							...acc,
							[columnId]: [
								...(acc[columnId] || []),
								{
									id: product.id,
									name: product.name || 'Untitled',
									system_code: product.system_code || '',
									barcode: product.barcode || '',
									inmetro_cert_number: product.inmetro_cert_number || '',
									image_urls: product.image_urls || [],
									product_type: product.product_type || 'Prototype',
								},
							],
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
		};

		fetchProducts();

		// Set up polling for updates every 30 seconds
		const intervalId = setInterval(fetchProducts, 30000);

		return () => clearInterval(intervalId);
	}, []);

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, draggableId } = result;
		if (!destination) return;

		const newProducts = { ...products };
		const sourceColumn = [...newProducts[source.droppableId]];
		const destColumn = source.droppableId === destination.droppableId ? sourceColumn : [...newProducts[destination.droppableId]];

		// Remove from source
		const [removed] = sourceColumn.splice(source.index, 1);

		// Add to destination
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
			} catch (error) {
				console.error('Error updating product status:', error);

				// Revert local state if update fails
				setProducts(newProducts);
			}
		}
	};

	const onDelete = async (productId: string) => {
		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete product');
			}

			// Update local state after successful deletion
			const newProducts = { ...products };

			Object.keys(newProducts).forEach((key) => {
				newProducts[key] = newProducts[key].filter((product) => product.id !== productId);
			});

			setProducts(newProducts);
		} catch (error) {
			console.error('Error deleting product:', error);
		}
	};

	return (
		<div className='flex flex-col h-full p-3'>
			<DragDropContext onDragEnd={onDragEnd}>
				<div className='flex-1 overflow-x-auto'>
					<div className='flex gap-6 pt-4 h-full'>
						<KanbanColumn title='Not Started' id='notStarted' products={products.notStarted} onDelete={onDelete} />
						<KanbanColumn title='In Progress' id='inProgress' products={products.inProgress} onDelete={onDelete} />
						<KanbanColumn title='Done' id='done' products={products.done} onDelete={onDelete} />
					</div>
				</div>
			</DragDropContext>
		</div>
	);
}
