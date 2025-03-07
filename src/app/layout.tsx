'use client';

import { MyRuntimeProvider } from '@/app/MyRuntimeProvider';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import './globals.css';

import { Sidebar } from '@/components/app-sidebar';
import { WhatsAppSidebar } from '@/components/whatsapp-sidebar';
import { seamstresses } from '@/types/seamstress';
import { MessageCircle } from 'lucide-react';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import './globals.css';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true
});

function MainContent({ children }: { children: ReactNode }) {
	const { user, isLoaded } = useUser();

	console.log('Clerk user', user);
	const pathname = usePathname();
	const router = useRouter();

	console.log('Pathname', pathname);

	const [, setSelectedSeamstress] = useState(seamstresses[0]);
	const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

	const isSignInPage = pathname?.includes('sign-in');

	useEffect(() => {
		if (isLoaded && user && isSignInPage) {
			router.push('/kanban');
		}
	}, [isLoaded, user, isSignInPage, router]);

	if (isSignInPage) {
		return <div className='min-h-screen'>{children}</div>;
	}

	return (
		<div className='flex h-screen'>
			<Sidebar />
			<main className='flex-1'>{children}</main>
			<div className='fixed right-4 bottom-4'>
				<button
					onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
					className='bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors'
				>
					<MessageCircle className='w-6 h-6' />
				</button>
			</div>
			{isWhatsAppOpen && <WhatsAppSidebar seamstresses={seamstresses} setSelectedSeamstress={setSelectedSeamstress} onClose={() => setIsWhatsAppOpen(false)} />}
		</div>
	);
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<ClerkProvider>
			<MyRuntimeProvider>
				<html lang='en' suppressHydrationWarning>
					<body className={inter.className}>
						<MainContent>{children}</MainContent>
					</body>
				</html>
			</MyRuntimeProvider>
		</ClerkProvider>
	);
}
