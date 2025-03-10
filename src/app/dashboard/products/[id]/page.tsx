'use client';

import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { LoaderContainer } from '@/components/custom/loader-container';
import { Product, Progress, User } from '@/lib/schemas/global.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
	const unwrappedParams = use(params);
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [product, setProduct] = useState<Product | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [progressUpdates, setProgressUpdates] = useState<Progress[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	useEffect(() => {
		async function getProduct() {
			try {
				const response = await fetch(`/api/products/${unwrappedParams.id}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error);
				}

				setProduct(data);

				setLoading(false);
			} catch (error) {
				console.error('Error fetching product:', error);
			} finally {
				setLoading(false);
			}
		}

		async function getUsers() {
			try {
				const response = await fetch('/api/users');
				const { data, error } = await response.json();
				if (!error) {
					setUsers(data);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		}

		async function getProgressUpdates() {
			try {
				const response = await fetch(`/api/products/${unwrappedParams.id}/progress`);
				const { data, error } = await response.json();

				if (!error) {
					console.log(data);

					setProgressUpdates(data);
				}
			} catch (error) {
				console.error('Error fetching progress:', error);
			}
		}

		getProduct();
		getUsers();
		getProgressUpdates();
	}, [unwrappedParams.id]);

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
				<Header text={product.name} />
			</HeaderContainer>

			<div className='py-4'>
				<div className='grid grid-cols-1 md:grid-cols-12 gap-8 max-w-7xl mx-auto'>
					<div className='md:col-span-6'>
						<Image
							src={product?.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder-image.jpg'}
							alt={product?.name || ''}
							className='w-full h-96 object-contain rounded-lg border'
							width={100}
							height={100}
						/>
					</div>
					<div className='md:col-span-6'>
						<div className='space-y-6'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
								<div className='space-y-4'>
									<p>
										<strong>System Code:</strong> {product?.system_code}
									</p>
									<p>
										<strong>Cert Number:</strong> {product?.inmetro_cert_number}
									</p>
									<p>
										<strong>Barcode:</strong> {product?.barcode}
									</p>
									<p>
										<strong>Product Type:</strong> {product?.product_type}
									</p>
								</div>
								<div className='space-y-3'>
									<p>
										<strong>Weight:</strong> {product?.weight} kg
									</p>
									<p>
										<strong>Width:</strong> {product?.width} cm
									</p>
									<p>
										<strong>Height:</strong> {product?.height} cm
									</p>
									<p>
										<strong>Lost %:</strong> {product?.percent_pieces_lost}%
									</p>
								</div>
							</div>

							<div>
								<p className='font-bold mb-2'>Description:</p>
								<p>{product?.description}</p>
							</div>
						</div>
					</div>

					<div className='md:col-span-12 mt-8'>
						<h2 className='text-xl font-bold mb-4'>Progress Updates</h2>
						{progressUpdates && progressUpdates.length > 0 ? (
							<div className='space-y-6'>
								{progressUpdates.map((update) => (
									<div key={update.id} className='border rounded-lg p-4 bg-white shadow-sm'>
										<div className='flex justify-between items-start mb-3'>
											<div>
												<p className='font-medium'>{new Date(update.created_at).toLocaleDateString()}</p>
												{update.emotion && <p className='text-sm text-gray-500'>Feeling: {update.emotion}</p>}
											</div>
										</div>
										<p className='mb-4'>{update.description}</p>
										{update.image_urls && update.image_urls.length > 0 && (
											<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
												{update.image_urls.map((image_url: string, index: number) => (
													<div key={index} className='relative aspect-square'>
														<Image
															src={image_url || ''}
															alt={`Progress update ${index + 1}`}
															className='rounded-md object-cover w-full h-full'
															width={200}
															height={200}
														/>
													</div>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						) : (
							<p className='text-gray-500'>No progress updates available for this product.</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
