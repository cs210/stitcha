'use client';

import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const createNewProduct = (): any => ({
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
});

// Update the STATUS_MAPPING to have reverse mapping as well
const STATUS_MAPPING = {
	paraFazer: 'Not Started',
	emAndamento: 'In Progress',
	revisao: 'Done',
} as const;

const REVERSE_STATUS_MAPPING = {
	'Not Started': 'paraFazer',
	'In Progress': 'emAndamento',
	'Done': 'revisao',
} as const;

export function KanbanBoard() {
	const router = useRouter();
	const [products, setProducts] = useState<Record<string, any[]>>({
		paraFazer: [],
		emAndamento: [],
		revisao: [],
	});

	// Fetch products from Supabase on mount
	useEffect(() => {
		const fetchProducts = async () => {
			// const { data, error } = await supabase.from('products').select('*');

			// if (error) {
			// 	console.error('Error fetching products:', error);
			// 	return;
			// }

			// Map status to column IDs
			const getColumnId = (progress_level: string) => {
				return REVERSE_STATUS_MAPPING[progress_level as keyof typeof REVERSE_STATUS_MAPPING] || 'paraFazer';
			};

			// Organize products by status, ensuring we use the correct ID from Supabase
			// const organized = data.reduce(
			// 	(acc, product) => {
			// 		const columnId = getColumnId(product.progress_level);
			// 		return {
			// 			...acc,
			// 			[columnId]: [
			// 				...(acc[columnId] || []),
			// 				{
			// 					id: product.id.toString(), // Ensure ID is a string and from Supabase
			// 					title: product.name || 'Untitled',
			// 					image: product.image_url,
			// 					type: product.type || 'Prototype',
			// 					date: new Date(product.created_at).toLocaleDateString('en-US', {
			// 						month: 'short',
			// 						day: 'numeric',
			// 						year: 'numeric',
			// 					}),
			// 					assignees: product.assignees || [],
			// 					progress: product.progress_level || 'Not Started',
			// 					description: product.description || '',
			// 					quantity: product.quantity?.toString() || '0',
			// 				},
			// 			],
			// 		};
			// 	},
			// 	{
			// 		paraFazer: [],
			// 		emAndamento: [],
			// 		revisao: [],
			// 	}
			// );

			// setProducts(organized);
		};

		fetchProducts();

		// Subscribe to changes
		// const channel = supabase
		// 	.channel('products_changes')
		// 	.on(
		// 		'postgres_changes',
		// 		{
		// 			event: '*',
		// 			schema: 'public',
		// 			table: 'products',
		// 		},
		// 		() => {
		// 			fetchProducts();
		// 		}
		// 	)
		// 	.subscribe();

		// return () => {
		// 	channel.unsubscribe();
		// };
	}, []);

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, draggableId } = result;
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

		// Update local state
		setProducts(updated);

		// Update Supabase with new status
		// try {
		// 	const newStatus = STATUS_MAPPING[destination.droppableId as keyof typeof STATUS_MAPPING];
		// 	console.log(newStatus);
		// 	console.log(draggableId);
		// 	await supabase
		// 		.from('products')
		// 		.update({
		// 			progress_level: newStatus,
		// 		})
		// 		.eq('id', draggableId);
		// } catch (error) {
		// 	console.error('Error updating product status:', error);
		// 	setProducts(newProducts);
		// }
	};

	// const deleteProduct = async (productId: string) => {
	// 	try {
	// 		console.log('Deleting product with ID:', productId);
	// 		const { error } = await supabase.from('products').delete().eq('id', productId); // Don't convert to number, keep as string UUID

	// 		if (error) {
	// 			console.error('Supabase delete error:', error);
	// 			throw error;
	// 		}

	// 		// If successful, update local state
	// 		setProducts((prevProducts) => {
	// 			const updatedProducts = { ...prevProducts };
	// 			for (const columnId in updatedProducts) {
	// 				updatedProducts[columnId] = updatedProducts[columnId].filter((product) => product.id !== productId);
	// 			}
	// 			return updatedProducts;
	// 		});
	// 	} catch (error) {
	// 		console.error('Error deleting product:', error);
	// 		alert('Failed to delete product');
	// 	}
	// };

	const addNewProduct = async () => {
		const defaultImage = 'default-product.png';

		const newProduct = {
			name: 'Untitled',
			image_url: defaultImage,
			type: 'Prototype',
			progress_level: 'Not Started',
			created_at: new Date().toISOString(),
			assignees: [],
			progress: '0/8',
			description: '',
			quantity: 0,
		};

		// try {
		// 	const { data, error } = await supabase.from('products').insert(newProduct).select().single();

		// 	if (error) throw error;
		// 	router.push(`/edit/${data.id}`);
		// } catch (error) {
		// 	console.error('Error creating product:', error);
		// }
	};

	// const assignSeamstress = async (productId: string, seamstress: any) => {
	// 	try {
	// 		// Find the product to update its assignees
	// 		let productToUpdate = null;
	// 		for (const column of Object.values(products)) {
	// 			const found = column.find((p) => p.id === productId);
	// 			if (found) {
	// 				productToUpdate = found;
	// 				break;
	// 			}
	// 		}

	// 		if (!productToUpdate) return;

	// 		// Create new assignees array without duplicates
	// 		const newAssignees = productToUpdate.assignees.some((a) => a.id === seamstress.id)
	// 			? productToUpdate.assignees
	// 			: [...productToUpdate.assignees, seamstress];

	// 		// Update Supabase
	// 		const { error } = await supabase.from('products').update({ assignees: newAssignees }).eq('id', productId);

	// 		if (error) throw error;

	// 		// Update local state
	// 		setProducts((prevProducts) => {
	// 			const updatedProducts = { ...prevProducts };
	// 			for (const columnId in updatedProducts) {
	// 				updatedProducts[columnId] = updatedProducts[columnId].map((product) =>
	// 					product.id === productId ? { ...product, assignees: newAssignees } : product
	// 				);
	// 			}
	// 			return updatedProducts;
	// 		});
	// 	} catch (error) {
	// 		console.error('Error assigning seamstress:', error);
	// 	}
	// };

	return (
		<div className='h-screen flex flex-col'>
			<div className='p-6 pb-2'>
				<div className='flex items-center justify-between'>
					<h1 className='text-2xl font-bold'>Produtos</h1>
					<Button size='default' variant='ghost' className='rounded-full hover:bg-primary hover:text-white px-6' onClick={addNewProduct}>
						<Plus className='h-5 w-5 mr-2' />
						Add Product
					</Button>
				</div>
			</div>

			<DragDropContext onDragEnd={onDragEnd}>
				<div className='flex-1 overflow-x-auto'>
					<div className='flex gap-6 p-6 pt-0 h-full'>
						{/* <KanbanColumn
							title='Not Started'
							id='paraFazer'
							products={products.paraFazer}
							seamstresses={seamstresses}
							onAssign={assignSeamstress}
							onDelete={deleteProduct}
						/>
						<KanbanColumn
							title='In Progress'
							id='emAndamento'
							products={products.emAndamento}
							seamstresses={seamstresses}
							onAssign={assignSeamstress}
							onDelete={deleteProduct}
						/>
						<KanbanColumn
							title='Done'
							id='revisao'
							products={products.revisao}
							seamstresses={seamstresses}
							onAssign={assignSeamstress}
							onDelete={deleteProduct}
						/> */}
					</div>
				</div>
			</DragDropContext>
		</div>
	);
}
