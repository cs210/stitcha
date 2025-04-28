'use client';

import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { SeamstressProductCard } from '@/components/custom/seamstress/seamstress-product-card';
import { SeamstressProfile } from '@/components/custom/seamstress/seamstress-profile';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, Progress, User } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: seamstressId } = use(params);
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);
	const [seamstress, setSeamstress] = useState<User | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [progressUpdates, setProgressUpdates] = useState<Progress[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isKitModalOpen, setIsKitModalOpen] = useState(false);
	const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({});
	const [kitMaterials, setKitMaterials] = useState<{material_id: string, material_name: string, units: number}[]>([]);

	useEffect(() => {
		if (!user) return;

		(async () => {
			console.log("seamstressId", seamstressId);
			
			// Get seamstress details
			const seamstressResponse = await fetch(`/api/seamstresses/${seamstressId}`);
			const { data: seamstressData, error: seamstressError } = await seamstressResponse.json();

			if (!seamstressError) {
				const { product_users, ...seamstressWithoutProducts } = seamstressData;
				setSeamstress(seamstressWithoutProducts);

				// Set products from seamstress data
				if (product_users && product_users.length > 0) {
					// Fetch products data
					const productsResponse = await fetch(`/api/seamstresses/${seamstressId}/products`);
					const { data: productsData, error: productsError } = await productsResponse.json();

					if (!productsError) {
						setProducts(productsData);
						
						// Fetch progress updates for each product
						const progressPromises = productsData.map((product: Product) =>
							fetch(`/api/products/${product.id}/progress`).then(res => res.json())
						);
						
						const progressResults = await Promise.all(progressPromises);
						const allProgressUpdates = progressResults
							.flatMap(result => result.data || [])
							.filter(update => update.user_id === seamstressId)
							.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
						
						setProgressUpdates(allProgressUpdates);
					}
				}
			}

			setLoading(false);
		})();
	}, [user, seamstressId]);

	// const handleKitValidation = async (product: Product) => {
	// 	try {
	// 		setSelectedProduct(product);
	// 		setCheckedItems({}); // Reset checked items
			
	// 		// Fetch materials for specific product from join table
	// 		const response = await fetch(`/api/products/raw_materials`);
	// 		if (!response.ok) throw new Error('Failed to fetch kit materials');
			
	// 		const { data } = await response.json();

	// 		const productRawMaterials = await fetch(`/api/product-raw-materials`);
	// 		const { data: productRawMaterialsData } = await productRawMaterials.json();

	// 		const filteredProductRawMaterials = productRawMaterialsData.filter((item: any) => item.product_id === product.id);

	// 		const filteredRawMaterials = data.filter((item: any) => filteredProductRawMaterials.some((rawMaterial: any) => rawMaterial.material_code === item.material_id));

	// 		console.log("filteredProductRawMaterials", filteredProductRawMaterials);
	// 		console.log("filteredRawMaterials", filteredRawMaterials);

	// 		setKitMaterials(filteredRawMaterials || []);
	// 		setIsKitModalOpen(true);
	// 	} catch (error) {
	// 		console.error('Error fetching kit materials:', error);
	// 	}
	// };

	// Loading state
	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<>
			<HeaderContainer>
				<Header text={`${seamstress?.first_name} ${seamstress?.last_name}`} />
				<Description text={`${seamstress?.location}`} />
			</HeaderContainer>

			<div className='py-4'>
				<div className='flex flex-wrap gap-6'>
					{seamstress && <SeamstressProfile seamstress={seamstress} />}

					{products && products.length > 0 && (
						<div className='w-full mt-8'>
							<h3 className='text-xl font-semibold mb-4'>Assigned Products</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{products.map((product) => (
									<>
										<SeamstressProductCard key={product.id} product={product} />

										<div key={product.id} className='bg-white rounded-lg p-6 border hover:border-gray-300 transition-colors flex flex-col h-full'>
											<div className='w-full h-48 rounded-lg overflow-hidden mb-4'>
												<Image src={product.image_urls[0] || ''} alt={product.name} className='w-full h-full object-cover' width={100} height={100} />
											</div>
											<Link href={`/dashboard/products/${product.id}`}>
												<h4 className='text-lg font-semibold mb-2 hover:text-blue-600'>{product.name}</h4>
											</Link>
											<p className='text-gray-600 mb-3 flex-grow'>{product.description}</p>
											{/* <button
												onClick={() => handleKitValidation(product)}
												className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-auto'
											>
												Validate Kit
											</button> */}
										</div>
									</>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<Dialog open={isKitModalOpen} onOpenChange={setIsKitModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Kit Validation - {selectedProduct?.name}</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 mt-4'>
						{kitMaterials.length === 0 ? (
							<p className="text-gray-500 text-center py-4">No raw materials inputted for this product.</p>
						) : (
							kitMaterials.map((material, index) => (
								<div key={`material-${material.material_id}-${index}`} className='flex items-center space-x-2'>
									<Checkbox
										id={`material-${material.material_id}`}
										checked={checkedItems[material.material_id] || false}
										onCheckedChange={async (checked) => {
											setCheckedItems((prev) => ({
												...prev,
												[material.material_id]: checked === true
											}));

											// updates the raw material validation status
											const response = await fetch(`/api/products/raw_materials`, {
												method: 'PATCH',
												body: JSON.stringify({ 
													materialId: material.material_id, 
													validate_status: checked === true 
												})
											});

											if (!response.ok) {
												console.error('Failed to update validation status');
												// Revert the checkbox state if the API call fails
												setCheckedItems((prev) => ({
													...prev,
													[material.material_id]: false
												}));
											}
										}}
									/>
									<label
										htmlFor={`material-${material.material_id}`}
										className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
									>
										{material.material_name} (Units: {material.units})
									</label>
								</div>
							))
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
