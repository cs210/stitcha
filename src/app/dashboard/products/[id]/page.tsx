'use client';

import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { LoaderContainer } from '@/components/custom/loader-container';
import { Product, User } from '@/lib/schemas/global.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
	const unwrappedParams = use(params);
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [product, setProduct] = useState<Product | null>(null);
	const [users, setUsers] = useState<User[]>([]);
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

		getProduct();
	}, [unwrappedParams.id]);

	useEffect(() => {
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
		getUsers();
	}, []);

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
						<Image src={product?.image_url || ''} alt={product?.name || ''} className='w-full h-96 object-contain rounded-lg border' width={100} height={100} />
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
				</div>
			</div>
		</>
	);
}
