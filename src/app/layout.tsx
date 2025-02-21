'use client';

import { ClerkProvider, useUser } from '@clerk/nextjs';
import './globals.css';

import { Sidebar } from '@/components/custom/sidebar';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

function RootContent({ children }: { children: ReactNode }) {
	const { user, isLoaded } = useUser();
	const pathname = usePathname();
	const router = useRouter();

	const isSignInPage = pathname?.includes('sign-in');

	useEffect(() => {
		if (isLoaded && user && isSignInPage) {
			router.push('/dashboard/products');
		}
	}, [isLoaded, user, isSignInPage, router]);

	// If the user is on the sign-in page, return the children
	if (isSignInPage) {
		return <div className='min-h-screen'>{children}</div>;
	}

	return (
		<div className='flex h-screen'>
			<Sidebar />
			<main className='flex-1 overflow-hidden'>{children}</main>
		</div>
	);
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<ClerkProvider>
			<html lang='en' suppressHydrationWarning>
				<body className={inter.className}>
					<RootContent>{children}</RootContent>
				</body>
			</html>
		</ClerkProvider>
	);
}
