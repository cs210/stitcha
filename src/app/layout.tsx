'use client';

import { LangContext } from '@/lib/lang/LangContext';
import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { useState } from 'react';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
	const [lang, setLang] = useState<'en' | 'pt-br'>('en');

	return (
		<ClerkProvider>
			<LangContext.Provider value={{ lang, setLang }}>
				<html suppressHydrationWarning>
					<body className={inter.className}>{children}</body>
				</html>
			</LangContext.Provider>
		</ClerkProvider>
	);
}
