'use client';

import { Loader } from '@/components/custom/loader';
import { Product } from '@/utils/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(false);
	const [product, setProduct] = useState<Product>();

	useEffect(() => {
		if (!user) return;

		// Anonymous function to fetch products from Supabase
		(async () => {
			setLoading(true);

			// const response = await fetch('/api/products');
			// const { data, error } = await response.json();

			// if (!error) {
			// 	setProduct(data);
			// }

			setLoading(false);
		})();
	}, [user]);

	// Loading state
	if (loading) return <Loader />;

	return (
		<div>
			<h1>Product {id}</h1>
		</div>
	);
}
