import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<ClerkProvider>
			<html lang='en' suppressHydrationWarning>
				<body className={inter.className}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
