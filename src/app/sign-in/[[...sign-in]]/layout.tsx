'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { isLoaded, user } = useUser();

	// If the user is already logged in, redirect to the kanban page
	useEffect(() => {
		if (isLoaded && user) {
			router.push('/dashboard/products');
		}
	}, [isLoaded, user, router]);

	// If the user is not loaded or not logged in, return null
	if (!isLoaded || !user) {
		return null;
	}

	return children;
}
