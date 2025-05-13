'use client';

import { MyRuntimeProvider } from '@/app/runtime-provider';
import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { createContext, useState } from 'react';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

export const LangContext = createContext<'en' | 'pt-br'>('en');

export default function Layout({ children }: { children: React.ReactNode }) {
	const [lang, setLang] = useState<'en' | 'pt-br'>('pt-br');

	return (
		<MyRuntimeProvider>
			<ClerkProvider>
				<LangContext.Provider value={{ lang, setLang }}>
					<html suppressHydrationWarning>
						<body className={inter.className}>{children}</body>
					</html>
				</LangContext.Provider>
			</ClerkProvider>
		</MyRuntimeProvider>
	);
}
