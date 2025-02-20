'use client';

import type { Product, Seamstress } from '@/types/kanban';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { KanbanColumn } from './kanban-column';
import { Button } from './ui/button';

const seamstresses: Seamstress[] = [
	{
		id: '1',
		name: 'Alice',
		avatar: '/images/seamstress-1.jpeg',
	},
	{
		id: '2',
		name: 'Josephine',
		avatar: '/images/seamstress-2.jpeg',
	},
	{
		id: '3',
		name: 'Carol',
		avatar: '/images/seamstress-3.jpeg',
	},
	{
		id: '4',
		name: 'Beatriz',
		avatar: '/images/profile.png',
	},
	{
		id: '5',
		name: 'Eve',
		avatar: '/images/profile.png',
	},
];

export const initialProducts: Record<string, Product[]> = {
	paraFazer: [
		{
			id: 'product_1',
			title: 'Prototypes for a Bag',
			image: '/images/tote.png',
			type: 'Prototype',
			date: 'Aug 20, 2021',
			assignees: [seamstresses[2]],
			progress: '0/8',
		},
		{
			id: 'product_2',
			title: 'Brown Fluffy Blanket',
			image: '/images/blanket.png',
			type: 'Prototype',
			date: 'Aug 16, 2021',
			assignees: [seamstresses[3], seamstresses[4]],
			progress: '0/8',
		},
	],
	emAndamento: [
		{
			id: 'product_3',
			title: 'Black Plain T-Shirt',
			image: '/images/shirt.png',
			type: 'Prototype',
			date: 'Aug 20, 2021',
			assignees: [seamstresses[0], seamstresses[2]],
			progress: '0/8',
		},
	],
	revisao: [
		{
			id: 'product_4',
			title: 'Red Long-Sleeve Shirt',
			image: '/images/sweater.png',
			type: 'Prototype',
			date: 'Aug 16, 2021',
			assignees: [seamstresses[1], seamstresses[4]],
			progress: '0/8',
		},
	],
};

const createNewProduct = (): Product => ({
	id: `product_${Date.now()}`,
	title: 'Untitled',
	image: '/images/tote.png',
	type: 'Prototype',
	date: new Date().toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}),
	assignees: [],
	progress: '0/8',
	description: '',
	quantity: '0',
});

export function KanbanBoard() {
	const router = useRouter();
	const [products, setProducts] = useState<Record<string, Product[]>>(initialProducts);

	// Load initial state from localStorage
	useEffect(() => {
		const savedProducts = localStorage.getItem('kanbanProducts');
		if (savedProducts) {
			setProducts(JSON.parse(savedProducts));
		}
	}, []);

	// Listen for changes in localStorage
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'kanbanProducts' && e.newValue) {
				setProducts(JSON.parse(e.newValue));
			}
		};

		// Also listen for custom events for same-window updates
		const handleCustomEvent = () => {
			const savedProducts = localStorage.getItem('kanbanProducts');
			if (savedProducts) {
				setProducts(JSON.parse(savedProducts));
			}
		};

		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('productUpdated', handleCustomEvent);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('productUpdated', handleCustomEvent);
		};
	}, []);

	const onDragEnd = (result: DropResult) => {
		const { source, destination } = result;
		if (!destination) return;

		const newProducts = { ...products };
		const sourceColumn = [...newProducts[source.droppableId]];
		const destColumn = [...newProducts[destination.droppableId]];
		const [removed] = sourceColumn.splice(source.index, 1);
		destColumn.splice(destination.index, 0, removed);

		const updated = {
			...newProducts,
			[source.droppableId]: sourceColumn,
			[destination.droppableId]: destColumn,
		};

		setProducts(updated);
		localStorage.setItem('kanbanProducts', JSON.stringify(updated));
	};

	const assignSeamstress = (productId: string, seamstress: Seamstress) => {
		setProducts((prevProducts) => {
			const updatedProducts = { ...prevProducts };
			for (const column of Object.values(updatedProducts)) {
				const product = column.find((p) => p.id === productId);
				if (product) {
					if (!product.assignees.some((a) => a.id === seamstress.id)) {
						product.assignees = [...product.assignees, seamstress];
					}
					break;
				}
			}
			return updatedProducts;
		});
	};

	const deleteProduct = (productId: string) => {
		setProducts((prevProducts) => {
			const updatedProducts = { ...prevProducts };

			// Find and remove the product from its column
			for (const columnId in updatedProducts) {
				updatedProducts[columnId] = updatedProducts[columnId].filter((product) => product.id !== productId);
			}

			// Save to localStorage
			localStorage.setItem('kanbanProducts', JSON.stringify(updatedProducts));
			return updatedProducts;
		});
	};

	const addNewProduct = () => {
		const newProduct = createNewProduct();
		setProducts((prevProducts) => {
			const updated = {
				...prevProducts,
				paraFazer: [...prevProducts.paraFazer, newProduct],
			};
			localStorage.setItem('kanbanProducts', JSON.stringify(updated));
			return updated;
		});

		// Redirect to edit page immediately
		router.push(`/edit/${newProduct.id}`);
	};

	return (
		<div className='h-[calc(100vh-2rem)] p-6 flex flex-col'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>Produtos</h1>
				<Button size='default' variant='ghost' className='rounded-full hover:bg-primary hover:text-white px-6' onClick={addNewProduct}>
					<Plus className='h-5 w-5 mr-2' />
					Add Product
				</Button>
			</div>
			<DragDropContext onDragEnd={onDragEnd}>
				<div className='flex gap-6 overflow-x-auto pb-4 min-h-0 flex-1'>
					<KanbanColumn
						title='Para Fazer'
						id='paraFazer'
						products={products.paraFazer}
						seamstresses={seamstresses}
						onAssign={assignSeamstress}
						onDelete={deleteProduct}
					/>
					<KanbanColumn
						title='Em Andamento'
						id='emAndamento'
						products={products.emAndamento}
						seamstresses={seamstresses}
						onAssign={assignSeamstress}
						onDelete={deleteProduct}
					/>
					<KanbanColumn
						title='Revisão'
						id='revisao'
						products={products.revisao}
						seamstresses={seamstresses}
						onAssign={assignSeamstress}
						onDelete={deleteProduct}
					/>
				</div>
			</DragDropContext>
		</div>
	);
}
